# 🎾 PingCourt

**A modern, full-stack web application for tennis club management**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://tennis-club-frontend.onrender.com)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791)](https://www.postgresql.org/)

**🌐 Live Application:** [https://tennis-club-frontend.onrender.com](https://tennis-club-frontend.onrender.com)

**📹 Presentation Video:** [https://www.youtube.com/watch?v=Veyr-2DUNzM](https://www.youtube.com/watch?v=Veyr-2DUNzM)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Live Demo](#-live-demo)
- [Screenshots](#-screenshots)
- [Architecture](#-architecture)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

PingCourt is a comprehensive tennis club management system that streamlines player interactions, match scheduling, and performance tracking. Built with modern web technologies, it provides an intuitive platform for both players and administrators.

### The Problem

Traditional tennis club management relies on spreadsheets, email chains, and manual record-keeping—leading to inefficiencies, scheduling conflicts, and limited insights into player development.

### The Solution

PingCourt digitizes and automates club operations through:

- **Smart Challenge System** - UTR-based player matching with duplicate prevention
- **Automated Match Scheduling** - Challenge acceptance creates scheduled matches automatically
- **Performance Analytics** - Real-time statistics and historical trends
- **Admin Dashboard** - Comprehensive tools for match grading and member management

### Key Innovations

- ✨ **Intelligent Scheduling** - Prevents double-booking while maintaining flexibility across dates
- 📊 **Daily Win Rate Tracking** - Groups matches by day for accurate performance metrics
- 🔐 **Role-Based Access** - Optimized workflows for players vs. administrators
- 🚀 **RESTful API** - Clean architecture enabling future mobile integration

---

## ✨ Features

### For Players

- 📊 **Personalized Dashboard** - View statistics, recent matches, and performance trends
- 🎯 **Challenge System** - Send and receive challenges with UTR-based recommendations
- 📅 **Match Calendar** - Visual calendar with upcoming and historical matches
- 📈 **Performance Analytics** - Track win rates, match history, and skill progression
- 👤 **Profile Management** - Update personal information and avatar

### For Administrators

- 👥 **Member Management** - CRUD operations with search and filtering
- ⚖️ **Match Grading** - Record 3-set tennis scores and determine winners
- 📊 **Member Analytics** - Statistics on demographics, UTR distribution, and activity
- 📉 **Activity Dashboard** - Challenge statistics and daily match trends
- 🔍 **Advanced Filters** - Search by gender, age range, and UTR level

### Homepage Features

- 🏆 **Featured Players** - Showcase top-ranked members
- 🆕 **Recent Matches** - Display latest graded results
- 🔓 **Public Access** - Welcome page for unauthenticated visitors

---

## 🛠 Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![React Router](https://img.shields.io/badge/React_Router-7.9.4-CA4245?logo=react-router)
![Axios](https://img.shields.io/badge/Axios-1.12.2-5A29E4)
![Recharts](https://img.shields.io/badge/Recharts-3.2.1-22B5BF)

- **React 19.2.0** - Modern UI framework
- **React Router 7.9.4** - Client-side routing
- **Axios 1.12.2** - HTTP client with interceptors
- **Recharts 3.2.1** - Data visualization
- **React Toastify 11.0.5** - Toast notifications
- **React Icons 5.5.0** - Icon library

### Backend
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Sequelize-336791?logo=postgresql)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=json-web-tokens)

- **Node.js + Express 4.18.2** - REST API server
- **Sequelize 6.33.0** - ORM for PostgreSQL
- **PostgreSQL** - Relational database
- **bcryptjs 2.4.3** - Password hashing
- **jsonwebtoken 9.0.2** - JWT authentication

### Deployment
![Render](https://img.shields.io/badge/Render-Hosting-46E3B7)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)

- **Render** - Frontend and backend hosting (free tier)
- **Supabase** - PostgreSQL database hosting (free tier)
- **GitHub** - Source control and CI/CD

### Development Tools
- **Nodemon 3.0.1** - Auto-restart development server
- **Concurrently 8.2.1** - Run multiple commands
- **Git** - Version control

---

## 🌐 Live Demo

**🚀 Application URL:** [https://tennis-club-frontend.onrender.com](https://tennis-club-frontend.onrender.com)

### Test Accounts

Try the application with these pre-configured accounts:

#### Administrator Access
```
Email: admin@tennisclub.com
Password: admin123
Features: Full admin panel, member management, match grading
```

#### Player Accounts
```
Email: testplayer1@email.com
Password: password123
UTR: 7.5 | 20 matches in last quarter

Email: testplayer2@email.com
Password: password123
UTR: 7.8 | 20 matches in last quarter
```

**Note:** The application runs on Render's free tier, which may have a cold start delay (~30 seconds) on first load.

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                      │
│                    (React 19.2.0)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Render Static Site                     │
│            (Frontend - tennis-club-frontend)            │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ REST API
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Render Web Service                    │
│             (Backend - tennis-club-backend)             │
│                   Express + Node.js                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ PostgreSQL
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase PostgreSQL                    │
│              (Database + Connection Pooler)             │
└─────────────────────────────────────────────────────────┘
```

### Project Structure

```
pingcourt/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Navbar.js
│   │   │   ├── PrivateRoute.js
│   │   │   └── AdminRoute.js
│   │   ├── context/           # State management
│   │   │   └── AuthContext.js
│   │   ├── pages/             # Page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Challenge.js
│   │   │   ├── Matches.js
│   │   │   ├── Profile.js
│   │   │   └── AdminPanel.js
│   │   ├── services/          # API integration
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/                     # Node.js Backend
│   ├── config/
│   │   └── database.js        # Sequelize config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── memberController.js
│   │   ├── challengeController.js
│   │   └── matchController.js
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── models/
│   │   ├── Member.js
│   │   ├── Challenge.js
│   │   ├── Match.js
│   │   └── index.js           # Model associations
│   ├── routes/
│   │   ├── auth.js
│   │   ├── members.js
│   │   ├── challenges.js
│   │   ├── matches.js
│   │   └── seed.js
│   └── index.js
│
├── .env                        # Environment variables
├── .gitignore
├── package.json                # Root dependencies
├── render.yaml                 # Render deployment config
└── README.md
```

---

## 📡 API Documentation

**Base URL:** `https://tennis-club-backend.onrender.com/api`
**Authentication:** `Authorization: Bearer <JWT_TOKEN>`

### Authentication Endpoints

#### Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "FirstName": "John",
  "LastName": "Doe",
  "UserName": "johndoe",
  "Email": "john@example.com",
  "MPassword": "password123",
  "Phone": "+1-555-1234",
  "Age": 28,
  "Gender": "Male",
  "UTR": 7.5,
  "Signature": "Tennis enthusiast"
}

Response: {
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "member": { ... }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: {
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "member": {
    "MEID": 1,
    "UserName": "johndoe",
    "Email": "john@example.com",
    "isAdmin": false,
    ...
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response: {
  "success": true,
  "member": { ... }
}
```

### Member Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/members` | ✅ | Get all members (with pagination) |
| GET | `/members/:id` | ✅ | Get member by ID |
| PUT | `/members/:id` | ✅ | Update member profile |
| DELETE | `/members/:id` | 🔒 Admin | Delete member (cascades) |
| GET | `/members/:id/stats` | ✅ | Get member statistics |
| GET | `/members/analytics/stats` | 🔒 Admin | Get member analytics |

### Challenge Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/challenges` | ✅ | Create new challenge |
| GET | `/challenges/me` | ✅ | Get user's challenges |
| PUT | `/challenges/:id/accept` | ✅ | Accept challenge |
| PUT | `/challenges/:id/reject` | ✅ | Reject challenge |
| GET | `/challenges` | 🔒 Admin | Get all challenges |

### Match Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/matches` | ✅ | Get all matches |
| GET | `/matches/finished` | 🔒 Admin | Get finished matches |
| GET | `/matches/member/:id` | ✅ | Get member's matches |
| PUT | `/matches/:id/grade` | 🔒 Admin | Grade match |
| PUT | `/matches/update-status` | 🔒 Admin | Update match statuses |
| GET | `/matches/stats` | 🔒 Admin | Get match statistics |

---

## 🗄 Database Schema

### Member Table
| Column | Type | Description |
|--------|------|-------------|
| MEID | INTEGER (PK) | Member ID |
| FirstName | VARCHAR(50) | First name |
| LastName | VARCHAR(50) | Last name |
| UserName | VARCHAR(50) | Unique username |
| Email | VARCHAR(50) | Unique email |
| MPassword | VARCHAR(255) | Hashed password |
| Phone | VARCHAR(20) | Phone number |
| Age | INTEGER | Age |
| Gender | VARCHAR(10) | Gender |
| UTR | FLOAT | Universal Tennis Rating (2.0-12.0) |
| MPID | VARCHAR(255) | Avatar URL |
| isAdmin | BOOLEAN | Admin flag |
| Signature | VARCHAR(100) | User signature |
| DateOfCreation | DATE | Account creation date |

### Challenge Table
| Column | Type | Description |
|--------|------|-------------|
| CID | INTEGER (PK) | Challenge ID |
| ChallengerMEID | INTEGER (FK) | Challenger member ID |
| ChallengedMEID | INTEGER (FK) | Challenged member ID |
| State | ENUM | Wait/Accept/Reject |
| DateOfChallenge | DATE | Challenge date |
| MatchDateTime | DATETIME | Scheduled match time |
| Notes | TEXT | Challenge notes |

**Business Rule:** One challenge per player pair per day

### Match Table
| Column | Type | Description |
|--------|------|-------------|
| MAID | INTEGER (PK) | Match ID |
| CID | INTEGER (FK) | Challenge ID |
| Player1MEID | INTEGER (FK) | Player 1 ID |
| Player2MEID | INTEGER (FK) | Player 2 ID |
| DateOfMatch | DATETIME | Match date/time |
| Status | ENUM | pending/finished/graded |
| MEID1Set1Score | INTEGER | Player 1 Set 1 score |
| MEID2Set1Score | INTEGER | Player 2 Set 1 score |
| MEID1Set2Score | INTEGER | Player 1 Set 2 score |
| MEID2Set2Score | INTEGER | Player 2 Set 2 score |
| MEID1Set3Score | INTEGER | Player 1 Set 3 score |
| MEID2Set3Score | INTEGER | Player 2 Set 3 score |
| WinnerMEID | INTEGER (FK) | Winner member ID |
| LoserMEID | INTEGER (FK) | Loser member ID |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL (v12 or higher)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pingcourt.git
   cd pingcourt
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Configure environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env

   # Edit .env with your PostgreSQL credentials
   # Required variables:
   # DB_HOST=localhost
   # DB_PORT=5432
   # DB_NAME=tennisclub
   # DB_USER=postgres
   # DB_PASSWORD=your_password
   # JWT_SECRET=your_secret_key
   ```

4. **Initialize database**
   ```bash
   # This will create tables and seed sample data
   npm run init
   ```

5. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start individually:
   npm run server  # Backend only (port 5001)
   npm run client  # Frontend only (port 3000)
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001/api

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run server` | Start backend only |
| `npm run client` | Start frontend only |
| `npm run init` | Initialize database and seed data |
| `npm run build` | Build frontend for production |
| `npm start` | Start backend in production mode |

---

## 🌍 Deployment

PingCourt is deployed using modern cloud infrastructure:

### Frontend (Render)
- **Service:** Static Site
- **Build Command:** `cd client && npm install && npm run build`
- **Publish Directory:** `client/build`
- **Auto-Deploy:** Enabled on push to main branch

### Backend (Render)
- **Service:** Web Service
- **Build Command:** `npm install`
- **Start Command:** `node server/index.js`
- **Environment Variables:** Set in Render dashboard
- **Auto-Deploy:** Enabled on push to main branch

### Database (Supabase)
- **Service:** PostgreSQL (Transaction Mode Pooler)
- **Connection:** SSL enabled
- **Free Tier:** 500MB storage, connection pooling

### Deployment Steps

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Render auto-deploys** both frontend and backend

3. **Verify deployment**
   - Check Render dashboard for build logs
   - Test application at production URL

For detailed deployment configuration, see [DEPLOYMENT.md](DEPLOYMENT.md) and [render.yaml](render.yaml).

---

## 🎨 Design & UX

### Color Scheme
- **Primary Gradient:** Purple (`#667eea` to `#764ba2`)
- **Accent Colors:** White, light gray backgrounds
- **Success:** Green
- **Warning:** Orange
- **Error:** Red

### Key Features
- 📱 **Responsive Design** - Mobile, tablet, and desktop optimized
- 🎨 **Modern UI** - Clean, intuitive interface
- 🔔 **Toast Notifications** - Real-time user feedback
- 📊 **Data Visualization** - Interactive charts with Recharts
- 🗓 **Calendar Interface** - Easy match scheduling
- 🔍 **Advanced Search** - Filter and search functionality

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Developed as a university project for tennis club management.

**Team members:** Junjie Lai, Youdong Lu, Emma Zou, Chen Zhu

---

<div align="center">

**Made with ❤️ and 🎾**

[⬆ Back to Top](#-pingcourt)

</div>
