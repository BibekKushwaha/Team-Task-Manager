# Team Task Manager

A full-stack team task management application for creating projects, managing project members, assigning tasks, and tracking progress from a dashboard and Kanban-style project board.

## Overview

Team Task Manager is built as a two-part application:

- `frontend/`: Next.js client application
- `backend/`: Express REST API with Prisma and PostgreSQL

The app supports authentication, role-based project access, member management, task assignment, status updates, priority tracking, due dates, and seeded demo data for quick evaluation.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT access tokens and refresh tokens |
| Security | httpOnly cookies, CORS, Helmet, bcrypt password hashing |
| Validation | Zod |

## Features

- User signup, login, token refresh, and logout
- Protected frontend routes for authenticated users
- Dashboard with task/project overview
- Project creation and project listing
- Project detail page with members and tasks
- Project member management
- Task creation, update, deletion, and assignment
- Task status workflow: `TODO`, `IN_PROGRESS`, `DONE`
- Task priority levels: `LOW`, `MEDIUM`, `HIGH`
- Personal "My Tasks" view
- Role-based permissions for global and project-level users
- Seed data with demo users, projects, and tasks

## Repository Structure

```text
Team Task Manager/
├── backend/
│   ├── prisma/          # Prisma schema and migrations
│   ├── seed/            # Database seed script
│   └── src/
│       ├── controllers/ # Request handlers
│       ├── middleware/  # Auth, validation, errors, roles
│       ├── routes/      # API route definitions
│       ├── services/    # Business logic
│       └── utils/       # Shared helpers
├── frontend/
│   └── src/
│       ├── app/         # Next.js pages/routes
│       ├── components/  # Shared UI components
│       ├── context/     # Auth context
│       └── lib/         # API client and types
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
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

Update `DATABASE_URL` if your local PostgreSQL username, password, host, port, or database name is different.

## Setup and Run Locally

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Team Task Manager"
```

### 2. Set up the backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

The backend API runs at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:3000
```

## Demo Accounts

After running the seed script, use any of these accounts:

| Email | Password | Role |
| --- | --- | --- |
| `admin@example.com` | `admin123` | Admin |
| `jane@example.com` | `member123` | Member |
| `john@example.com` | `member123` | Member |

## Useful Commands

Backend commands:

```bash
npm run dev          # Start backend in development mode
npm run build        # Compile TypeScript
npm run start        # Run migrations, seed, and start compiled server
npm run db:migrate   # Run Prisma development migration
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
```

Frontend commands:

```bash
npm run dev      # Start Next.js development server
npm run build    # Build production frontend
npm run start    # Start production frontend
npm run lint     # Run ESLint
```

## API Endpoints

Base URL:

```text
http://localhost:5000/api
```

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Log in |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/logout` | Log out |

### Users

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/users/me` | Get current authenticated user |
| `GET` | `/users` | List users |

### Projects

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/projects` | Create a project |
| `GET` | `/projects` | List projects for current user |
| `GET` | `/projects/:id` | Get project details |
| `PUT` | `/projects/:id` | Update a project |
| `DELETE` | `/projects/:id` | Delete a project |
| `POST` | `/projects/:id/members` | Add a project member |
| `DELETE` | `/projects/:id/members/:userId` | Remove a project member |

### Tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/tasks/projects/:projectId/tasks` | Create a task in a project |
| `GET` | `/tasks/projects/:projectId/tasks` | List project tasks |
| `GET` | `/tasks/:id` | Get a task |
| `PUT` | `/tasks/:id` | Update a task |
| `DELETE` | `/tasks/:id` | Delete a task |
| `GET` | `/tasks/dashboard` | Get dashboard stats |
| `GET` | `/tasks/my-tasks` | Get tasks assigned to current user |

## Data Model

Main database entities:

- `User`: stores account details and global role
- `Project`: stores project information and creator
- `ProjectMember`: connects users to projects with a project role
- `Task`: stores task details, status, priority, due date, assignee, project, and creator

## Permission Notes

- Project access is limited to project members.
- Project admins can manage project details and members.
- Task assignees are selected from members of the current project.
- Any project member can set or change a task assignee.
- Deleting a project also deletes its project memberships and tasks.


