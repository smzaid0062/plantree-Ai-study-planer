<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=30&duration=3000&pause=800&color=16A34A&center=true&vCenter=true&width=900&lines=Plantree+%E2%80%93+AI+Study+Planner;Generative+AI+%2B+Adaptive+Scheduling;Plan+smarter.+Study+better.+Grow+daily." alt="Typing animation" />

<br/>

<img src="https://img.shields.io/badge/Status-Live-16A34A?style=for-the-badge" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/Express-REST%20API-000000?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/OpenRouter-NVIDIA%20Nemotron-76B900?style=for-the-badge&logo=nvidia&logoColor=white" />
<img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
<img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />

<br/><br/>

<a href="https://plantree.vercel.app"><img src="https://img.shields.io/badge/%F0%9F%9A%80_Live_Demo-Visit_Site-16A34A?style=for-the-badge" /></a>
&nbsp;
<a href="#-getting-started"><img src="https://img.shields.io/badge/%F0%9F%93%A6_Quick_Start-Setup-0ea5e9?style=for-the-badge" /></a>
&nbsp;
<a href="#-api-reference"><img src="https://img.shields.io/badge/%F0%9F%93%98_API-Reference-8b5cf6?style=for-the-badge" /></a>

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Data Flow](#-data-flow)
- [AI Pipeline](#-ai-pipeline)
- [Gamification (XP & Streak)](#-gamification-xp--streak)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌱 Overview

**Plantree** is a full-stack AI study planner. It turns a raw syllabus into a
day-by-day study schedule, tracks progress, replans when sessions are missed,
and keeps students motivated with XP, levels and streaks.

| Problem | Plantree's answer |
|---|---|
| Manual timetables take hours | AI parses the syllabus and estimates hours per topic |
| Missed days break the plan | Adaptive replanning reschedules remaining topics |
| No idea how much was studied | Timed sessions and a GitHub-style activity heatmap |
| Hard to know if you're ready | Analytics, quizzes unlocked at 100% completion |
| Scattered learning material | AI-suggested resources, bookmarked per topic |

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🧠 AI Planning
- Syllabus parsing from text or PDF
- Day-by-day plan with daily-hour limits
- Adaptive replanning for missed topics

### ⏱️ Study Tracking
- Timer with SVG progress ring
- Sessions grouped by topic
- Activity heatmap (365 days)

</td>
<td width="50%">

### 🎯 Assessment and Growth
- AI MCQ quiz per completed subject
- XP, levels and streak bonuses
- Analytics and exam countdown

### 📚 Resources
- AI-suggested learning links
- Bookmark per topic, search and filter

</td>
</tr>
</table>

---

## 🏗️ Architecture

```mermaid
flowchart LR
    subgraph Client["🖥️ Client (Vercel)"]
        UI["React 18 + Vite<br/>TailwindCSS · Recharts"]
        AX["Axios + JWT interceptor"]
        UI --> AX
    end

    subgraph Server["⚙️ Server (Render, Docker)"]
        CORS["CORS + JSON middleware"]
        AUTH["JWT middleware"]
        ROUTES["REST routes<br/>auth · subjects · topics<br/>ai · sessions · quiz · resources"]
        CTRL["Controllers"]
        XP["XP & Streak utils"]
        CORS --> AUTH --> ROUTES --> CTRL
        CTRL --> XP
    end

    subgraph Data["🗄️ Data"]
        DB[("MongoDB Atlas<br/>users · subjects · topics<br/>studysessions · resources")]
    end

    subgraph AI["🤖 AI"]
        OR["OpenRouter API<br/>NVIDIA Nemotron 3 Ultra"]
    end

    AX -- "HTTPS + Bearer JWT" --> CORS
    CTRL -- "Mongoose" --> DB
    CTRL -- "Prompt → JSON" --> OR
```

### Layer responsibilities

| Layer | Responsibility |
|---|---|
| **Client** | Rendering, routing, optimistic UI, toast notifications |
| **Middleware** | CORS allow-list, body parsing, JWT verification |
| **Routes / Controllers** | Input validation, business logic, response shaping |
| **Utilities** | XP awarding, level calculation, streak computation |
| **Data** | Persistent storage, per-user isolation via `userId` |
| **AI** | Stateless prompt in, structured JSON out |

---

## 🔄 Data Flow

### 1. Plan generation

```mermaid
sequenceDiagram
    autonumber
    actor S as Student
    participant FE as React App
    participant BE as Express API
    participant DB as MongoDB
    participant AI as OpenRouter AI

    S->>FE: Paste syllabus
    FE->>BE: POST /api/ai/parse-syllabus
    BE->>AI: Prompt: extract topics + hours
    AI-->>BE: JSON array of topics
    BE->>DB: Insert topics (pending)
    BE-->>FE: Topics created

    S->>FE: Generate plan
    FE->>BE: POST /api/ai/generate-plan
    BE->>DB: Fetch pending topics + exam dates
    BE->>AI: Prompt: schedule within daily limit
    AI-->>BE: [{topicId, scheduledDate}]
    BE->>DB: Update scheduledDate per topic
    BE-->>FE: Plan ready
```

### 2. Study session and gamification

```mermaid
sequenceDiagram
    autonumber
    actor S as Student
    participant FE as Timer UI
    participant BE as Sessions API
    participant DB as MongoDB

    S->>FE: Stop and save
    FE->>BE: POST /api/sessions {topicId, hours}
    BE->>DB: Insert StudySession
    BE->>DB: Topic → in_progress
    BE->>DB: Award XP (session)
    BE->>DB: Compute streak from sessions
    alt streak ≥ 3 days
        BE->>DB: Award streak bonus XP
    end
    BE-->>FE: session + gamification{xp, level, streak}
    FE-->>S: Toast: +XP · Level up · Streak
```

### 3. Adaptive replanning

```mermaid
flowchart TD
    A([Student misses sessions]) --> B[Find topics where<br/>scheduledDate < today<br/>and status ≠ done]
    B --> C[Merge with future pending topics]
    C --> D[Send to AI with today's date<br/>and daily capacity]
    D --> E{Valid JSON<br/>array?}
    E -- Yes --> F[Update scheduledDate per topic]
    E -- No --> G[Retry parse strategies]
    G --> E
    F --> H([Calendar and My Plan refresh])
```

---

## 🤖 AI Pipeline

| Task | Input | Output | Endpoint |
|---|---|---|---|
| Syllabus parsing | Raw text or PDF | Topics + estimated hours | `POST /api/ai/parse-syllabus` |
| Plan generation | Pending topics, exam dates, daily hours | `topicId` → `scheduledDate` | `POST /api/ai/generate-plan` |
| Replanning | Missed + future topics | Fresh schedule from today | `POST /api/ai/replan` |
| Quiz | Topic titles of a subject | 10 MCQs with answers | `POST /api/quiz/generate` |
| Resources | Topic and subject name | 6 links (video, article, docs, book) | `POST /api/resources/suggest` |

### Reliability of AI output

Language models sometimes add prose or markdown around JSON, so every response
goes through three parse strategies:

```
1. JSON.parse(raw)                      → success? done
2. Regex: first [ ... ] block → parse   → success? done
3. Strip ```json fences → parse         → success? done
4. Return 500 with a user-facing message
```

---

## 🏆 Gamification (XP & Streak)

```
Topic completed     → +20 XP
Study session       → +5 XP per 30 min (minimum 5)
Quiz completed      → +10 XP + (score × 2)
3+ day streak       → +10 XP streak bonus

Level  = floor(sqrt(XP / 100)) + 1
Streak = consecutive days with at least one session (IST)
```

| Level | XP needed |
|---|---|
| 1 → 2 | 100 |
| 2 → 3 | 400 |
| 3 → 4 | 900 |
| 4 → 5 | 1600 |

---

## 🧰 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18, Vite | Fast dev loop, component model |
| Styling | TailwindCSS v3 | Consistent design tokens |
| Charts | Recharts | Declarative, React-native charts |
| Routing | React Router v6 | Protected routes |
| HTTP | Axios | Interceptors for JWT and 401 handling |
| Backend | Node.js 20, Express | Lightweight REST API |
| Database | MongoDB Atlas, Mongoose | Flexible documents, schema validation |
| Auth | JWT, bcryptjs | Stateless auth, salted password hashes |
| AI | OpenRouter (NVIDIA Nemotron 3 Ultra) | Free tier, OpenAI-compatible SDK |
| Uploads | Multer, pdf-parse | PDF syllabus extraction |
| Containers | Docker, Docker Compose | Reproducible local environment |
| Hosting | Render (API), Vercel (SPA) | Free tiers, auto-deploy from `main` |

---

## 🗄️ Database Schema

```mermaid
erDiagram
    USER ||--o{ SUBJECT : owns
    USER ||--o{ RESOURCE : bookmarks
    SUBJECT ||--o{ TOPIC : contains
    TOPIC ||--o{ STUDY_SESSION : "studied in"
    USER ||--o{ STUDY_SESSION : logs

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password "bcrypt hash"
        number dailyStudyHours
        number xp
        array xpHistory
    }
    SUBJECT {
        ObjectId _id PK
        ObjectId userId FK
        string name
        date examDate
        string color
        number totalTopics
        number completedTopics
    }
    TOPIC {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId subjectId FK
        string title
        number estimatedHours
        string status "pending | in_progress | done"
        date scheduledDate
        date completedAt
        number order
    }
    STUDY_SESSION {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId topicId FK
        number hoursStudied
        string notes
        date date
    }
    RESOURCE {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId topicId FK
        string title
        string url
        string type
        boolean isSaved
    }
```

Every document carries a `userId`, and every query filters by the
authenticated user, so one student can never read another's data.

---

## 📡 API Reference

Base URL: `https://<your-backend>.onrender.com` · Protected routes need
`Authorization: Bearer <token>`.

| Group | Method | Endpoint | Auth |
|---|---|---|---|
| Auth | `POST` | `/api/auth/register` | ❌ |
| Auth | `POST` | `/api/auth/login` | ❌ |
| Auth | `GET` / `PATCH` | `/api/auth/me` | ✅ |
| Subjects | `POST` / `GET` | `/api/subjects` | ✅ |
| Subjects | `PATCH` / `DELETE` | `/api/subjects/:id` | ✅ |
| Topics | `POST` | `/api/topics` | ✅ |
| Topics | `GET` | `/api/topics/:subjectId` | ✅ |
| Topics | `GET` | `/api/topics/today` | ✅ |
| Topics | `PATCH` | `/api/topics/:id/status` | ✅ |
| AI | `POST` | `/api/ai/parse-syllabus` | ✅ |
| AI | `POST` | `/api/ai/generate-plan` | ✅ |
| AI | `POST` | `/api/ai/replan` | ✅ |
| AI | `GET` | `/api/ai/dashboard` | ✅ |
| Sessions | `POST` / `GET` | `/api/sessions` | ✅ |
| Sessions | `GET` | `/api/sessions/activity` | ✅ |
| Sessions | `GET` | `/api/sessions/streak` | ✅ |
| Quiz | `POST` | `/api/quiz/generate` | ✅ |
| Quiz | `POST` | `/api/quiz/complete` | ✅ |
| Resources | `POST` | `/api/resources/suggest` | ✅ |
| Resources | `POST` | `/api/resources/save` | ✅ |
| Resources | `GET` | `/api/resources` | ✅ |
| Resources | `DELETE` | `/api/resources/:id` | ✅ |

### Sample: save a study session

```bash
curl -X POST https://<backend>/api/sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"topicId":"665f...","hoursStudied":1.5,"notes":"Recursion basics"}'
```

```json
{
  "success": true,
  "data": { "_id": "...", "hoursStudied": 1.5 },
  "gamification": {
    "xp": { "xp": 180, "level": 2, "leveledUp": true, "gained": 15 },
    "streak": 4,
    "streakBonus": { "gained": 10 }
  }
}
```

---

## 📁 Project Structure

```
plantree-ai-study-planer/
├── backend/
│   ├── src/
│   │   ├── config/        # db.js, ai.js (OpenRouter client)
│   │   ├── controllers/   # ai, resource, topic, subject, auth
│   │   ├── middleware/    # auth.middleware.js (JWT)
│   │   ├── models/        # User, Subject, Topic, StudySession, Resource
│   │   ├── routes/        # one router per feature
│   │   └── utils/         # xp.js, streak.js
│   ├── Dockerfile
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # layout, dashboard, cards, common
│   │   ├── context/       # AuthContext
│   │   ├── hooks/         # useDashboard
│   │   ├── pages/         # Dashboard, MyPlan, Subjects, Quiz, ...
│   │   ├── services/      # api.js (Axios instance)
│   │   └── utils/         # gamification.js, xpNotify.js
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vercel.json
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Option A: Docker Compose (recommended)

```bash
git clone https://github.com/smzaid0062/plantree-Ai-study-planer.git
cd plantree-Ai-study-planer

cp backend/.env.example backend/.env.local   # fill in values
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| MongoDB | mongodb://localhost:27017 |

### Option B: Run manually

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend (new terminal)
cd frontend
npm install
echo "VITE_API_URL=" > .env.local    # empty: Vite proxy handles /api
npm run dev
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Example | Required |
|---|---|---|
| `PORT` | `5000` | ✅ |
| `MONGO_USERNAME` | `atlas_user` | ✅ (Atlas) |
| `MONGO_PASSWORD` | `••••••` | ✅ (Atlas) |
| `MONGO_CLUSTER` | `cluster0.xxxxx.mongodb.net` | ✅ (Atlas) |
| `MONGO_DB_NAME` | `plantree` | ✅ |
| `MONGO_APP_NAME` | `Cluster0` | ✅ |
| `JWT_SECRET` | `long-random-string` | ✅ |
| `OPENROUTER_API_KEY` | `sk-or-...` | ✅ |
| `CLIENT_URL` | `https://plantree.vercel.app` | ✅ (CORS) |

### Frontend (`frontend/.env`)

| Variable | Local | Production |
|---|---|---|
| `VITE_API_URL` | *(empty, uses proxy)* | `https://<backend>.onrender.com` |

> ⚠️ Never commit `.env` files. Use the platform's environment settings in
> production.

---

## 🌍 Deployment

```mermaid
flowchart LR
    GH[(GitHub<br/>main branch)] -->|push| RN[Render<br/>Docker web service]
    GH -->|push| VC[Vercel<br/>static Vite build]
    RN --> ATLAS[(MongoDB Atlas)]
    VC -->|VITE_API_URL| RN
```

1. **Backend (Render):** New Web Service → root `backend` → Environment: Docker
   → add the variables above.
2. **Frontend (Vercel):** Import repo → root `frontend` → framework Vite →
   set `VITE_API_URL` to the Render URL. `vercel.json` handles SPA routing.
3. **Atlas:** Network Access → allow the Render egress IPs, or `0.0.0.0/0`
   for a demo project.
4. **CORS:** set `CLIENT_URL` on Render to the exact Vercel origin, with no
   trailing slash.

---

## 🧪 Testing

```bash
# Manual API checks (Postman collection in /docs)
# 1. Register → login → copy token
# 2. Create subject → parse syllabus → generate plan
# 3. Save session → verify gamification in response
# 4. Complete topic → verify XP and toast
```

| Area | Status |
|---|---|
| Auth (register, login, 401 handling) | ✅ Verified |
| Subjects and topics | ✅ Verified |
| AI parse, plan, replan | ✅ Verified |
| Sessions, heatmap, XP, streak | ✅ Verified |
| Quiz generation | ✅ Verified |
| Resources (UI) | 🔄 In progress |
| Docker Compose end-to-end | 🔄 In progress |

Automated tests (Jest + Supertest) are planned; see the roadmap.

---

## 🛡️ Security

- **Passwords:** bcrypt hashed with cost factor 12, never returned in responses
- **Auth:** JWT (7-day expiry) in `Authorization` header
- **Isolation:** every query filtered by the authenticated `userId`
- **CORS:** allow-list from `CLIENT_URL`, not `*`
- **Secrets:** environment variables only; `.env` files git-ignored
- **Input:** required fields validated before database writes
- **Errors:** generic messages to clients, details only in server logs

---

## 🗺️ Roadmap

- [x] AI syllabus parsing and planning
- [x] Adaptive replanning
- [x] Timed sessions and heatmap
- [x] XP, levels and streaks
- [x] AI quizzes and resources
- [ ] Spaced-repetition revision (SM-2)
- [ ] PDF notes chat (RAG)
- [ ] Automated test suite and CI pipeline
- [ ] Email and push reminders
- [ ] Shared study groups

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature
git commit -m "feat: describe the change"
git push -u origin feature/your-feature
```

Open a Pull Request against `main`. Keep commits small and follow the
conventional prefixes: `feat`, `fix`, `chore`, `docs`, `refactor`.

---

## 👨‍💻 Author

**Md Zaid**
MCA, Chandigarh University · Cloud Computing and DevOps
GitHub: [@smzaid0062](https://github.com/smzaid0062)

---

## 📄 License

Released under the [MIT License](LICENSE).

<div align="center">

### ⭐ If Plantree helped you study smarter, consider starring the repo.

<img src="https://capsule-render.vercel.app/api?type=waving&color=16A34A&height=120&section=footer" />

</div>
