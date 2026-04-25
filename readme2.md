# 🏭 Labour Management System

A full-stack web application for managing labour/workers in an organization.
Built with PERN Stack (PostgreSQL, Express, React, Node.js) + CoreUI React Template.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + CoreUI Template |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Authentication | JWT + OTP Email Verification |
| PDF Generation | jsPDF |

---

## 📁 Project Structure

```
Labour-Management-System/
│
├── 📂 FRONTEND (coreui-free-react-admin-template-main/)
│   └── src/
│       ├── App.js                          ← Main app, routing setup
│       ├── routes.js                       ← All frontend routes
│       ├── _nav.js                         ← Sidebar navigation config
│       ├── store.js                        ← Redux store
│       │
│       ├── 📂 components/
│       │   ├── AppBreadcrumb.js            ← Breadcrumb component
│       │   ├── AppContent.js               ← Main content wrapper
│       │   ├── AppFooter.js                ← Footer
│       │   ├── AppHeader.js                ← Header
│       │   ├── AppSidebar.js               ← Sidebar (role-based filtering)
│       │   ├── AppSidebarNav.js            ← Sidebar navigation renderer
│       │   ├── ProtectedRoute.js           ← Route protection
│       │   ├── index.js                    ← Component exports
│       │   │
│       │   ├── 📂 worker/                  ← WORKER INTERFACE
│       │   │   ├── WorkerDashboard.jsx     ← Tasks, stats, productivity score
│       │   │   ├── WorkerProfile.jsx       ← Profile view + edit profile
│       │   │   ├── WorkerAttendance.jsx    ← Attendance history
│       │   │   └── WorkerSalary.jsx        ← Salary history + PDF download
│       │   │
│       │   └── 📂 manager/                 ← MANAGER INTERFACE
│       │       ├── ManagerDashboard.jsx    ← Overview stats + charts
│       │       └── ManagerWorkerList.jsx   ← Worker list + search + delete
│       │
│       ├── 📂 layout/
│       │   └── DefaultLayout.js            ← Main layout (sidebar + header)
│       │
│       └── 📂 views/
│           ├── 📂 dashboard/
│           │   ├── Dashboard.js            ← OLD dashboard (can delete)
│           │   ├── MainChart.js            ← Chart component
│           │   └── WorkerDashboard.js      ← OLD worker wrapper (can delete)
│           │
│           └── 📂 pages/
│               ├── 📂 login/
│               │   └── Login.js            ← Login page
│               ├── 📂 register/
│               │   └── Register.js         ← Register page
│               └── 📂 otp/
│                   └── VerifyOtp.js        ← OTP verification page
│
│
├── 📂 BACKEND (your backend folder/)
│   ├── server.js                           ← Main server file
│   ├── db.js                               ← PostgreSQL connection
│   ├── .env                                ← Environment variables
│   │
│   └── 📂 routes/
│       ├── auth.js                         ← Login, Register, OTP routes
│       └── tasks.js                        ← Task CRUD routes
│
│
└── 📂 DATABASE (PostgreSQL)
    ├── workers                             ← Worker accounts
    ├── tasks                               ← Assigned tasks
    ├── attendance                          ← Attendance records
    ├── salary                              ← Salary records
    └── otps                                ← OTP verification codes
```

---

## 🗄️ Database Tables

### workers
```sql
id, name, email, password, role, status, 
productivity, last_active, is_verified
```

### tasks
```sql
id, worker_id, assigned_by, title, 
description, status, deadline, created_at
```

### attendance
```sql
id, worker_id, date, status, check_in
```

### salary
```sql
id, worker_id, month, year, base_salary,
present_days, total_days, final_salary, status, created_at
```

### otps
```sql
(OTP verification records)
```

---

## 🌐 API Routes

### Auth Routes (/api/auth)
```
POST /api/auth/login          ← Login
POST /api/auth/register       ← Register
POST /api/auth/verify-otp     ← Verify OTP
```

### Worker Routes (/api/workers)
```
GET    /api/workers            ← Get all workers (role=worker only)
GET    /api/workers/:id        ← Get single worker
PUT    /api/workers/:id        ← Update worker profile
DELETE /api/workers/:id        ← Delete worker
```

### Task Routes (/api/tasks)
```
GET    /api/tasks              ← Get all tasks
GET    /api/tasks/worker/:id   ← Get tasks for specific worker
POST   /api/tasks              ← Assign new task
PUT    /api/tasks/status/:id   ← Update task status (worker)
PUT    /api/tasks/:id          ← Update task details (manager)
DELETE /api/tasks/:id          ← Delete task
```

### Attendance Routes (/api/attendance)
```
GET    /api/attendance              ← Get all attendance
GET    /api/attendance/worker/:id   ← Get worker's attendance
POST   /api/attendance              ← Mark attendance
DELETE /api/attendance/:workerId    ← Delete attendance
```

### Salary Routes (/api/salary)
```
GET    /api/salary/worker/:id   ← Get worker's salary records
```

---

## 📱 Frontend Routes

### Worker Routes
```
/worker-dashboard    ← Worker task list + stats
/worker-profile      ← Worker profile + edit
/worker-attendance   ← Attendance history
/worker-salary       ← Salary + payslip download
```

### Manager Routes
```
/dashboard           ← Manager overview dashboard
/manager/workers     ← Worker list + management
/manager/tasks       ← Task management (coming soon)
/manager/attendance  ← Attendance management (coming soon)
/manager/salary      ← Salary management (coming soon)
```

---

## ✅ Features Completed

### Worker Interface
- [x] Worker Dashboard (tasks, stats, productivity score)
- [x] Task Description Modal
- [x] Start & Complete tasks
- [x] Worker Profile Page
- [x] Edit Profile (name, email)
- [x] Attendance History
- [x] Salary/Payslip View
- [x] Download Payslip PDF

### Manager Interface
- [x] Manager Dashboard (overview stats)
- [x] Worker List (search, view, delete)
- [ ] Assign Tasks
- [ ] Manage Tasks
- [ ] Attendance Management
- [ ] Salary Management

### Authentication
- [x] Login with JWT
- [x] OTP Email Verification
- [x] Role-based redirect
- [x] Protected routes
- [x] Password hashing

---

## ⏳ Coming Soon

- [ ] Assign Tasks (Manager)
- [ ] Manage Tasks (Manager)
- [ ] Mark Attendance (Manager)
- [ ] Generate Salary (Manager)
- [ ] Change Password
- [ ] Toast Notifications
- [ ] Form Validation
- [ ] AI Chatbot
- [ ] Face Recognition Attendance

---

## 🚀 How to Run

### Backend
```bash
cd backend
npm install
node server.js
# runs on http://localhost:5000
```

### Frontend
```bash
cd coreui-free-react-admin-template-main
npm install
npm start
# runs on http://localhost:3000
```

---

## 👨‍💻 Developer Notes

- Backend port: **5000**
- Frontend port: **3000**
- Database: **PostgreSQL**
- Worker login redirects to: **/worker-dashboard**
- Manager login redirects to: **/dashboard**
