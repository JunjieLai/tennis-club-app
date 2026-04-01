# Deployment Guide: Render + Supabase PostgreSQL

This guide will walk you through deploying the Tennis Club Management System to Render (hosting) with Supabase PostgreSQL (database).

## 📋 Prerequisites

- GitHub account
- Supabase account (free)
- Render account (free)
- This codebase pushed to GitHub

---

## 🗄️ Part 1: Supabase Database Setup (10 minutes)

### Step 1.1: Create Supabase Account

1. Visit https://supabase.com/
2. Click "Start your project"
3. Sign in with GitHub (recommended) or email

### Step 1.2: Create Organization

1. Click "New organization"
2. Name: `tennis-club` (or your preferred name)
3. Plan: **Free**
4. Click "Create organization"

### Step 1.3: Create Database Project

1. Click "New project"
2. Fill in the following:
   - **Name**: `tennis-club-db`
   - **Database Password**: Click "Generate a password" and **SAVE IT!**
   - **Region**: Choose closest to you:
     - `West US (North California)` - Oregon Render region
     - `East US (N. Virginia)` - Ohio Render region
   - **Pricing Plan**: Free

3. Click "Create new project"
4. Wait 1-2 minutes for the database to be provisioned

### Step 1.4: Get Connection String

1. In your project dashboard, click Settings (gear icon) on left sidebar
2. Click "Database"
3. Scroll to "Connection string"
4. Select "URI" tab
5. Copy the connection string (looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with the password you saved in Step 1.3

**Save this connection string!** You'll need it for Render.

### Step 1.5: Extract Connection Details

From your connection string, extract:
- **DB_HOST**: `db.xxx.supabase.co`
- **DB_PASSWORD**: Your database password
- **DB_PORT**: `5432`
- **DB_NAME**: `postgres`
- **DB_USER**: `postgres`

---

## 🚀 Part 2: Render Backend Deployment (15 minutes)

### Step 2.1: Create Render Account

1. Visit https://render.com/
2. Click "Get Started"
3. Sign in with GitHub
4. Authorize Render to access your GitHub repositories

### Step 2.2: Create Backend Web Service

1. In Render Dashboard, click "New +" (top right)
2. Select "Web Service"
3. Connect your GitHub repository:
   - Find `JunjieLai/tennis-club-app`
   - Click "Connect"
   - If not visible, click "Configure account" to grant access

4. Configure the service:

   **Basic Settings:**
   - **Name**: `tennis-club-backend`
   - **Region**: `Oregon (US West)` *(free region)*
   - **Branch**: `main` or `postgres-deployment`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`

   **Instance Type:**
   - Scroll down and select **"Free"** plan

### Step 2.3: Add Environment Variables

Scroll to "Environment Variables" section and add these:

```
NODE_ENV=production
PORT=5001
DB_HOST=<your-supabase-host>  # e.g., db.xxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<your-supabase-password>
JWT_SECRET=<generate-random-secret>
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-url.onrender.com
```

**To generate JWT_SECRET:**
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Or use: https://generate-secret.vercel.app/32

**For CLIENT_URL**: Use a placeholder for now (e.g., `https://tennis-club.onrender.com`). We'll update this after frontend deployment.

### Step 2.4: Deploy Backend

1. Click "Create Web Service"
2. Wait 5-10 minutes for the build and deployment
3. Watch the logs for any errors
4. Once deployed, you'll see: **"Your service is live 🎉"**

5. **Copy your backend URL** (top of page):
   ```
   https://tennis-club-backend.onrender.com
   ```

### Step 2.5: Initialize Database

After backend is deployed, run the seed script to populate data:

**Option A: Via API Endpoint** (recommended)
- Use Postman or browser to visit:
  ```
  https://tennis-club-backend.onrender.com/api/admin/seed-database
  ```
- Wait for success response

**Option B: Via Render Shell**
1. In Render dashboard, go to your backend service
2. Click "Shell" tab
3. Run:
   ```bash
   npm run seed
   ```

---

## 🎨 Part 3: Render Frontend Deployment (10 minutes)

### Step 3.1: Create Static Site

1. In Render Dashboard, click "New +"
2. Select "Static Site"
3. Select the same repository: `tennis-club-app`
4. Click "Connect"

### Step 3.2: Configure Static Site

**Basic Settings:**
- **Name**: `tennis-club-frontend`
- **Branch**: `main` or `postgres-deployment`
- **Root Directory**: `client`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

**Instance Type:**
- Select **"Free"** plan

### Step 3.3: Add Environment Variable

Click "Advanced" → "Environment Variables":

```
REACT_APP_API_URL=https://tennis-club-backend.onrender.com
```

*(Use your actual backend URL from Step 2.4)*

### Step 3.4: Deploy Frontend

1. Click "Create Static Site"
2. Wait 3-5 minutes for build
3. Once deployed, **copy your frontend URL**:
   ```
   https://tennis-club-frontend.onrender.com
   ```

### Step 3.5: Update Backend CORS

1. Go back to your **backend service** in Render
2. Click "Environment" in left sidebar
3. Find `CLIENT_URL` variable
4. Update to your actual frontend URL:
   ```
   CLIENT_URL=https://tennis-club-frontend.onrender.com
   ```
5. Click "Save Changes"
6. Backend will automatically redeploy (1-2 minutes)

---

## ✅ Part 4: Testing & Verification (5 minutes)

### Test Checklist:

1. **Visit your frontend URL**:
   ```
   https://tennis-club-frontend.onrender.com
   ```

2. **Test registration**:
   - Create a new account
   - Check if you can log in

3. **Test with existing accounts**:

   **Admin Account:**
   ```
   Email: admin@tennisclub.com
   Password: admin123
   ```

   **Test Player:**
   ```
   Email: testplayer1@email.com
   Password: password123
   ```

4. **Test key features**:
   - Dashboard loads
   - Create a challenge
   - View matches calendar
   - Admin panel (for admin account)
   - Statistics and charts display

### Expected Behavior:

- First load may take 15-30 seconds (cold start)
- Subsequent loads should be fast
- All features should work as in local development

---

## 🐛 Troubleshooting

### Backend Issues:

**"Application failed to start"**
- Check environment variables are set correctly
- Verify Supabase connection string
- Check build logs in Render dashboard

**"Database connection failed"**
- Verify DB_HOST, DB_PASSWORD in Render env vars
- Check Supabase project is running
- Ensure Supabase allows all IPs (default setting)

**"Cannot read property of undefined"**
- Run `npm run seed` to populate database
- Check if tables were created (use Supabase SQL Editor)

### Frontend Issues:

**"Network Error" or API calls failing**
- Verify REACT_APP_API_URL is set correctly
- Check backend URL is accessible
- Verify CLIENT_URL in backend matches frontend URL

**Blank page**
- Check browser console for errors
- Verify build succeeded (check Render logs)
- Ensure `build` directory exists

**CORS errors**
- Update CLIENT_URL in backend environment
- Ensure backend redeployed after CLIENT_URL change

### Database Issues:

**"No data in app"**
- Run seed script: `https://your-backend.onrender.com/api/admin/seed-database`
- Or use Render shell: `npm run seed`

**"Too many connections"**
- Supabase free tier allows 100 connections
- Check connection pool settings in `server/config/database.js`
- Reduce pool `max` to 3-5

---

## 📊 Monitoring & Maintenance

### Render Free Tier Limitations:

- Services sleep after 15 minutes of inactivity
- 750 hours/month total (enough for 1 service)
- Cold start: 10-30 seconds first load

### Keep Services Awake (Optional):

Use UptimeRobot (free) to ping your app every 5 minutes:

1. Sign up at https://uptimerobot.com/
2. Add New Monitor:
   - Type: HTTP(S)
   - URL: `https://your-frontend-url.onrender.com`
   - Interval: 5 minutes
3. Add another monitor for backend:
   - URL: `https://your-backend-url.onrender.com/api/members`

### Supabase Monitoring:

- Dashboard shows database size (500MB limit)
- Monitor connection count (100 max)
- Check for slow queries in "Database" → "Logs"

---

## 🔄 Updating Your Deployment

### Push Updates:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Render will automatically rebuild and redeploy (5-10 min)

### Manual Redeploy:

- In Render dashboard, click "Manual Deploy" → "Deploy latest commit"

---

## 🎉 Success!

Your Tennis Club app is now live at:
- **Frontend**: https://tennis-club-frontend.onrender.com
- **Backend API**: https://tennis-club-backend.onrender.com/api

**Login Credentials:**
- Admin: `admin@tennisclub.com` / `admin123`
- User: `testplayer1@email.com` / `password123`

---

## 📞 Support

If you encounter issues:
1. Check Render build/runtime logs
2. Check Supabase database logs
3. Review this troubleshooting guide
4. Check browser console for frontend errors

**Common Commands:**
```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test database connection locally
psql "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"

# Check Render service logs
# (Available in Render dashboard → Logs tab)
```
