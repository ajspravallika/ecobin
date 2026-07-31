# CleanVillage AI — Full Stack (MERN)

**Smart Waste Monitoring and Collection System** for a Municipality / Gram
Panchayat. IoT-based (ESP32 + HC-SR04 ultrasonic sensor per bin), with a
React dashboard and an Express/MongoDB backend.

This single folder contains both halves of the project:

```
cleanvillage-ai-fullstack/
├── frontend/     # React + Vite + Tailwind + Recharts + Framer Motion
│                 # (currently wired to an in-memory Firebase-style simulation)
├── backend/      # Node + Express + MongoDB/Mongoose + JWT + Socket.io
│                 # (real REST API, database, and ESP32 ingest endpoint)
└── package.json  # convenience scripts to run both at once
```

Each half also has its own detailed `README.md` — `frontend/README.md` and
`backend/README.md` — for anything not covered here.

## Quick start

### 1. Install everything

```bash
npm run install:all
```

(equivalent to `npm install` inside both `frontend/` and `backend/`)

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
# edit .env — set MONGO_URI, JWT_SECRET, DEVICE_API_KEY, CLIENT_URL
```

Make sure MongoDB is running locally, or point `MONGO_URI` at an Atlas
cluster.

### 3. Seed demo data

```bash
npm run seed
```

Creates 5 villages, 5 workers, 100 bins, and 3 demo login accounts
(Administrator / Municipality Officer / Waste Collection Worker) — see
`backend/README.md` for the credentials.

### 4. Run both apps together

From the project root:

```bash
npm run dev
```

This starts the backend API (`http://localhost:5000`) and the frontend dev
server (`http://localhost:5173`) side by side. Or run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Connecting the frontend to the backend

Out of the box, the frontend's `src/firebase/binsService.js` uses an
in-memory simulated store (no backend calls) — that's how it was designed to
demo standalone. To make it talk to the real `backend/` API instead:

1. In `frontend/`, add `VITE_API_URL=http://localhost:5000/api` to a `.env`
   file.
2. Point `AuthContext` at `POST /api/auth/login` and `GET /api/auth/me`
   instead of the local demo login.
3. Point `binsService.js`'s functions (`getBins`, `addBin`, `updateBin`,
   `deleteBin`) at the matching REST endpoints under `/api/bins`.
4. Point the fill-level slider / "Mark as Collected" actions at
   `PATCH /api/bins/:binId/fill` and `PATCH /api/bins/:binId/collect`.
5. Optionally add `socket.io-client` to receive live `bin:update`,
   `notification:new`, and `stats:update` events instead of polling.

Full endpoint-by-endpoint mapping and payload shapes are documented in
`backend/README.md`.

## The IoT workflow this implements

```
Ultrasonic Sensor measures distance
        ↓
ESP32 calculates fill percentage
        ↓
ESP32 sends { binId, fillLevel }  →  POST /api/esp32/data
        ↓
Backend resolves village / ward / landmark by Bin ID (no GPS needed)
        ↓
Status recomputed → notification generated on crossing into
Almost Full / Full → dashboard updates live via Socket.io
        ↓
Worker collects the bin → PATCH /api/bins/:binId/collect
        ↓
Fill resets to 0%, history logged, notification cleared
```
