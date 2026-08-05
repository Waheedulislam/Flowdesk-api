![Node.js](https://img.shields.io/badge/Node.js-22-green)
![Express](https://img.shields.io/badge/Express.js-5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)

# 🚀 FlowDesk Backend

A scalable RESTful API for a collaborative project management platform inspired by Jira, Trello, and ClickUp.

The backend is built using Node.js, Express.js, TypeScript, Prisma ORM, and PostgreSQL, following a modular architecture with authentication, workspace management, project management, task management, and role-based access control.

---

# ✨ Features

- JWT Authentication
- Refresh Token Authentication
- Role-Based Authorization
- Workspace Management
- Workspace Invitations
- Member Role Management
- Project Management
- Task Management
- Task Status Management
- Secure REST APIs
- Prisma ORM
- PostgreSQL
- Zod Validation
- Centralized Error Handling

---

# 🛠 Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- Bcrypt
- Zod
- Cookie Parser
- CORS

---

# 📁 Project Structure

```
src/
│
├── app/
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── workspace/
│   │   ├── invitation/
│   │   ├── project/
│   │   └── task/
│   │
│   ├── middleware/
│   ├── Errors/
│   ├── interface/
│   └── routes/
│
├── config/
├── generated/
├── utils/
└── server.ts
```

---

# 🔐 Authentication

- Register
- Login
- Refresh Token
- Logout

Authentication is implemented using JWT Access Token and Refresh Token.

---

# 👥 Workspace Module

- Create Workspace
- Update Workspace
- Delete Workspace
- Get My Workspaces
- Get Workspace Details
- Invite Members
- Accept Invitation
- Leave Workspace
- Update Member Roles

---

# 📂 Project Module

- Create Project
- Get All Projects
- Get Single Project
- Update Project
- Delete Project

---

# ✅ Task Module

- Create Task
- Get All Tasks
- Get Single Task
- Update Task
- Delete Task
- Update Task Status

---

# 🗄 Database

The project uses PostgreSQL with Prisma ORM.

Database includes:

- User
- Workspace
- WorkspaceMember
- Invitation
- Project
- ProjectMember
- Task
- TaskComment
- Notification
- ActivityLog
- RefreshToken
- File

---

# ⚙️ Installation

```bash
git clone <repo-url>

cd flowdesk-api

pnpm install
```

---

# Environment Variables

```env
PORT=
DATABASE_URL=

JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES=

JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES=

BCRYPT_SALT_ROUNDS=

CLIENT_URL=
```

---

# Run Development Server

```bash
pnpm dev
```

---

# Build

```bash
pnpm build
```

---

# API Base URL

```
http://localhost:5000/api/v1
```

---

# Architecture

The application follows a modular architecture.

```
Routes
      ↓
Controller
      ↓
Service
      ↓
Prisma ORM
      ↓
PostgreSQL
```

---

# Validation

Request validation is implemented using **Zod**.

---

# Authorization

Role-based authorization is implemented for:

- Workspace Owner
- Workspace Admin
- Workspace Member

---

# Error Handling

- Global Error Handler
- Custom AppError
- Validation Errors
- Prisma Errors

---

# Future Improvements

- Project Member Management
- Task Comments
- Notifications
- Activity Logs
- File Upload
- Real-time Updates
- Email Notifications
- Kanban Drag & Drop
- Unit Testing

---

# Author

**Waheedul Islam**

Backend Developer
