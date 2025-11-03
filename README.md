# Tennis Club Management System

A comprehensive full-stack web application for managing a tennis club, including player registration, match scheduling, challenge system, and performance analytics.

## ⚡ Quick Start for Team Members

**First time setup? Just run these 4 commands:**

```bash
# 1. Clone and enter the project
cd tennis-club-app

# 2. Install all dependencies
npm install && cd client && npm install && cd ..

# 3. Copy and configure environment file
cp .env.example .env
# Edit .env and set your MySQL password

# 4. One-command database setup (creates DB, tables, and sample data)
npm run init

# 5. Start the application
npm run dev
```

Open `http://localhost:3000` and login with:
- Admin: `admin@tennisclub.com` / `admin123`
- Test User: `testplayer1@email.com` / `password123`

**That's it!** See [Installation & Setup](#installation--setup) for detailed instructions.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Database Design](#database-design)
- [File Structure](#file-structure)
- [API Documentation](#api-documentation)
- [Installation & Setup](#installation--setup)
- [Test Accounts](#test-accounts)

---

## 🎯 Project Overview

### Problem Statement

Tennis clubs face significant challenges in managing player interactions, match scheduling, and performance tracking. Traditional methods involving spreadsheets, email chains, and manual record-keeping are inefficient, error-prone, and provide limited insights into player development and club activity.

### Solution

The Tennis Club Management System is a modern full-stack web application that digitizes and automates tennis club operations. It provides a centralized platform where players can:

- **Challenge and compete** with players of similar skill levels (UTR-based matching)
- **Schedule matches** through an intuitive calendar interface
- **Track performance** with detailed statistics and historical trends
- **Manage profiles** and view personalized dashboards

Administrators benefit from:

- **Automated match management** with challenge acceptance creating pending matches
- **Efficient grading system** for recording 3-set tennis scores
- **Comprehensive analytics** for monitoring club activity and member engagement
- **Streamlined member management** with integrated data cleanup

### Key Innovations

1. **Smart Challenge System**: Prevents double-booking (one challenge per player pair per day) while allowing flexibility across different dates
2. **Performance Analytics**: Groups matches by day for accurate cumulative win rate tracking, providing meaningful insights into player improvement
3. **Role-Based Access**: Distinct workflows for players and administrators, optimizing user experience for each role
4. **RESTful Architecture**: Clean API design enabling potential mobile app integration and third-party services

**Application URLs:** `http://localhost:3000` (Frontend) | `http://localhost:5001` (Backend API)

---

## ✨ Features

### For Players
- User Dashboard with profile editing (click avatar)
- Challenge system with recommended players
- Match calendar and history (10 per page pagination)
- Performance analytics with daily grouping
- UTR-based player matching

### For Administrators
- Direct admin panel access (bypasses dashboard)
- Four-tab interface: User Management, Match Grading, Member Analysis, Activity Analysis
- Member CRUD operations with search and filters
- Match grading (3-set scoring)
- Member Analytics: Statistics (Total Members, Average UTR, Average Age), Gender/Age/UTR distributions
- Activity Analytics: Week performance metrics, challenge statistics (donut chart), daily match trends (line chart with period selector)

### Homepage
- **Unauthenticated**: Welcome banner, login prompts
- **Authenticated**: Featured Players (top 5, scrollable), Recent Matches (graded only)

---

## 🛠 Technology Stack

### Frontend
- React 19.2.0, React Router 7.9.4, Axios 1.12.2
- React Icons 5.5.0, Recharts 3.2.1, React Toastify 11.0.5

### Backend
- Node.js, Express 4.18.2, MySQL2 3.6.0
- Sequelize 6.33.0, bcryptjs 2.4.3, jsonwebtoken 9.0.2

### Tools
- Nodemon 3.0.1, Concurrently 8.2.1

---

## 🗄 Database Design

### Member Table
```sql
MEID (PK), FirstName, LastName, UserName, Email, MPassword (hashed),
Phone, Age, Gender, UTR (2.0-12.0), MPID (avatar URL), isAdmin
```

### Challenge Table  
```sql
CID (PK), State (Wait/Accept/Reject), ChallengerMEID (FK), ChallengedMEID (FK),
DateOfChallenge, MatchDateTime, Notes

Business Rule: One challenge per player pair per day (same date)
```

### Match Table (tmatch)
```sql
MAID (PK), CID (FK), DateOfMatch, Status (pending/finished/graded),
Player1MEID (FK), Player2MEID (FK), 
MEID1Set1Score, MEID2Set1Score, MEID1Set2Score, MEID2Set2Score,
MEID1Set3Score, MEID2Set3Score, WinnerMEID (FK), LoserMEID (FK)
```

---

## 📁 File Structure

```
tennis-club-app/
├── client/                         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js          # Global navigation
│   │   │   ├── PrivateRoute.js    # Auth wrapper (redirects admin from /dashboard)
│   │   │   └── AdminRoute.js      # Admin-only wrapper
│   │   ├── context/
│   │   │   └── AuthContext.js     # Auth state management
│   │   ├── pages/
│   │   │   ├── Home.js            # Landing page (conditional rendering)
│   │   │   ├── Login.js           # Login (admin → /admin, user → /dashboard)
│   │   │   ├── Register.js        # Registration
│   │   │   ├── Dashboard.js       # User hub (profile edit, stats, performance chart)
│   │   │   ├── Challenge.js       # Challenge management  
│   │   │   ├── Matches.js         # Calendar view + history (pagination)
│   │   │   ├── Profile.js         # User profile
│   │   │   └── AdminPanel.js      # Admin control panel (4 tabs: Users, Matches, Member Analysis, Activity Analysis)
│   │   ├── styles/                # Page-specific CSS
│   │   ├── services/
│   │   │   └── api.js             # Axios instance with JWT interceptor
│   │   ├── App.js                 # Main routes
│   │   └── index.js               # Entry point
│   └── package.json
├── server/                         # Node.js Backend
│   ├── config/
│   │   └── database.js            # Sequelize config
│   ├── controllers/
│   │   ├── authController.js      # Login, register
│   │   ├── memberController.js    # Member CRUD, stats, analytics
│   │   ├── challengeController.js # Challenge CRUD, accept/reject (duplicate check)
│   │   └── matchController.js     # Match CRUD, grading
│   ├── middleware/
│   │   └── auth.js                # JWT verification, admin check
│   ├── models/
│   │   ├── Member.js              # Member model (bcrypt hooks)
│   │   ├── Challenge.js           # Challenge model
│   │   ├── Match.js               # Match model
│   │   └── index.js               # Model associations
│   ├── routes/
│   │   ├── auth.js                # /api/auth
│   │   ├── members.js             # /api/members
│   │   ├── challenges.js          # /api/challenges
│   │   └── matches.js             # /api/matches
│   ├── scripts/
│   │   └── generate-sample-data.js # Data generator (duplicate prevention)
│   └── index.js                   # Express server
├── package.json                   # Root scripts
└── .env                           # Environment variables
```

### Key File Purposes

- **Navbar.js**: Role-based menu items
- **PrivateRoute.js**: Redirects admin from /dashboard to /admin
- **AuthContext.js**: User state, login/logout, token storage, updateUser
- **Dashboard.js**: Performance chart (daily grouping), profile edit modal (avatar click)
- **Challenge.js**: Duplicate date validation, pagination
- **Matches.js**: Calendar, history pagination (10/page, no auto-scroll)
- **AdminPanel.js**: Four-tab admin interface (User Management, Match Grading, Member Analysis with charts, Activity Analysis with period selector)
- **challengeController.js**: Validates one challenge per pair per day (bidirectional check)
- **generate-sample-data.js**: Uses Set to prevent duplicate challenges on same date

---

## 📡 API Documentation

**Base:** `http://localhost:5001/api`  
**Auth:** `Authorization: Bearer <token>`

### Auth Routes

**POST /auth/register**
```json
Request: { firstName, lastName, userName, email, password, phone, age, gender, utr }
Response: { success, token, member }
```

**POST /auth/login**
```json
Request: { email, password }
Response: { success, token, member: { MEID, UserName, isAdmin, ... } }
```

### Member Routes

**GET /members** - Get all members (query: search, excludeAdmins, limit)  
**GET /members/:id** - Get member by ID  
**PUT /members/:id** - Update profile (Auth)  
**DELETE /members/:id** - Delete member (Admin, deletes matches → challenges → member)  
**GET /members/:id/stats** - Get member stats  
**GET /members/top-players** - Top UTR players  
**GET /members/most-active** - Most matches played  
**GET /members/best-challengers** - Highest win rates  
**GET /members/analytics/stats** - Member analytics (Admin, returns totalMembers, avgUTR, avgAge, gender/age/UTR distributions)

### Challenge Routes

**POST /challenges**
```json
Request: { challengedMEID, matchDateTime, notes }
Response: { success, challenge }
Error: "You already have a challenge with this member on this date"
```

**GET /challenges/me** - Get user's sent/received challenges  
**PUT /challenges/:id/accept** - Accept challenge (creates pending match)  
**PUT /challenges/:id/reject** - Reject challenge  
**GET /challenges** - All challenges (Admin)  
**GET /challenges/accepted** - Accepted challenges (Admin)

### Match Routes

**GET /matches** - All matches (query: status, playerId) (Admin)  
**GET /matches/me** - Current user's matches  
**GET /matches/upcoming** - Future matches  
**PUT /matches/:id/grade**
```json
Request: { player1Set1, player2Set1, player1Set2, player2Set2, player1Set3, player2Set3 }
Response: { success, match: { WinnerMEID, LoserMEID, ... } }
```

**DELETE /matches/:id** - Delete match (Admin)
**GET /matches/stats?period=week|month|quarter** - Match statistics with daily breakdown (Admin)
```json
Response: {
  stats: {
    total: 16,
    pending: 1,
    finished: 14,
    graded: 1,
    period: "week",
    dailyData: [{ date: "10/6", matches: 1 }, ...]
  }
}
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm (v6+)
- MySQL (v5.7+) - **Make sure MySQL is running!**

### Quick Start (Recommended)

Follow these steps to get the application running:

#### Step 1: Install Dependencies
```bash
cd tennis-club-app
npm install
cd client && npm install && cd ..
```

#### Step 2: Configure Environment
Copy the example environment file and update it with your settings:
```bash
cp .env.example .env
```

Then edit `.env` and **change the following**:
```env
DB_PASSWORD=your_mysql_password_here
```

**⚠️ IMPORTANT**: Replace `your_mysql_password_here` with your actual MySQL root password!

#### Step 3: One-Command Database Setup
This will automatically create the database, tables, and populate sample data:
```bash
npm run init
```

This single command will:
- ✅ Drop and recreate the `tennisclub` database
- ✅ Create all required tables (member, challenge, tmatch)
- ✅ Generate sample data (32 users, ~250+ challenges, ~220+ matches)

**Expected Output:**
```
🚀 Tennis Club Database - Complete Initialization
📦 Step 1/2: Setting up database and tables...
✅ Database created successfully
✅ Member table created
✅ Challenge table created
✅ Match table created

📦 Step 2/2: Generating sample data...
✅ Admin created: admin@tennisclub.com / admin123
✅ Created 30 users (password: password123)
✅ Created 2 test players (testplayer1@email.com, testplayer2@email.com)
📊 Summary: 32 users, 253 challenges, 227 matches

✨ Complete Initialization Finished!
```

#### Step 4: Start Application
```bash
npm run dev
```

**Access:** `http://localhost:3000`

---

### Alternative: Manual Setup

If you prefer to run each step separately:

#### Setup Database Only
```bash
npm run setup-db
```

#### Generate Sample Data Only
```bash
npm run seed
```

---

### Available NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run init` | **One-command setup** - Creates database, tables, and sample data |
| `npm run setup-db` | Creates database and tables only |
| `npm run seed` | Generates sample data only (requires existing database) |
| `npm run dev` | Starts both frontend and backend in development mode |
| `npm run server` | Starts backend only (with nodemon) |
| `npm run client` | Starts frontend only |
| `npm run build` | Builds frontend for production |
| `npm start` | Starts backend in production mode |

---

## 🔐 Test Accounts

### Administrator
```
Email: admin@tennisclub.com
Password: admin123
Access: Admin Panel (direct), no dashboard
```

### Test Players
```
testplayer1@email.com / password123 (UTR 7.5, 60 graded matches)
testplayer2@email.com / password123 (UTR 7.8, 60 graded matches)
```

### Regular Users
```
Password: password123
Format: {username}@email.com
Examples: johnsmit1@email.com, janesmith2@email.com
UTR Distribution: 10 low (2.0-4.9), 10 mid (5.0-8.9), 10 high (9.0-12.0)
```

---

## 📖 Usage Guide

### For Players

**Registration & Login**
1. Click "Register" → Fill details → Auto-login  
2. Subsequent: Email + password

**Profile Management**  
1. Dashboard → Click avatar → Edit modal → Save

**Challenging Players**
1. Challenge page → Search/Browse recommended  
2. Click "Challenge" → Select date/time → Send  
3. **Rules**: No self-challenge, one per player per day, different dates allowed

**Managing Challenges**
- **Received**: Pending Challenges badge → Accept/Reject (auto-creates match)  
- **Sent**: Sent Challenges badge → View status

**Viewing Matches**
- **Calendar**: Matches page → Navigate months → Click day  
- **History**: View Full History → Filter (All/Won/Lost) → Paginate (10/page)

**Dashboard Analytics**
- Total Matches, Win Rate, Recent Results  
- Performance History Chart (daily cumulative win rate)

### For Administrators

**Login**: Redirected to /admin (not /dashboard)

**User Management**
1. Users tab → View all members
2. Search, filters (gender, age, UTR), pagination
3. Edit, Delete (⚠️ deletes challenges + matches)

**Match Grading**
1. Matches tab → View finished matches
2. Grade matches: Enter 3 sets → Auto-determine winner
3. Delete erroneous matches

**Member Analysis**
1. View statistics: Total Members, Average UTR, Average Age (rounded down)
2. Charts: Gender Distribution (pie), Age Distribution (bar), UTR Distribution (bar)

**Activity Analysis**
1. Week Performance: Total matches, Pending matches, Awaiting grading
2. Challenge Statistics: Status distribution (donut chart)
3. Daily Match Trend: Line chart with period selector (Past Week/Month/Quarter)
   - Only shows past and current matches (excludes future matches)

---

## 🎨 Design Features

- **Theme**: Purple gradient (rgb(102, 126, 234) to rgb(118, 75, 162))  
- **Responsive**: Mobile/tablet/desktop  
- **Custom Scrollbars**: Purple horizontal scrollbars  
- **Toast Notifications**: Real-time feedback  
- **Modal Dialogs**: Clean overlays  
- **Charts**: Recharts for performance tracking  
- **Calendar Interface**: Intuitive match scheduling

---

## 🔧 Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Check if MySQL is running
mysql.server status

# Start MySQL if needed
mysql.server start

# Verify .env credentials are correct
cat .env

# Test MySQL connection manually
mysql -u root -p
```

**2. "Cannot connect to database" Error**
- Make sure MySQL is running
- Verify `DB_PASSWORD` in `.env` matches your MySQL password
- Check if MySQL port 3306 is correct (some installations use 3307)

**3. Port Already in Use**
```bash
# Kill processes using the ports
lsof -ti:5001 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Then restart
npm run dev
```

**4. JWT Invalid Error**
- Clear browser localStorage
- Log out and log in again
- Check if `JWT_SECRET` is set in `.env`

**5. Database Initialization Fails**
```bash
# Reset everything and start fresh
npm run init

# Or manually:
mysql -u root -p
DROP DATABASE IF EXISTS tennisclub;
exit;
npm run init
```

**6. Sample Data Generation Fails**
```bash
# Make sure database exists first
npm run setup-db

# Then generate data
npm run seed
```

**7. "Table doesn't exist" Error**
```bash
# Recreate all tables
npm run setup-db
```

**8. Permission Denied on Scripts**
```bash
# Make scripts executable (Mac/Linux)
chmod +x server/scripts/*.js
```

---

## 📝 Development Notes

### Key Implementations

1. **Challenge Duplicate Prevention**: Backend checks player pair + date (bidirectional), data generator uses Set tracker
2. **Admin Routing**: Login redirects admin to /admin, PrivateRoute blocks /dashboard for admin
3. **Performance History**: Groups matches by day, calculates cumulative win rate at day's end
4. **Match Pagination**: Matches page View History section, 10/page, no auto-scroll
5. **Homepage Conditional Rendering**: Featured Players + Recent Matches hidden when unauthenticated
6. **Profile Edit**: Click avatar in Dashboard → modal → updates DB + AuthContext
7. **Admin Analytics**: Two separate analysis tabs (Member Analysis, Activity Analysis) with Recharts visualizations
8. **Activity Statistics**: Time-filtered queries (week/month/quarter) exclude future matches for accurate metrics
