# 🏥 Pharmacy Quiz Platform

A comprehensive, full-stack pharmacy examination and study platform with real-time performance tracking and admin management.

---

## 📋 Features

### 👨‍🎓 Student Features

- **Multiple Quiz Modes**: Study, Exam, Smart (adaptive)
- **26 Pharmacy Categories**: Cardiology, Dermatology, etc.
- **Performance Tracking**: See accuracy by category
- **Practice History**: Review previous attempts
- **Weak Category Focus**: Target areas of improvement
- **Local & Cloud Storage**: Hybrid sync system

### 📊 Admin Dashboard

- **User Management**: Create, view, delete users
- **Question Management**: Add, edit, delete questions
- **Statistics**: Real-time performance metrics
- **Data Export**: JSON and CSV formats
- **System Controls**: Seed data, reset system
- **Secure Access**: Admin key authentication

### 🔧 Technical Features

- **Offline Support**: Works without internet
- **Real-time Sync**: Automatic data synchronization
- **RESTful API**: Clean, documented endpoints
- **JWT Authentication**: Secure user sessions
- **Password Hashing**: bcrypt encryption
- **CORS Enabled**: Cross-origin requests

---

## ⚙️ System Requirements

### Local Development

- Node.js 16+
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 100MB disk space

### Production

- Ubuntu 20.04+ or similar Linux
- Node.js 18+
- Nginx (optional, recommended)
- SSL certificate (recommended)

---

## 🚀 Quick Start (Local)

### 1. Install Backend

```bash
cd Quiz/backend
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env and set:
# - JWT_SECRET=your-secret-key
# - ADMIN_KEY=your-admin-key
```

### 3. Start Backend

```bash
npm run dev
# Backend running at http://localhost:4000
```

### 4. Start Frontend (New Terminal)

```bash
cd Quiz
python -m http.server 8000
# Frontend at http://localhost:8000
```

### 5. Access Application

- **Quiz**: http://localhost:8000
- **Admin**: http://localhost:8000/admin
- **API Health**: http://localhost:4000/api/health

---

## 📁 Project Structure

```
Quiz/
├── index.html              # Main quiz interface
├── admin/
│   └── index.html         # Admin dashboard
├── engine.js              # Quiz logic & state management
├── data.js                # Local question database
├── backendClient.js       # API client library
├── styles.css             # Frontend styling
├── backend/               # Express.js backend
│   ├── package.json
│   ├── .env              # Configuration (gitignored)
│   ├── src/
│   │   ├── server.js     # Express app & API routes
│   │   ├── auth.js       # JWT & password logic
│   │   ├── config.js     # Environment variables
│   │   ├── store.js      # JSON database layer
│   │   └── services/
│   │       └── questions.js
│   └── data/             # JSON data files
│       ├── users.json
│       ├── questions.json
│       ├── attempts.json
│       ├── syncSessions.json
│       └── syncPerformance.json
└── DEPLOYMENT.md         # Production deployment guide
```

---

## 🔌 API Endpoints

### Health

```
GET /api/health
```

### Authentication

```
POST /api/auth/register       # Sign up
POST /api/auth/login          # Sign in
GET  /api/auth/me            # Current user profile
```

### Questions

```
GET  /api/questions           # List questions (with filters)
GET  /api/categories          # Get all categories
```

### Quiz Attempts

```
POST /api/attempts/start      # Start a quiz
POST /api/attempts/:id/answer # Submit an answer
POST /api/attempts/:id/finish # End quiz & calculate score
GET  /api/attempts/history    # Get past attempts
GET  /api/dashboard           # User statistics
```

### Sync & Performance

```
POST /api/sync/performance    # Track question performance
POST /api/sync/sessions       # Record session summary
GET  /api/sync/history        # Get session history
GET  /api/sync/dashboard      # Performance analytics
```

### Admin (Requires x-admin-key header)

```
GET    /api/admin/stats              # System statistics
GET    /api/admin/users              # All users
DELETE /api/admin/users/:id          # Delete user
GET    /api/admin/questions          # All questions
POST   /api/admin/questions          # Add question
PUT    /api/admin/questions/:id      # Edit question
DELETE /api/admin/questions/:id      # Delete question
GET    /api/admin/export?format=json # Export data
POST   /api/admin/seed-questions     # Reload questions
POST   /api/admin/reset              # Reset system
```

---

## 🔐 Environment Variables

### Required

```env
PORT=4000
JWT_SECRET=your-secret-key-min-32-chars
ADMIN_KEY=your-admin-key-min-20-chars
```

### Optional

```env
CORS_ORIGIN=*
NODE_ENV=development
```

### Generate Secure Values

```bash
# Random 32-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 👥 User Roles

### Student

- Create account
- Take quizzes
- View personal statistics
- Access study materials

### Admin

- All student features +
- Manage users
- Create/edit questions
- View system statistics
- Export data
- Reset system

---

## 📱 Browser Support

| Browser | Version | Support |
| ------- | ------- | ------- |
| Chrome  | 90+     | ✅ Full |
| Firefox | 88+     | ✅ Full |
| Safari  | 14+     | ✅ Full |
| Edge    | 90+     | ✅ Full |
| IE      | Any     | ❌ No   |

---

## 🛠️ Development

### Available Scripts

```bash
# Backend
npm run dev              # Start with hot reload
npm run start           # Start production mode
npm test               # Run tests (if configured)

# Frontend
python -m http.server  # Serve on localhost:8000
```

### Code Style

- JavaScript: Modern ES6+
- HTML: Semantic
- CSS: Mobile-first

---

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on:

- Heroku setup
- DigitalOcean setup
- Railway setup
- Self-hosted setup
- SSL/HTTPS configuration
- Database backups
- Production monitoring

**Quick Deploy to Heroku:**

```bash
cd Quiz/backend
heroku create your-app-name
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

---

## 🔒 Security Checklist

- ✅ JWT tokens expire after 7 days
- ✅ Passwords hashed with bcrypt
- ✅ CORS validation enabled
- ✅ Admin routes require API key
- ✅ Input validation on all endpoints
- ✅ .env file not in version control

**For Production:**

- [ ] Change default JWT_SECRET
- [ ] Change default ADMIN_KEY
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS_ORIGIN
- [ ] Set NODE_ENV=production
- [ ] Regular backups
- [ ] Monitor error logs

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check Node.js version
node --version

# Check port is available
lsof -i :4000

# Clear npm cache
npm cache clean --force
npm install
```

### Frontend can't connect to backend

```javascript
// Check API base in console
localStorage.getItem("quizApiBase");

// Update if needed
localStorage.setItem("quizApiBase", "http://localhost:4000/api");
```

### Admin dashboard not loading

- Check admin key is correct
- Ensure backend is running
- Clear browser cache
- Check browser console for errors

---

## 📊 Statistics & Monitoring

### Available Metrics

- Total users registered
- Total questions in database
- Total quiz attempts
- Average accuracy by category
- Performance trends
- Session duration analysis

### View Stats

- **User Dashboard**: http://localhost:8000 (after login)
- **Admin Stats**: http://localhost:8000/admin (Statistics tab)
- **API Endpoint**: GET /api/admin/stats (with admin key)

---

## 💾 Data Management

### Backup

```bash
# Manual export
Visit: http://localhost:8000/admin → Export tab

# Or via API
curl -H "x-admin-key: YOUR_KEY" http://localhost:4000/api/admin/export
```

### Restore

- Delete JSON files in `Quiz/backend/data/`
- Restart backend (questions auto-seed)
- Use admin dashboard to re-add custom questions

---

## 🤝 Contributing

Found a bug or want to improve something?

1. Test locally
2. Document the issue
3. Submit changes with clear descriptions

---

## 📞 Support

### For Issues:

1. Check browser console for errors
2. Review backend logs (`pm2 logs`)
3. Verify environment variables
4. Check [DEPLOYMENT.md](DEPLOYMENT.md)

### For Questions:

- Review API documentation above
- Check backend code comments
- Test with Postman/Insomnia

---

## 📜 License

This project is provided as-is for educational purposes.

---

## 🎯 Roadmap

Potential future features:

- [ ] User authentication with email verification
- [ ] Real-time leaderboards
- [ ] AI-powered question recommendations
- [ ] Mobile app (React Native/Flutter)
- [ ] Video explanations
- [ ] PDF test generation
- [ ] Multiple languages
- [ ] Timed mode with countdown
- [ ] Study group collaboration
- [ ] Performance analytics dashboard

---

## 📈 Performance

### Optimization

- Questions cached in browser
- Lazy loading for images
- Minimal dependencies
- Efficient JSON parsing
- IndexedDB for offline storage

### Benchmarks

- Page load: < 2 seconds
- API response: < 200ms
- Quiz questions: < 50mb total

---

## 🔄 Version History

| Version | Date     | Changes         |
| ------- | -------- | --------------- |
| 1.0.0   | Feb 2026 | Initial release |

---

**Last Updated**: February 23, 2026

**Questions?** Check the [DEPLOYMENT.md](DEPLOYMENT.md) guide or review the code documentation.

🚀 **Ready to deploy?** See DEPLOYMENT.md for production setup!
