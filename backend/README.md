# Team Task Manager — Backend

REST API for team-based project and task management with role-based access control.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT (access + refresh tokens, httpOnly cookies)
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally

### Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database
npm run db:seed

# Start dev server
npm run dev
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/team_task_manager
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Logout |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Current user |
| GET | `/api/users` | List all users |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | List my projects |
| GET | `/api/projects/:id` | Get project |
| PUT | `/api/projects/:id` | Update (Admin) |
| DELETE | `/api/projects/:id` | Delete (Admin) |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks/projects/:projectId/tasks` | Create task |
| GET | `/api/tasks/projects/:projectId/tasks` | List project tasks |
| GET | `/api/tasks/:id` | Get task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/tasks/dashboard` | Dashboard stats |
| GET | `/api/tasks/my-tasks` | My tasks |

## Test Accounts (after seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | Admin |
| jane@example.com | member123 | Member |
| john@example.com | member123 | Member |
