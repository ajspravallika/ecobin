# CleanVillage AI

**Smart Waste Monitoring and Collection System** — a production-quality dashboard
for a Municipality / Gram Panchayat to monitor IoT-enabled garbage bins.

This is a **simulation**: no real ESP32 hardware or live Firebase project is
required. Every bin's ultrasonic sensor reading is simulated with a slider or
the built-in **Auto Simulation** mode, and the data layer is written to mirror
Firestore's shape so a real backend can be dropped in later with minimal
changes (see `src/firebase/`).

## How it works

Every bin only ever needs to report two things:

```json
{ "binId": "BIN-023", "fillLevel": 95 }
```

No GPS module is needed — the website already stores each Bin ID's village,
ward, and landmark. So the moment a reading comes in, CleanVillage AI resolves
the Bin ID to a real-world location, updates its status (Normal / Almost Full
/ Full), and — if the bin just crossed into Almost Full or Full — raises a
notification for the Municipality dashboard.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

To build a production bundle:

```bash
npm run build
npm run preview
```

## Signing in

This prototype uses a simulated login — pick a role, no password needed:

- **Administrator** — full access, bin registry, settings
- **Municipality Officer** — dashboard, bins, reports, notifications
- **Waste Collection Worker** — only sees bins assigned to them, with a
  "Mark as Collected" action

## Project structure

```
src/
  components/
    layout/        Sidebar, Topbar, DashboardLayout (route shell)
    common/         BinGauge (signature fill visual), StatCard, Badge,
                    NotificationBell, SearchBar, FillLevelSlider, Modal,
                    EmptyState, BinForm
    charts/         Pie / Bar / Line charts (Recharts)
  context/
    ThemeContext    Dark/light mode, persisted
    AuthContext     Simulated role-based login
    AppContext      Bins, notifications, collection history, Auto Simulation
  data/
    villages.js     5 villages + landmark list (the "Bin ID -> location" registry)
    workers.js       5 collection workers
    bins.js          Generates the 100-bin seed dataset (20 per village)
  firebase/
    firebaseConfig.js  Placeholder config + notes on going live
    binsService.js     Firestore-shaped CRUD functions over an in-memory store
  pages/            Login, Dashboard, BinManagement, AddBin, EditBin,
                    BinDetails, NotificationCenter, WorkerDashboard,
                    CollectionHistory, Reports, Settings, NotFound
  utils/
    binHelpers.js   Status thresholds, colors, priority, time-ago formatting
```

## Simulating sensor data

- Open any bin's detail page and drag the **fill level slider** — this is the
  simulated ESP32 reading. Crossing 71% or 90% automatically raises a
  notification.
- Toggle **Auto Simulation** from the top bar (or Settings) to have random
  bins gradually fill on their own, so the dashboard looks live during a demo.

## Going live with Firebase

`src/firebase/firebaseConfig.js` documents the exact steps: install the
`firebase` package, fill in your project credentials, and swap the bodies of
the functions in `binsService.js` for real Firestore calls. Because those
function signatures already match what a Firestore-backed version would look
like, no other file needs to change.
