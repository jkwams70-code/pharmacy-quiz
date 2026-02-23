# Pharmacy Quiz - Deployment Guide

## Overview

Your Pharmacy Quiz application consists of:

- **Frontend**: HTML/CSS/JavaScript (runs in browser)
- **Backend**: Node.js/Express API (runs on server)
- **Data**: JSON files (stores all information)

This guide explains how to deploy to the live internet.

---

## 1️⃣ Pre-Deployment Checklist

### ✅ Backend Preparation

- [ ] Test all endpoints locally
- [ ] Set strong `JWT_SECRET` in `.env`
- [ ] Set strong `ADMIN_KEY` in `.env`
- [ ] Review `.env` - change defaults
- [ ] Test with `npm run dev`

### ✅ Frontend Preparation

- [ ] Test quiz functionality locally
- [ ] Verify admin dashboard works
- [ ] Update API base URL (if needed)
- [ ] Test on multiple browsers

### ✅ Security Review

- [ ] No hardcoded passwords in code
- [ ] `.env` file NOT in git
- [ ] Admin key changed from default
- [ ] CORS origin configured correctly

### ✅ Backup

- [ ] Backup current Quiz/data/ folder
- [ ] Export all data as JSON
- [ ] Document current configuration

---

## 2️⃣ Hosting Options

Choose one based on your needs:

### Option A: **Heroku** (Easiest for Beginners)

- **Cost**: Free tier available
- **Setup Time**: 15 minutes
- **Best for**: Quick deployment

### Option B: **DigitalOcean** (Most Affordable)

- **Cost**: ~$5/month
- **Setup Time**: 30 minutes
- **Best for**: Production use

### Option C: **Railway** (Modern & Simple)

- **Cost**: ~$5/month (or free tier)
- **Setup Time**: 10 minutes
- **Best for**: Node.js apps

### Option D: **Self-Hosted** (Full Control)

- **Cost**: Depends on your server
- **Setup Time**: 1-2 hours
- **Best for**: Advanced users

---

## 3️⃣ HEROKU Deployment (Recommended for Beginners)

### Step 1: Install Heroku CLI

```bash
# Download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login to Heroku

```bash
heroku login
```

### Step 3: Create App

```bash
cd Quiz/backend
heroku create your-app-name
```

### Step 4: Set Environment Variables

```bash
heroku config:set PORT=4000
heroku config:set JWT_SECRET=your-super-secret-key-change-this-12345
heroku config:set ADMIN_KEY=your-admin-key-change-this
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
```

### Step 5: Deploy Backend

```bash
git push heroku main
# OR
heroku deploy --source-dir=Quiz/backend
```

### Step 6: Host Frontend

Use Vercel, Netlify, or GitHub Pages:

- Push frontend files to GitHub
- Connect Vercel/Netlify to GitHub repo
- Deploy automatically

### Step 7: Connect Frontend to Backend

In browser console:

```javascript
localStorage.setItem("quizApiBase", "https://your-app-name.herokuapp.com/api");
```

---

## 4️⃣ DIGITALOCEAN Deployment (Best Value)

### Step 1: Create Droplet

- Go to: https://www.digitalocean.com
- Create new Droplet (Ubuntu 22.04, $5/month)
- Enable backups

### Step 2: SSH into Server

```bash
ssh root@your-server-ip
```

### Step 3: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 4: Clone Your Code

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo/Quiz/backend
npm install
```

### Step 5: Create Production .env

```bash
nano .env
```

Add:

```
PORT=3000
JWT_SECRET=change-this-to-random-string
ADMIN_KEY=change-this-to-random-key
CORS_ORIGIN=https://your-frontend-domain.com
```

### Step 6: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 start src/server.js --name "quiz-api"
pm2 startup
pm2 save
```

### Step 7: Setup Nginx (Reverse Proxy)

```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/default
```

Replace with:

```nginx
server {
    listen 80 default_server;
    server_name _;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: Setup SSL Certificate

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 5️⃣ Railway Deployment (Modern Alternative)

### Step 1: Sign Up

- Go to: https://railway.app
- Sign up with GitHub

### Step 2: Create New Project

- Click "New Project"
- Select "Deploy from GitHub"
- Choose your repository

### Step 3: Configure Service

- Select backend folder: `Quiz/backend`
- Add environment variables:
  - `JWT_SECRET`
  - `ADMIN_KEY`
  - `CORS_ORIGIN`

### Step 4: Deploy

- Railway auto-deploys when you push to GitHub
- Get your API URL from Railway dashboard

### Step 5: Connect Frontend

```javascript
localStorage.setItem("quizApiBase", "https://your-railway-domain/api");
```

---

## 6️⃣ Production Environment Variables

### Required (.env file)

```
# Server
PORT=4000
NODE_ENV=production

# Security
JWT_SECRET=generate-with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ADMIN_KEY=generate-secure-key-at-least-20-chars

# CORS (Allow your frontend domain)
CORS_ORIGIN=https://your-domain.com

# Optional
LOG_LEVEL=info
```

### Generate Secure Keys

```bash
# Run in terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to your `.env` file.

---

## 7️⃣ Frontend Deployment

### Option A: Netlify (Easiest)

```bash
# 1. Push code to GitHub
# 2. Go to https://netlify.com
# 3. Connect GitHub repository
# 4. Deploy automatically on each push
```

### Option B: Vercel (Best for SPAs)

```bash
# 1. Push code to GitHub
# 2. Go to https://vercel.com
# 3. Import project
# 4. Deploy
```

### Option C: GitHub Pages

```bash
# 1. Push to GitHub
# 2. Settings → Pages → Deploy from main branch
# Note: Must be public repo
```

### Option D: DigitalOcean (With Backend)

```bash
# Place frontend files in /var/www/html
# Configure Nginx (see step 7 above)
```

---

## 8️⃣ Database Backup Strategy

### Automatic Daily Backup

Create `backup.sh`:

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p ~/backups
cp -r ~/your-repo/Quiz/backend/data ~/backups/data_$TIMESTAMP
# Keep only last 30 days
find ~/backups -type d -name "data_*" -mtime +30 -exec rm -rf {} +
```

Schedule with cron:

```bash
crontab -e
# Add: 0 2 * * * /home/user/backup.sh
```

### Export Data Regularly

Use admin dashboard to export as JSON:

- Visit: `https://your-domain.com/admin`
- Go to Export tab
- Download JSON backup

---

## 9️⃣ Monitoring & Maintenance

### Check Server Health

```bash
# SSH into your server
ssh root@your-server-ip

# Check backend process
pm2 status

# View logs
pm2 logs quiz-api

# Restart if needed
pm2 restart quiz-api
```

### Monitor Disk Space

```bash
df -h

# If low on space, delete old backups
rm -rf ~/backups/data_old-dates
```

### Update Node.js

```bash
# Check current version
node --version

# Update (varies by hosting)
# Heroku: Updates automatically
# DigitalOcean: See documentation
```

---

## 🔟 Troubleshooting

### Backend not responding

```bash
# Check if server is running
pm2 status

# Restart
pm2 restart quiz-api

# Check logs
pm2 logs quiz-api
```

### CORS errors in browser

- Check `CORS_ORIGIN` in `.env` matches frontend domain
- Frontend URL must include protocol (`https://` not `https`)

### Can't connect to database

- Check JSON files exist in `data/` folder
- Check folder has read/write permissions
- Manual restart: `pm2 restart quiz-api`

### SSL certificate issues

```bash
# Renew certificate (DigitalOcean)
sudo certbot renew --force-renewal
```

---

## 🎯 Quick Reference

| Step          | Local         | Production                |
| ------------- | ------------- | ------------------------- |
| Start backend | `npm run dev` | `pm2 start src/server.js` |
| View logs     | Console       | `pm2 logs`                |
| Update code   | Git pull      | Git pull + restart        |
| Backup data   | Manual export | Automated script          |
| Monitor       | Manual check  | Uptime monitoring service |

---

## ✅ Final Checklist Before Going Live

- [ ] Backend running on production server
- [ ] Frontend hosted and accessible
- [ ] SSL/HTTPS enabled
- [ ] Environment variables set correctly
- [ ] Admin login works
- [ ] Quiz functionality tested end-to-end
- [ ] Data backup strategy implemented
- [ ] Monitoring alerts configured
- [ ] Admin email setup (optional)
- [ ] Documentation updated

---

## Support & Next Steps

### Need Help?

1. Check [Node.js Docs](https://nodejs.org)
2. Review [Express Docs](https://expressjs.com)
3. See hosting provider's documentation

### After Deployment

- Monitor system logs
- Regular backups
- Security updates
- User feedback gathering

---

**Good luck with your deployment! 🚀**
