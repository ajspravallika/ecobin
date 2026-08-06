const User = require('../models/User');
const Worker = require('../models/Worker');
const { ROLES } = require('../config/constants');

/**
 * ROOT CAUSE of "Assign Worker dropdown always says No workers available":
 *
 * The app has two separate collections for a worker:
 *   - User   (login account: email/password/role)
 *   - Worker (assignment profile: workerId/name/phone — what bins actually
 *             reference via assignedWorkerId, and what GET /api/workers /
 *             the dropdown reads from)
 *
 * They were never kept in sync. Registering a login account with
 * role: "Waste Collection Worker" created a User document only — nothing
 * ever created the matching Worker document, so the Worker collection
 * stayed empty even though worker *accounts* clearly existed, and the
 * dropdown (which correctly queries the Worker collection) had nothing to
 * show.
 *
 * Fix has two parts:
 *   1. syncWorkerProfile(user) — called right after a Worker-role User is
 *      registered (see authController.register), so every NEW worker
 *      account immediately gets a matching Worker profile.
 *   2. syncWorkersFromUsers() — a one-time backfill run automatically at
 *      server startup (see server.js) that creates Worker profiles for
 *      any EXISTING Worker-role Users that don't have one yet. This is
 *      what fixes the dropdown for accounts already sitting in Atlas.
 *
 * Both are idempotent — safe to run repeatedly, will never create
 * duplicates.
 */

function nextWorkerId(existingIds) {
  let n = 1;
  const taken = new Set(existingIds);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = `WRK-${String(n).padStart(2, '0')}`;
    if (!taken.has(candidate)) return candidate;
    n += 1;
  }
}

/**
 * Ensures a single User (role: Waste Collection Worker) has a matching
 * Worker profile document. Creates/repairs the User's workerId if needed
 * so Bin.assignedWorkerId can reference it. Returns the Worker doc.
 */
async function syncWorkerProfile(user) {
  if (!user || user.role !== ROLES.WORKER) return null;

  // Reuse the user's existing workerId if they already have one and it
  // points at a real (or creatable) Worker profile.
  let workerId = user.workerId;

  if (workerId) {
    const existing = await Worker.findOne({ workerId });
    if (existing) return existing;
  }

  if (!workerId) {
    const existingIds = (await Worker.find({}, 'workerId')).map((w) => w.workerId);
    workerId = nextWorkerId(existingIds);
    user.workerId = workerId;
    await user.save();
  }

  const worker = await Worker.create({
    workerId,
    name: user.name,
    phone: user.phone || 'N/A',
    villages: [],
    isActive: user.isActive,
  });

  return worker;
}

/**
 * Backfill: creates Worker profiles for every existing Worker-role User
 * that doesn't have one yet. Safe to call on every server startup — it's
 * a no-op once every worker account has been synced.
 */
async function syncWorkersFromUsers() {
  const workerUsers = await User.find({ role: ROLES.WORKER });
  let created = 0;

  for (const user of workerUsers) {
    // eslint-disable-next-line no-await-in-loop
    const existing = user.workerId ? await Worker.findOne({ workerId: user.workerId }) : null;
    if (existing) continue;
    // eslint-disable-next-line no-await-in-loop
    await syncWorkerProfile(user);
    created += 1;
  }

  if (created > 0) {
    console.log(`[workerSync] Backfilled ${created} Worker profile(s) from existing worker accounts.`);
  }

  return created;
}

module.exports = { syncWorkerProfile, syncWorkersFromUsers };
