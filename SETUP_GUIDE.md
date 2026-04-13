# Student Marks Portal — Complete Setup Guide

## What You're Building

A full-stack web app where:
- Students log in with their ID and password and view their marks
- Admins can add/edit marks manually or bulk-import from Excel
- Hosted free: **Netlify** (frontend) + **Render** (backend + database)

---

## Prerequisites — Install These First

| Tool | How to get it |
|------|--------------|
| Python 3.10+ | https://python.org/downloads |
| Node.js 18+ | https://nodejs.org |
| Git | https://git-scm.com |
| A GitHub account | https://github.com |
| A Render account (free) | https://render.com |
| A Netlify account (free) | https://netlify.com |

---

## PART 1 — Set Up the Backend Locally

### Step 1: Open terminal and go to the backend folder

```bash
cd marks-portal/backend
```

### Step 2: Create a Python virtual environment

```bash
python3 -m venv venv
```

Activate it:
- **Mac/Linux:** `source venv/bin/activate`
- **Windows:** `venv\Scripts\activate`

You'll see `(venv)` appear in your terminal. This keeps your packages isolated.

### Step 3: Install Python packages

```bash
pip install -r requirements.txt
```

This installs FastAPI, the database tools, JWT auth, bcrypt, pandas, and openpyxl.

### Step 4: Create your `.env` file

In the `backend/` folder, create a file called `.env` (no other extension):

```
DATABASE_URL=postgresql://user:password@host/dbname
SECRET_KEY=replace-this-with-a-long-random-string
```

**To generate a secure SECRET_KEY**, run this in your terminal:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```
Copy the output and paste it as your SECRET_KEY.

> ⚠️ Never share this file or commit it to GitHub. The `.gitignore` already excludes it.

### Step 5: Set up a local PostgreSQL (for testing only)

Option A — **Use Render's database directly** (simplest):
- Skip local Postgres entirely
- Deploy to Render first (Part 3), copy the database URL, put it in `.env`

Option B — Install PostgreSQL locally:
- Download from https://postgresql.org
- Create a database called `marksportal`
- Your DATABASE_URL would be: `postgresql://postgres:yourpassword@localhost/marksportal`

### Step 6: Run the backend locally

```bash
uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

Open http://127.0.0.1:8000/docs in your browser — you'll see the auto-generated API docs. This confirms the backend works.

### Step 7: Create your first admin user

With the server running, open a **new terminal tab**, activate venv again, and run:

```bash
cd marks-portal/backend
source venv/bin/activate   # or venv\Scripts\activate on Windows
python3 create_admin.py
```

You'll be prompted to enter an admin ID and password.

---

## PART 2 — Set Up the Frontend Locally

### Step 1: Go to the frontend folder

```bash
cd marks-portal/frontend
```

### Step 2: Install Node packages

```bash
npm install
```

### Step 3: Create a `.env` file for local dev

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

### Step 4: Run the frontend

```bash
npm run dev
```

Open http://localhost:5173 in your browser. You should see the login page.

Try logging in with the admin credentials you created. You should reach the Admin panel.

---

## PART 3 — Deploy Backend to Render (Free)

### Step 1: Push to GitHub

In the `marks-portal/` root folder:
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/marks-portal.git
git push -u origin main
```

### Step 2: Create a PostgreSQL database on Render

1. Go to https://render.com → click **New +** → **PostgreSQL**
2. Name it `marksportal-db`
3. Choose the **Free** plan
4. Click **Create Database**
5. Wait ~1 minute for it to provision
6. Click on the database → scroll down to **Connections**
7. Copy the **Internal Database URL** — it looks like `postgresql://user:pass@host/dbname`

### Step 3: Deploy the backend web service

1. Render → **New +** → **Web Service**
2. Connect your GitHub repo
3. Fill in these settings:

| Setting | Value |
|---------|-------|
| Name | `marks-portal-backend` |
| Root Directory | `backend` |
| Runtime | `Python 3` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Plan | Free |

4. Click **Advanced** → **Add Environment Variable** and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Paste the Internal Database URL from Step 2 |
| `SECRET_KEY` | Your generated secret key |

5. Click **Create Web Service**

Render will build and deploy your backend. This takes 2–5 minutes the first time.

6. Once deployed, copy your backend URL — it looks like `https://marks-portal-backend.onrender.com`

### Step 4: Create the admin user on Render

In Render, go to your web service → **Shell** tab (or use the Render console), and run:
```bash
python3 create_admin.py
```

Or manually via the API docs at `https://your-backend.onrender.com/docs`.

---

## PART 4 — Deploy Frontend to Netlify

### Step 1: Update the backend CORS

Open `backend/main.py` and find this line:
```python
FRONTEND_URL = "https://your-app.netlify.app"
```

After you deploy to Netlify (Step 3 below), come back and replace this with your real Netlify URL, then redeploy the backend.

### Step 2: Set up Netlify

1. Go to https://netlify.com → **Add new site** → **Import an existing project**
2. Connect GitHub → select your `marks-portal` repo
3. Fill in build settings:

| Setting | Value |
|---------|-------|
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `frontend/dist` |

4. Click **Show advanced** → **New variable**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://marks-portal-backend.onrender.com` (your Render URL) |

5. Click **Deploy site**

Netlify builds your React app and gives you a URL like `https://sparkly-narwhal-abc123.netlify.app`

### Step 3: Update backend CORS and redeploy

1. Open `backend/main.py`
2. Replace `https://your-app.netlify.app` with your actual Netlify URL
3. Commit and push to GitHub — Render auto-redeploys

```bash
git add backend/main.py
git commit -m "update CORS with netlify URL"
git push
```

### Step 4: (Optional) Set a custom domain on Netlify

Netlify → Site settings → Domain management → Add custom domain.

---

## PART 5 — Add Your 400 Students (Excel Import)

### Step 1: Prepare your Excel file

Create an Excel file (`.xlsx`) with these columns (exact names):

```
student_id  | name         | email              | division | password
2021001     | Rahul Mehta  | rahul@college.edu  | A        |
2021002     | Priya Shah   | priya@college.edu  | B        |
```

- `password` column is **optional** — if blank, the student's password defaults to their `student_id`
- `email` and `division` are optional

### Step 2: Upload via Admin Panel

1. Log in as admin at your Netlify URL
2. Go to **Excel Import** tab
3. Under **Bulk create students**, click **Choose File** → select your Excel
4. Click **Upload Students**
5. You'll see a success message like `Created: 400, Skipped: 0`

### Step 3: Import marks for a subject

Your marks Excel should look like:

```
student_id  | insem1 | insem2 | insem3 | practical | assignment | endsem
2021001     | 18     | 20     |        | 24        | 9          | 55
2021002     | 16     | 19     | 21     | 22        |            | 48
```

- Leave cells **blank** for marks not yet entered (don't put 0 unless the mark is actually 0)
- Only the columns you include will be updated

In the Admin panel:
1. Go to **Excel Import** tab
2. Select the subject from the dropdown (add subjects first in the **Subjects** tab)
3. Upload the marks file → click **Upload & Import**

---

## PART 6 — Adding Subjects

Before importing marks, you must add subjects.

1. Log in as admin → go to **Subjects** tab
2. Fill in Subject Code (e.g. `CS301`), Subject Name (e.g. `Data Structures`), Semester
3. Click **Add subject**

Repeat for each subject.

---

## Security Notes

| What | How it's protected |
|------|--------------------|
| Passwords | bcrypt hashed — even if DB is leaked, passwords are safe |
| Login tokens | JWT, expires in 8 hours, stored in sessionStorage (clears on tab close) |
| Student data isolation | Server always filters marks by the logged-in user's own DB ID — no way to see others' data |
| Admin access | `is_admin` flag is checked server-side on every admin route |
| CORS | Only your Netlify domain can call the API |
| HTTPS | Both Render and Netlify enforce HTTPS automatically |
| SQL injection | SQLAlchemy ORM uses parameterized queries |

---

## Common Issues & Fixes

**Backend won't start — "DATABASE_URL not found"**
→ Make sure your `.env` file is in the `backend/` folder and you ran `pip install python-dotenv`

**Login fails with CORS error in browser**
→ Your `FRONTEND_URL` in `main.py` doesn't match your Netlify URL exactly. Update it and redeploy backend.

**Render backend goes to sleep (free tier)**
→ Free Render services sleep after 15 minutes of inactivity. First request after sleep takes ~30s. Upgrade to paid to avoid this, or use https://uptimerobot.com (free) to ping it every 10 minutes.

**Excel import says "Student not found"**
→ The student IDs in your marks Excel must exactly match the IDs used when creating students (case-sensitive, no spaces).

**"Module not found" on Render**
→ Make sure `requirements.txt` is up to date. Run `pip freeze > requirements.txt` locally and push.

---

## Folder Structure Reference

```
marks-portal/
├── SETUP_GUIDE.md          ← You are here
├── .gitignore
├── backend/
│   ├── main.py             ← All API routes
│   ├── models.py           ← Database table definitions
│   ├── auth.py             ← JWT + bcrypt authentication
│   ├── database.py         ← DB connection setup
│   ├── create_admin.py     ← Script to create first admin
│   ├── requirements.txt    ← Python dependencies
│   └── .env                ← Your secrets (NOT committed to git)
└── frontend/
    ├── src/
    │   ├── App.jsx         ← Routes (login / dashboard / admin)
    │   ├── api.js          ← Axios with auto auth headers
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Dashboard.jsx
    │       └── Admin.jsx
    ├── .env                ← Local dev API URL (NOT committed)
    ├── .env.production     ← Production API URL
    ├── netlify.toml        ← Netlify build config
    ├── package.json
    └── vite.config.js
```

---

## Quick Reference — All Commands

```bash
# Backend (local)
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Create admin user
python3 create_admin.py

# Frontend (local)
cd frontend
npm install
npm run dev

# Build frontend for production
npm run build

# Push to GitHub (triggers auto-deploy on Render + Netlify)
git add .
git commit -m "your message"
git push
```
