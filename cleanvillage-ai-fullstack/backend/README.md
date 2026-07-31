# CleanVillage AI — Backend (MERN)

Node.js + Express + MongoDB (Mongoose) backend for **CleanVillage AI**, the
Smart Waste Monitoring and Collection System. This is the server counterpart
to the React frontend you already have — it replaces the frontend's
simulated `firebase/binsService.js` in-memory store with a real MongoDB
database, JWT authentication, and live Socket.io updates.

## How it maps to the IoT workflow

```
Ultrasonic Sensor measures distance
        ↓
ESP32 calculates fill percentage
        ↓
ESP32 sends { binId, fillLevel }  →  POST /api/esp32/data  (x-device-key auth)
        ↓
Backend finds the bin by binId (no GPS needed — location is looked up)
        ↓
Status recomputed (Normal / Almost Full / Full)
        ↓
Notification auto-generated on crossing into Almost Full / Full
        ↓
Socket.io broadcasts bin:update, notification:new, stats:update
        ↓
Municipality dashboard updates live
        ↓
Worker sees the task on their dashboard → PATCH /api/bins/:binId/collect
        ↓
Fill resets to 0%, history logged, notification cleared, dashboard updates
```

## Tech stack

- **Express** — REST API
- **MongoDB / Mongoose** — persistence (Bin, Village, Worker, User, Notification, CollectionHistory)
- **JWT (jsonwebtoken + bcryptjs)** — authentication, role-based authorization
- **Socket.io** — real-time push to the dashboard (bin updates, new notifications, stat changes)
- **helmet, cors, express-mongo-sanitize, express-rate-limit** — baseline security hardening

## Project structure

```
cleanvillage-backend/
├── server.js                     # app bootstrap, middleware, route mounting, socket.io
├── .env.example
├── src/
│   ├── config/
│   │   ├── db.js                 # mongoose connection
│   │   └── constants.js          # ROLES, STATUS, SENSOR_STATUS, PRIORITY, thresholds
│   ├── models/
│   │   ├── User.js                # login accounts (Admin / Officer / Worker)
│   │   ├── Village.js             # Bin ID -> location lookup source
│   │   ├── Worker.js              # worker profiles (not login accounts)
│   │   ├── Bin.js                 # core entity — one doc per ESP32 unit
│   │   ├── Notification.js
│   │   └── CollectionHistory.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── binController.js
│   │   ├── villageController.js
│   │   ├── workerController.js
│   │   ├── notificationController.js
│   │   ├── historyController.js
│   │   ├── dashboardController.js     # stats + pie/bar/line chart data
│   │   └── simulationController.js    # ESP32 ingest + auto-simulation
│   ├── middleware/
│   │   ├── auth.js                # protect, authorize(...roles), verifyDeviceKey
│   │   └── errorHandler.js
│   ├── routes/                    # one file per resource, mounted in server.js
│   ├── socket/index.js            # Socket.io init + emit helpers
│   ├── utils/
│   │   ├── binEngine.js           # applyFillLevel() + markCollected() — shared logic
│   │   ├── stats.js               # dashboard counters
│   │   └── generateToken.js
│   └── seed/seedData.js           # 5 villages, 5 workers, 100 bins, 3 demo users
```

## Setup

```bash
cd cleanvillage-backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, DEVICE_API_KEY, CLIENT_URL

# make sure MongoDB is running locally, or point MONGO_URI at Atlas

npm run seed     # creates 5 villages, 5 workers, 100 bins, 3 demo logins
npm run dev       # starts the API with nodemon on http://localhost:5000
```

Demo logins created by the seed script:

| Role                    | Email                     | Password         |
|--------------------------|---------------------------|-------------------|
| Administrator             | admin@cleanvillage.ai      | Admin@12345       |
| Municipality Officer       | officer@cleanvillage.ai    | Officer@12345     |
| Waste Collection Worker    | worker@cleanvillage.ai     | Worker@12345      |

(Passwords are configurable via `SEED_ADMIN_PASSWORD` / `SEED_OFFICER_PASSWORD` / `SEED_WORKER_PASSWORD` in `.env`.)

## Connecting the existing React frontend

The frontend currently talks to `src/firebase/binsService.js`, an in-memory
simulation. To go live against this backend:

1. Add an API client (e.g. `src/api/client.js` using `fetch`/`axios`) pointed
   at `VITE_API_URL=http://localhost:5000/api`, sending the JWT as
   `Authorization: Bearer <token>`.
2. Replace the bodies of `getBins`, `getBinById`, `addBin`, `updateBin`,
   `deleteBin` in `binsService.js` with calls to `GET/POST/PUT/DELETE
   /api/bins` — the function signatures already match 1:1, same as the
   Firebase migration comment in that file describes.
3. Replace `AuthContext`'s local demo login with `POST /api/auth/login` /
   `GET /api/auth/me`.
4. Replace the client-side `AppContext` fill-level slider and auto-simulation
   with `PATCH /api/bins/:binId/fill` and `POST /api/simulation/start` —
   or keep the slider purely client-side for offline demos and only call the
   API when you want it persisted.
5. Add a `socket.io-client` connection to receive `bin:update`,
   `notification:new`, and `stats:update` events for live dashboard updates
   instead of polling.

## API reference

All endpoints are prefixed with `/api`. Protected routes require
`Authorization: Bearer <token>` (or the `token` cookie set on login).

### Auth
| Method | Route              | Access  | Description |
|--------|--------------------|---------|--------------|
| POST   | `/auth/register`    | Public  | Create a user account |
| POST   | `/auth/login`       | Public  | Returns `{ token, user }` |
| GET    | `/auth/me`          | Private | Current user profile |
| POST   | `/auth/logout`      | Private | Clears auth cookie |

### Bins (Bin Management / Add / Edit / Details)
| Method | Route                          | Access                | Description |
|--------|--------------------------------|------------------------|--------------|
| GET    | `/bins`                        | Private                | List + filter (`village`, `status`, `sensorStatus`, `worker`, `search`, pagination). Workers auto-scoped to their own bins. |
| GET    | `/bins/:binId`                 | Private                | Single bin |
| POST   | `/bins`                        | Admin, Officer          | Create a bin |
| PUT    | `/bins/:binId`                 | Admin, Officer          | Update bin fields |
| DELETE | `/bins/:binId`                 | Admin                   | Delete a bin |
| PATCH  | `/bins/:binId/fill`            | Admin, Officer          | Simulate slider — sets fill level, recomputes status, auto-notifies on crossing |
| PATCH  | `/bins/:binId/sensor-status`   | Admin, Officer          | Toggle Online/Offline |
| PATCH  | `/bins/:binId/collect`         | Admin, Officer, Worker  | Mark collected — resets fill to 0%, logs history, clears notifications |

### Villages / Workers
| Method | Route                       | Access          | Description |
|--------|------------------------------|------------------|--------------|
| GET    | `/villages`                  | Private          | List villages |
| POST/PUT/DELETE | `/villages(/:villageId)`| Admin          | Manage villages |
| GET    | `/workers`                   | Private          | List workers |
| GET    | `/workers/:workerId/bins`    | Private          | Worker Dashboard — Today's Tasks |
| POST/PUT/DELETE | `/workers(/:workerId)` | Admin, Officer   | Manage worker profiles |

### Notifications
| Method | Route                      | Access  | Description |
|--------|-----------------------------|---------|--------------|
| GET    | `/notifications?read=`      | Private | List (newest first) + unread count |
| PATCH  | `/notifications/:id/read`   | Private | Mark one as read |
| PATCH  | `/notifications/read-all`   | Private | Mark all read |
| DELETE | `/notifications/:id`        | Private | Dismiss |

### Collection History / Reports
| Method | Route                                             | Access  | Description |
|--------|-----------------------------------------------------|---------|--------------|
| GET    | `/history?village=&worker=&from=&to=`                | Private | Paginated collection log |

### Dashboard
| Method | Route                                    | Access  | Description |
|--------|--------------------------------------------|---------|--------------|
| GET    | `/dashboard/stats`                          | Private | Total, Normal, Almost Full, Full, Collected Today, Pending, Offline |
| GET    | `/dashboard/charts/status-distribution`     | Private | Pie chart data |
| GET    | `/dashboard/charts/village-breakdown`       | Private | Bar chart data |
| GET    | `/dashboard/charts/collection-trend?days=`  | Private | Line chart data |

### ESP32 / Simulation
| Method | Route                 | Access                | Description |
|--------|------------------------|-------------------------|--------------|
| POST   | `/esp32/data`           | Device (`x-device-key`) | Real hardware ingest: `{ binId, fillLevel }` |
| POST   | `/simulation/start`     | Admin, Officer           | Server-side auto-simulation (demo mode) |
| POST   | `/simulation/stop`      | Admin, Officer           | Stop it |
| GET    | `/simulation/status`    | Private                  | `{ running: boolean }` |

## Real-time events (Socket.io)

Connect a `socket.io-client` to the server root and listen for:

- `bin:update` — a bin document changed
- `notification:new` — a new Almost Full / Full notification was generated
- `stats:update` — dashboard counters changed

## Notes on the ESP32 device

Point your real ESP32 firmware's HTTP POST at:

```
POST http://<your-server>/api/esp32/data
Headers: x-device-key: <DEVICE_API_KEY from .env>
Body:    {"binId":"BIN-023","fillLevel":95}
```

This is the only payload shape the hardware ever needs to send — the
backend resolves village, ward, and landmark by looking up `binId` in the
`Bin` collection, exactly as described in the project brief.
