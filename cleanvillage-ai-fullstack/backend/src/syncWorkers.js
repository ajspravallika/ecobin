/**
 * Manually backfills Worker profiles for any User accounts with role
 * "Waste Collection Worker" that don't have one yet. This runs
 * automatically on every server startup (see server.js), so you normally
 * don't need this — it's here in case you want to run it on demand.
 *
 * Run with: npm run sync:workers --prefix backend
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { syncWorkersFromUsers } = require('../utils/workerSync');

async function main() {
  await connectDB();
  const created = await syncWorkersFromUsers();
  console.log(created > 0 ? `Done — created ${created} Worker profile(s).` : 'Done — everything was already in sync.');
  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
