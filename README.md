# Team Task Manager

A full-stack team task management app with project collaboration, role-based permissions, and task tracking.

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript
- Backend: Express.js, TypeScript, Prisma ORM
- Database: PostgreSQL
- Auth: JWT + httpOnly cookies

## Repository Structure

```text
Team Task Manager/
├── frontend/   # Next.js app (UI)
└── backend/    # Express API + Prisma
```

## Prerequisites

- Node.js 18+
- PostgreSQL running locally

## Environment Variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/team_task_manager
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Backend runs at `http://localhost:5000`.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Default Seed Accounts

- `admin@example.com` / `admin123`
- `jane@example.com` / `member123`
- `john@example.com` / `member123`

## Core Features

- Authentication (signup/login/refresh/logout)
- Project creation and member management
- Kanban-style task board per project
- Personal task view and dashboard stats
- Role-based access (global and project-level)

## Permission Note: Task Assignment

- Any project member can set or change `assignedToId`.
- Assignee list shows project members only.

## API Base URLs

- Backend API base: `http://localhost:5000/api`
- Frontend default API target: `NEXT_PUBLIC_API_URL`

## Useful Commands

Backend:

```bash
npm run dev
npm run build
npm run db:migrate
npm run db:seed
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
```
