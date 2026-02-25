# Quick Reference Guide

## 🚀 Common Commands

### Backend Management

#### Start Backend (Development)

```bash
cd Quiz/backend
npm run dev
```

#### Start Backend (Production)

```bash
cd Quiz/backend
npm start
```

#### Maintenance & Validation

```bash
cd Quiz/backend
npm run backup
npm run cleanup
npm run cleanup:users
npm run validate:data
npm run smoke:ui
npm run smoke:mem
npm run security:audit
```

#### With PM2 (Recommended for Production)

```bash
# Start
pm2 start src/server.js --name "quiz-api"

# View status
pm2 status

# View logs
pm2 logs quiz-api

# Restart
pm2 restart quiz-api

# Stop
pm2 stop quiz-api
```

---

### Frontend Management

#### Serve Frontend (Development)

```bash
cd Quiz
python -m http.server 8000

# Then visit: http://localhost:8000
```

#### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir Quiz
```

#### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod --cwd Quiz
```

---

### Environment Variables

#### View Current .env

```bash
cat Quiz/backend/.env
```

#### Edit .env

```bash
# Local development
nano Quiz/backend/.env

# Or use your editor
code Quiz/backend/.env
```

#### Set Environment Variable (Server)

```bash
export JWT_SECRET="your-secret"
export ADMIN_KEY="your-key"
```

#### Generate Secure Key

```bash
# Linux/Mac
openssl rand -hex 32

# Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))

# Or Node.js (any platform)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Database Management

#### Backup Data

```bash
# Create backup folder
mkdir ~/backups
cp -r Quiz/backend/data ~/backups/data_$(date +%Y%m%d_%H%M%S)
```

#### View Current Data

```bash
ls -la Quiz/backend/data/

# View specific file
cat Quiz/backend/data/users.json | python -m json.tool
```

#### Export All Data

```bash
# Using admin dashboard
1. Go to http://localhost:8000/admin
2. Enter admin key
3. Go to "Export" tab
4. Click "Export as JSON"
```

#### Export via API

```bash
curl -H "x-admin-key: your-admin-key" \
  http://localhost:4000/api/admin/export?format=json \
  > backup.json
```

#### Reset Data

```bash
# Delete all user data (keeps questions)
rm -rf Quiz/backend/data/users.json
rm -rf Quiz/backend/data/attempts.json
rm -rf Quiz/backend/data/syncPerformance.json
rm -rf Quiz/backend/data/syncSessions.json

# Restart backend to reinitialize
```

---

### Accessing Admin Dashboard

#### Local

```
http://localhost:8000/admin
Admin Key: value from Quiz/backend/.env (ADMIN_KEY)
```

#### Production (Example)

```
https://your-domain.com/admin
Admin Key: (your production key)
```

---

### Testing Endpoints

#### Health Check

```bash
curl http://localhost:4000/api/health
```

#### Get Categories

```bash
curl http://localhost:4000/api/categories
```

#### Get Questions

```bash
curl http://localhost:4000/api/questions?limit=5
```

#### Admin Stats (Requires Admin Key)

```bash
curl -H "x-admin-key: your-admin-key" \
  http://localhost:4000/api/admin/stats
```

---

### SSL/HTTPS Setup

#### Generate Self-Signed Certificate (Testing)

```bash
openssl req -x509 -newkey rsa:4096 -nodes \
  -out cert.pem -keyout key.pem -days 365
```

#### Using Let's Encrypt (Production)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Renew
sudo certbot renew
```

---

### Deployment Shortcuts

#### Deploy to Heroku

```bash
# One-time setup
heroku login
heroku create app-name

# Each deployment
git push heroku main
```

#### Deploy to Railway

```bash
# Link repository to Railway
# Railway auto-deploys on push
git push origin main
```

#### SCP to Server

```bash
# Upload files
scp -r Quiz/ user@server:/home/user/

# Or rsync (faster for updates)
rsync -avz Quiz/ user@server:/home/user/
```

---

### Monitoring & Logs

#### View Backend Logs

```bash
# PM2
pm2 logs quiz-api

# Last 100 lines
pm2 logs quiz-api --lines 100

# Tail (real-time)
pm2 logs quiz-api --raw
```

#### Check System Resources

```bash
# Memory usage
top

# Disk usage
df -h

# Network
netstat -tuln | grep 4000
```

#### View Application Errors

```bash
# Check Node process
ps aux | grep node

# Kill process if needed
kill -9 [PID]
```

---

### Security Tasks

#### Change Admin Key

1. Update `.env` file
2. Update environment variable on server
3. Restart backend
4. Notify admin of new key

#### Rotate JWT Secret

```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env
JWT_SECRET=new-secret

# Invalidate all sessions (users must log in again)
rm Quiz/backend/data/users.json  # Optional

# Restart
pm2 restart quiz-api
```

#### Test CORS

```bash
# From browser console
fetch('http://localhost:4000/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

### Troubleshooting Commands

#### Backend Not Starting

```bash
# Check if port in use
lsof -i :4000

# Kill process using port
kill -9 [PID]

# Check Node version
node --version

# Reinstall dependencies
cd Quiz/backend
rm -rf node_modules
npm install
```

#### Database Issues

```bash
# Check if data directory exists
ls -la Quiz/backend/data/

# Check read/write permissions
chmod 755 Quiz/backend/data/
chmod 644 Quiz/backend/data/*.json

# Verify JSON syntax
python -m json.tool Quiz/backend/data/questions.json
```

#### Frontend Can't Connect

```javascript
// In browser console
localStorage.setItem("quizApiBase", "http://localhost:4000/api");
location.reload();
```

---

### npm Commands

#### Display Version

```bash
npm version
```

#### List Installed Packages

```bash
npm list
```

#### Install Specific Version

```bash
npm install express@4.21.2
```

#### Update All Packages

```bash
npm update
npm audit fix
```

#### Remove Package

```bash
npm uninstall package-name
```

---

### Git Commands (If Using Version Control)

#### Clone Repository

```bash
git clone https://github.com/user/pharmacy-quiz.git
cd Quiz
```

#### Push to Remote

```bash
git add .
git commit -m "description"
git push origin main
```

#### View Logs

```bash
git log --oneline
```

---

### Cron Jobs (Automated Tasks)

#### Create Crontab Entry

```bash
crontab -e
```

#### Daily Backup at 2 AM

```
0 2 * * * /home/user/backup.sh
```

#### Weekly Data Export at Sunday Midnight

```
0 0 * * 0 curl -H "x-admin-key: KEY" http://localhost:4000/api/admin/export > /backups/export_$(date +%Y%m%d).json
```

---

### Performance Optimization

#### Reduce Bundle Size

```bash
# Minify CSS
cssnano styles.css > styles.min.css

# Minify JavaScript (if applicable)
terser engine.js > engine.min.js
```

#### Enable Compression

```nginx
# In Nginx config
gzip on;
gzip_types text/plain text/css application/json;
gzip_min_length 1000;
```

#### Cache Strategy

```javascript
// In browser
localStorage.setItem("quizQuestions", JSON.stringify(questions));
```

---

### Update Procedures

#### Update Backend Code

```bash
cd Quiz/backend
git pull origin main
npm install
npm audit fix
pm2 restart quiz-api
```

#### Update Node.js

```bash
# Check current version
node --version

# Install new version (NVM recommended)
nvm install 18
nvm use 18
```

---

### Common Port Numbers

| Service    | Port  | Used By            |
| ---------- | ----- | ------------------ |
| Frontend   | 8000  | Python HTTP Server |
| Backend    | 4000  | Express API        |
| Nginx      | 80    | Web Server (HTTP)  |
| HTTPS      | 443   | Web Server (HTTPS) |
| SSH        | 22    | Server Access      |
| MongoDB    | 27017 | Database (if used) |
| PostgreSQL | 5432  | Database (if used) |

---

### Quick Deployment Checklist

1. **Backup**: `cp -r Quiz quiz_backup_$(date +%Y%m%d)`
2. **Environment**: `nano Quiz/backend/.env` (verify)
3. **Install**: `cd Quiz/backend && npm install`
4. **Test**: `npm run dev` (verify it starts)
5. **Deploy**: `pm2 start src/server.js` (or your platform)
6. **Verify**: `curl http://localhost:4000/api/health`
7. **Monitor**: `pm2 logs quiz-api`

---

### Key Websites

| Resource     | URL                          |
| ------------ | ---------------------------- |
| Node.js Docs | https://nodejs.org/docs      |
| Express Docs | https://expressjs.com        |
| PM2 Docs     | https://pm2.keymetrics.io    |
| Heroku       | https://www.heroku.com       |
| Railway      | https://railway.app          |
| DigitalOcean | https://www.digitalocean.com |
| Netlify      | https://www.netlify.com      |
| Vercel       | https://vercel.com           |

---

**Save this file for quick reference during deployment and maintenance!**
