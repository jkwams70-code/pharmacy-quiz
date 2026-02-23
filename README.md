# Pharmacy Quiz Backend

This backend adds persistent server-side APIs for:
- authentication (`register`, `login`, `me`)
- question bank + categories
- exam/study attempt lifecycle
- history + dashboard metrics
- sync endpoints used by the current frontend

## 1) Install

```bash
cd Quiz/backend
npm install
```

## 2) Configure

Copy `.env.example` to `.env` and set at least:

```env
PORT=4000
JWT_SECRET=replace-with-a-random-secret
```

## 3) Run

```bash
npm run dev
```

On first startup, questions are auto-seeded from `Quiz/data.js`.

## 4) Frontend

The frontend sends sync events to:

`http://localhost:4000/api`

If your backend runs on a different host/port, set in browser console once:

```js
localStorage.setItem("quizApiBase", "http://localhost:4000/api");
```

Then reload the quiz page.
