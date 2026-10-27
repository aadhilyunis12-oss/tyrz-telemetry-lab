# 🏎 TYRZ Lab —  AI Telemetry & Tyre Scanner

A   AI-powered tyre telemetry and vehicle inspection platform.
Built with **Node.js + Express** (backend) and **vanilla HTML/CSS/JS** (frontend).

> 🌐 **Live Production Demo:** **[https://tyrz-telemetry-lab.onrender.com](https://tyrz-telemetry-lab.onrender.com)**  
> 📦 **GitHub Repository:** **[https://github.com/aadhilyunis12-oss/tyrz-telemetry-lab](https://github.com/aadhilyunis12-oss/tyrz-telemetry-lab)**

---

## 📋 Project Architecture

```
AI-powered tyre-telemetry/
├── backend/                   ← Express + JWT auth API (port 5000)
│   ├── server.js              ← Main Express server
│   ├── .env                   ← Environment variables (never commit this)
│   ├── routes/
│   │   ├── auth.js            ← /api/auth/* endpoints
│   │   └── analyze.js         ← /api/analyze, /api/history
│   ├── models/                ← Mongoose models
│   └── config/passport.js     ← Google OAuth config
├── server-mongodb.js          ← Alternative standalone server (also port 5000)
├── login.html                 ← Login page
├── register.html              ← Register page
├── landing.html               ← Main dashboard
├── index.html                 ← Home/splash page
├── start.bat                  ← One-click startup (CMD)
├── start.ps1                  ← One-click startup (PowerShell)
└── package.json               ← Root package (Next.js + React, for future use)
```

**Stack:**
| Layer | Technology |
|---|---|
| Backend API | Node.js v24, raw `http` module (server-mongodb.js) OR Express 4 (backend/server.js) |
| Database | MongoDB Atlas (optional) or local fallback JSON store (`tyrz_mongodb_store.json`) |
| Auth | bcryptjs, JWT cookies, Passport.js (Google OAuth optional) |
| Frontend | Vanilla HTML + CSS + JavaScript |
| Optional | Next.js 14 (`npm run dev` for the `/app` React frontend) |

---

## ✅ Prerequisites

| Requirement | How to check | Install |
|---|---|---|
| Node.js ≥ 18 | `node --version` | [nodejs.org](https://nodejs.org) |
| npm | `npm --version` | Included with Node.js |

> No MongoDB installation is required. The backend runs in **offline resilient mode** automatically when Atlas is not configured.

---

## 🚀 How to Start the Application

### Option A — One-Click (Recommended)

**CMD / Double-click:**
```
start.bat
```

**PowerShell:**
```powershell
.\start.ps1
```

Both scripts:
1. Check for Node.js
2. Install backend dependencies if missing
3. Launch the Express server
4. Wait for it to be ready
5. Open your browser automatically

---

### Option B — Manual (Terminal)

Open **two terminals** (or run the backend in a separate window):

**Terminal — Primary method (serves HTML + API):**
```bash
node server-mongodb.js
```

You should see:
```
[TyrzMongoDB] Server active at http://localhost:5000
```

**Terminal — Express-only API (no HTML serving):**
```bash
cd backend
node server.js
```
This serves only the `/api/*` routes, not the HTML files.

---

### Option C — Alternative standalone server

```bash
node server-mongodb.js
```
This runs on port **5000** by default (configurable via `backend/.env` → `PORT=`).

---

## 🌐 Live Web Application URLs

| Page | Live Production URL |
|---|---|
| 🏁 **Home / Splash** | https://tyrz-telemetry-lab.onrender.com/ |
| 🏎️ **Login** | https://tyrz-telemetry-lab.onrender.com/login.html |
| 📝 **Register** | https://tyrz-telemetry-lab.onrender.com/register.html |
| 📊 **Dashboard** | https://tyrz-telemetry-lab.onrender.com/landing.html |
| 🩺 **API Health** | https://tyrz-telemetry-lab.onrender.com/api/health |

> *(For local offline development on your computer, you can run `start.bat` on `http://localhost:5000`)*.

---

## ⚙️ Environment Variables

The backend reads from `backend/.env`. A default file is already included. Key variables:

```env
PORT=5000                    # Backend port (default: 5000)
JWT_SECRET=<your-secret>     # JWT signing secret (already set)
MONGO_URI=mongodb+srv://...  # MongoDB Atlas URI (optional)
CLIENT_URL=http://localhost:5000  # CORS allowed origins
GOOGLE_CLIENT_ID=...         # Only needed for Google OAuth
GOOGLE_CLIENT_SECRET=...     # Only needed for Google OAuth
```

> If `MONGO_URI` is not configured (or contains the placeholder `DB_USER`), the backend automatically switches to **resilient local mode** — the app still works without any database.

---

## 📦 Install Dependencies

If `backend/node_modules` is missing:

```bash
cd backend
npm install
```

For the root Next.js frontend (optional):

```bash
npm install
```

---

## 🛑 How to Stop the Application

- Close the **Node.js terminal window** that shows the backend logs, **or**
- Press **Ctrl + C** in that terminal window.

---

## 🔄 How to Restart After Shutting Down Your Computer

Every time you restart your computer, the Node.js server stops. To start again:

```bash
# From the project root:
cd backend
node server.js
```

Or simply run `start.bat` (double-click it).

---

## 🔍 Diagnosing `ERR_CONNECTION_REFUSED`

This error means nothing is listening on the port your browser is trying to reach.

### Step 1 — Confirm which port to use
This app uses **port 5000**, not 8080 or 3000. Make sure you're visiting:
```
http://localhost:5000/login.html
```

### Step 2 — Check if the server is running
```powershell
netstat -ano | findstr ":5000"
```
- **No output** → The server is not running. Start it with `start.bat`.
- **Output shown** → Something is listening. Reload the browser.

### Step 3 — Start the server manually
```bash
cd backend
node server.js
```
Watch for error messages. Common ones:

| Error message | Fix |
|---|---|
| `Cannot find module 'express'` | Run `cd backend && npm install` |
| `EADDRINUSE: port 5000` | Another process is using port 5000 — see below |
| `Missing required env vars` | Check `backend/.env` exists with `JWT_SECRET` set |

---

## 🚦 How to Identify a Port Conflict

If port 5000 is already in use:

```powershell
netstat -ano | findstr ":5000"
```

Find the PID (last column), then:

```powershell
Stop-Process -Id <PID> -Force
```

Or change the port in `backend/.env`:
```env
PORT=5001
```
Then update your browser URL to `http://localhost:5001/login.html`.

---

## 📄 View Server Logs

The backend logs appear in the terminal window where you ran `node server.js`.

For the startup script (`start.bat`), a separate **"TYRZ Backend"** window opens automatically — check that window for errors.

---

## 🔧 Troubleshooting Checklist

| Problem | Solution |
|---|---|
| `ERR_CONNECTION_REFUSED` on port 8080 | Wrong URL — use `http://localhost:5000/login.html` |
| `ERR_CONNECTION_REFUSED` on port 5000 | Backend not started — run `start.bat` or `cd backend && node server.js` |
| `Cannot find module` error | Run `cd backend && npm install` |
| Login fails with "Unable to connect" | Backend not running or wrong port in `login.html` |
| Google login not working | Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `backend/.env` |
| MongoDB not connecting | Normal — app runs fine in offline mode. Atlas URI optional. |
| PowerShell script won't run | Run: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |

---

## 🧪 API Endpoints (Quick Reference)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, sets JWT cookie |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/analyze` | Analyse tyre image |
| GET | `/api/history` | User scan history |

---

## 🛠 Development Notes

- **Frontend** (`login.html`, `landing.html`, etc.) communicates with the backend at `http://localhost:5000`.
- **Next.js app** in `/app` directory is a separate React frontend. Run it with `npm run dev` (starts on port 3000).
- **server-mongodb.js** is an alternative combined server with more routes. Start it with `node server-mongodb.js`.
- All static HTML files are served by Express directly when you visit `http://localhost:5000/*.html`.
