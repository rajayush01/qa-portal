# Real-Time Admin–User Question & Answer Portal

A production-ready Q&A portal with two roles — **User** and **Admin** — built for
submitting questions before/during a live session and answering them in real time.

```
qa-portal/
├── backend/    Node.js + Express + MongoDB + Socket.IO API
└── frontend/   React + TypeScript + Vite + Tailwind CSS
```

## Features

- JWT auth (HTTP-only cookies) with server-enforced role-based access — the frontend
  never decides who is an admin.
- Users: submit questions (with optional anonymity, attachments, 1000-char limit),
  track status, see answers arrive live.
- Admins: dashboard stats, searchable/filterable question table with pagination,
  Live Session mode with real-time incoming questions, Unanswered/Answered views,
  Excel export (respects active filters or exports everything), category/department
  management.
- Socket.IO powers all real-time updates — new questions push to admins instantly;
  answers push to the submitting user instantly.
- Secure file uploads (PDF/DOC/DOCX/XLS/XLSX, validated server-side by type & size)
  with access control so only the question's owner or an admin can download a file.
- Rate limiting, Helmet, Mongo sanitization, XSS cleaning, input validation
  throughout.

## Prerequisites

- Node.js 18+
- MongoDB running locally or a connection string to a hosted instance (e.g. Atlas)

## 1. Backend setup

```bash
cd backend
cp .env.example .env      # edit MONGO_URI / JWT_SECRET as needed
npm install
npm run seed               # creates demo admin + user accounts and default taxonomy
npm run dev                 # starts the API on http://localhost:5000
```

Demo accounts created by `npm run seed`:

| Role  | Email                 | Password      |
|-------|-----------------------|---------------|
| Admin | admin@qaportal.test   | ChangeMe123!  |
| User  | user@qaportal.test    | ChangeMe123!  |

**Change these before any real deployment.**

## 2. Frontend setup

```bash
cd frontend
cp .env.example .env      # defaults already point at localhost:5000
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Open http://localhost:5173, log in with either demo account, and you're in.

## 3. Production build

```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build   # outputs static files to frontend/dist
```

Serve `frontend/dist` from any static host (Nginx, Vercel, etc.) and point
`VITE_API_URL` / `VITE_SOCKET_URL` at your deployed backend.

## Environment variables (backend/.env)

| Variable                 | Description                                    |
|---------------------------|------------------------------------------------|
| `MONGO_URI`               | MongoDB connection string                      |
| `JWT_SECRET`               | Long random string used to sign auth tokens    |
| `JWT_EXPIRES_IN`           | Token lifetime, e.g. `7d`                      |
| `CLIENT_URL`               | Frontend origin, for CORS + cookie settings    |
| `MAX_FILE_SIZE_MB`         | Per-file upload limit                          |
| `MAX_FILES_PER_QUESTION`   | Max attachments per question                   |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | General API rate limiting        |

## Notes on real-time behavior

- Admins join an `admins` Socket.IO room on connect and receive `question:new`
  and `question:answered` events for every question in the system.
- Each user joins a private `user:<id>` room and only receives `question:answered`
  events for their own questions.
- The Live Session page listens for `question:new` and prepends incoming questions
  to the top of the feed with a highlight animation.

## Notes on anonymity

- When a question is submitted with `isAnonymous: true`, the `name` field is
  cleared at the database write and stripped again at serialization time
  (`toJSON` transform on the Question model), so it can't leak through any
  endpoint or the Excel export.
