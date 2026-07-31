/**
 * Seeds the database with demo data that mirrors the frontend's
 * src/data/{villages,workers,bins}.js generators:
 *   - 5 villages (Gram Panchayats)
 *   - 5 workers, each covering one or two villages
 *   - 100 bins, 20 per village, weighted mostly Normal with some
 *     Almost Full / Full / Offline, to make the dashboard look alive
 *   - one demo login user per role (Administrator, Municipality Officer,
 *     Waste Collection Worker)
 *
 * Run with:  npm run seed
 * Wipe with: npm run seed:destroy
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Village = require('../models/Village');
const Worker = require('../models/Worker');
const Bin = require('../models/Bin');
const User = require('../models/User');
const { getStatusFromFill, ROLES, SENSOR_STATUS } = require('../config/constants');

const VILLAGES = [
  { villageId: 'kothapeta', name: 'Kothapeta', ward: 'Ward 4', mandal: 'Ravulapalem Mandal' },
  { villageId: 'ravulapalem', name: 'Ravulapalem', ward: 'Ward 2', mandal: 'Ravulapalem Mandal' },
  { villageId: 'mandapeta', name: 'Mandapeta', ward: 'Ward 7', mandal: 'Mandapeta Mandal' },
  { villageId: 'devarapalli', name: 'Devarapalli', ward: 'Ward 1', mandal: 'Devarapalli Mandal' },
  { villageId: 'anaparthi', name: 'Anaparthi', ward: 'Ward 5', mandal: 'Anaparthi Mandal' },
];

const LANDMARKS = [
  'Near Government School',
  'Near Primary Health Centre',
  'Panchayat Office Road',
  'Near Bus Stand',
  'Market Yard Entrance',
  'Temple Street',
  'Near Anganwadi Centre',
  'Canal Road Junction',
  'Near Rice Mill',
  'Housing Colony Gate',
  'Near Water Tank',
  'Church Street',
  'Weavers Colony',
  'Near Veterinary Hospital',
  'Railway Gate Road',
  'Co-operative Bank Street',
  'Near Community Hall',
  'Fish Market Lane',
  'Old Bridge Road',
  'Government Hospital Backgate',
];

const WORKERS = [
  { workerId: 'WRK-01', name: 'Ramesh Babu', villages: ['kothapeta', 'ravulapalem'], phone: '9876500011' },
  { workerId: 'WRK-02', name: 'Suresh Kumar', villages: ['mandapeta'], phone: '9876500012' },
  { workerId: 'WRK-03', name: 'Lakshmi Prasanna', villages: ['devarapalli'], phone: '9876500013' },
  { workerId: 'WRK-04', name: 'Venkata Rao', villages: ['anaparthi'], phone: '9876500014' },
  { workerId: 'WRK-05', name: 'Anil Kumar', villages: ['kothapeta', 'mandapeta'], phone: '9876500015' },
];

const BINS_PER_VILLAGE = 20;

// Deterministic pseudo-random so the seeded dataset looks the same on
// every run (matches the frontend's seededRandom(42) demo generator).
function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function buildBins() {
  const bins = [];
  let globalIndex = 1;
  const rand = seededRandom(42);

  VILLAGES.forEach((village, vIdx) => {
    const eligibleWorkers = WORKERS.filter((w) => w.villages.includes(village.villageId));
    for (let i = 0; i < BINS_PER_VILLAGE; i += 1) {
      const binNumber = String(globalIndex).padStart(3, '0');
      const binId = `BIN-${binNumber}`;
      const landmark = LANDMARKS[(vIdx * BINS_PER_VILLAGE + i) % LANDMARKS.length];
      const worker = eligibleWorkers.length
        ? eligibleWorkers[i % eligibleWorkers.length]
        : WORKERS[globalIndex % WORKERS.length];

      const roll = rand();
      let fillLevel;
      if (roll > 0.93) fillLevel = 90 + Math.floor(rand() * 10); // full
      else if (roll > 0.75) fillLevel = 71 + Math.floor(rand() * 19); // almost full
      else fillLevel = Math.floor(rand() * 70); // normal

      const isOffline = rand() > 0.95;
      const minutesAgo = Math.floor(rand() * 600);

      bins.push({
        binId,
        villageId: village.villageId,
        village: village.name,
        mandal: village.mandal,
        ward: village.ward,
        landmark,
        assignedWorkerId: worker.workerId,
        assignedWorkerName: worker.name,
        sensorStatus: isOffline ? SENSOR_STATUS.OFFLINE : SENSOR_STATUS.ONLINE,
        fillLevel,
        status: isOffline ? 'Offline' : getStatusFromFill(fillLevel),
        lastUpdated: new Date(Date.now() - minutesAgo * 60000),
        binType: i % 5 === 0 ? 'Bulk Community Bin' : 'Household Cluster Bin',
        capacityLiters: i % 5 === 0 ? 500 : 120,
      });
      globalIndex += 1;
    }
  });

  return bins;
}

async function seed() {
  await connectDB();

  console.log('Clearing existing collections...');
  await Promise.all([
    Village.deleteMany({}),
    Worker.deleteMany({}),
    Bin.deleteMany({}),
    User.deleteMany({}),
  ]);

  console.log('Seeding villages...');
  await Village.insertMany(VILLAGES);

  console.log('Seeding workers...');
  await Worker.insertMany(WORKERS);

  console.log('Seeding 100 bins across 5 villages...');
  await Bin.insertMany(buildBins());

  console.log('Seeding demo login users...');
  await User.create([
    {
      name: 'A. Chandra Sekhar',
      email: 'admin@cleanvillage.ai',
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
      role: ROLES.ADMIN,
      title: 'System Administrator',
    },
    {
      name: 'K. Padmavathi',
      email: 'officer@cleanvillage.ai',
      password: process.env.SEED_OFFICER_PASSWORD || 'Officer@12345',
      role: ROLES.OFFICER,
      title: 'Municipal Sanitation Officer',
    },
    {
      name: WORKERS[0].name,
      email: 'worker@cleanvillage.ai',
      password: process.env.SEED_WORKER_PASSWORD || 'Worker@12345',
      role: ROLES.WORKER,
      title: 'Waste Collection Worker',
      workerId: WORKERS[0].workerId,
      phone: WORKERS[0].phone,
    },
  ]);

  console.log('\nSeed complete:');
  console.log('  Villages: 5');
  console.log('  Workers:  5');
  console.log('  Bins:     100');
  console.log('  Demo logins:');
  console.log('    admin@cleanvillage.ai    /', process.env.SEED_ADMIN_PASSWORD || 'Admin@12345');
  console.log('    officer@cleanvillage.ai  /', process.env.SEED_OFFICER_PASSWORD || 'Officer@12345');
  console.log('    worker@cleanvillage.ai   /', process.env.SEED_WORKER_PASSWORD || 'Worker@12345');

  await mongoose.connection.close();
  process.exit(0);
}

async function destroy() {
  await connectDB();
  console.log('Destroying all CleanVillage AI collections...');
  await Promise.all([
    Village.deleteMany({}),
    Worker.deleteMany({}),
    Bin.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log('Done.');
  await mongoose.connection.close();
  process.exit(0);
}

if (process.argv.includes('--destroy')) {
  destroy();
} else {
  seed();
}
