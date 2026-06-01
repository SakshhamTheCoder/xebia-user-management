# User Management Portal

A MERN-stack user management portal with an admin approval workflow.

- **Users** register with username, email, phone, password, and an optional profile picture.
- A new registration is created in a **pending** state and waits for an admin.
- An **admin** approves or rejects each request. Only approved users can log in
  (others are told their account is not approved / was rejected).
- Admins can **activate / deactivate** an approved account at any time.
- Admins can **create new admins** from the admin portal.

## Stack

- **Backend:** Node + Express in an MVC layout, MongoDB via Mongoose, JWT auth,
  bcrypt password hashing, multer for profile-picture uploads.
- **Frontend:** Vite + React + Tailwind CSS, React Router, axios.

## Project structure

```
.
├── backend/                # Express API (MVC)
│   ├── server.js           # entry point
│   └── src/
│       ├── app.js          # express app + middleware wiring
│       ├── config/         # db connection
│       ├── models/         # Mongoose schemas (User)
│       ├── controllers/    # request handlers (auth, user, admin)
│       ├── routes/         # route definitions
│       ├── middleware/     # auth, upload, error handling
│       └── utils/          # token helpers, admin seed script
└── frontend/               # Vite React app
    └── src/
        ├── api/            # axios client
        ├── context/        # auth context
        ├── components/     # shared UI
        └── pages/          # Login, Register, dashboards
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) **or** a MongoDB Atlas
  connection string.

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env          # then edit values if needed
npm run seed:admin            # creates the first admin (see .env for credentials)
npm run dev                   # starts on http://localhost:5000
```

Default seeded admin (change in `.env`):

- email: `admin@example.com`
- password: `admin123`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                   # starts on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to the backend on port 5000,
so no extra config is needed in development.

## API overview

| Method | Endpoint                          | Access | Purpose                       |
| ------ | --------------------------------- | ------ | ----------------------------- |
| POST   | `/api/auth/register`              | public | Register (multipart for pic)  |
| POST   | `/api/auth/login`                 | public | Log in, returns JWT           |
| GET    | `/api/users/me`                   | auth   | Current user profile          |
| PATCH  | `/api/users/me`                   | auth   | Edit own username/phone/picture |
| PATCH  | `/api/users/me/password`          | auth   | Change own password           |
| DELETE | `/api/users/me`                   | auth   | Delete own account            |
| GET    | `/api/admin/users`                | admin  | List users (`?status=`)       |
| PATCH  | `/api/admin/users/:id/approve`    | admin  | Approve a pending user        |
| PATCH  | `/api/admin/users/:id/reject`     | admin  | Reject a user                 |
| PATCH  | `/api/admin/users/:id/activate`   | admin  | Activate an approved user     |
| PATCH  | `/api/admin/users/:id/deactivate` | admin  | Deactivate an approved user   |
| PATCH  | `/api/admin/users/:id/promote`    | admin  | Promote an existing user → admin |
| GET    | `/api/admin/admins`               | admin  | List admins                   |
| POST   | `/api/admin/admins`               | admin  | Create a new admin (no account yet) |
| PATCH  | `/api/admin/admins/:id/demote`    | admin  | Demote an admin back to a user |
```
