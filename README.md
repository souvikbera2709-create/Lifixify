<div align="center">

# 🌿 LiFixify — Gamified Life Operating System

### *Level Up Your Life, One Quest at a Time.*

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI_Coach-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

### 🎥 Project Walkthrough & Demo Video
👉 **[Watch the LiFixify Demonstration on Google Drive](https://drive.google.com/file/d/1m1oOr2vLseGd2mZhGvOMOPX8wh22sD5g/view?usp=share_link)** 👈

</div>

---

## 📖 Overview

**LiFixify** is a comprehensive, full-stack **Gamified Life Operating System (Life OS)** designed to transform everyday self-improvement into an immersive RPG journey. By blending cognitive habit tracking, structured wellness protocols, academic study sprints, and personal finance management with behavioral game psychology, LiFixify makes consistency addictively rewarding.

With **Lumina (AI Life Coach powered by Google Gemini)**, LiFixify analyzes your progress, creates personalized action plans, and keeps you accountable 24/7.

---

## 🌟 Key Features & Core Modules

### 1. 🤖 AI Life Coach (Lumina)
* **Google Gemini AI Integration**: Conversational assistant capable of analyzing habits, diagnosing burnout, recommending study intervals, and breaking down daunting goals into daily micro-quests.
* **Context-Aware Coaching**: Responds dynamically to your current level, active streak, and discipline progress.
* **Glassmorphic Slide-Over Drawer**: Accessible everywhere in the app with zero layout obstruction.

### 2. 🎮 RPG Gamification Engine
* **XP & Dynamic Leveling**: Earn XP for logging workouts, drinking water, hitting study goals, and checking off tasks.
* **Rank Titles**: Progress from *Novice Architect* up to *Transcendent Sovereign*.
* **Celebratory Milestones**: Interactive level-up modals featuring custom Web Audio sound effects and canvas confetti.
* **Discipline Streaks**: Active streak tracking with qualifying daily activity validation.

### 3. 🛍️ Rewards & Perk Shop
* **Custom Perk Management**: Add, customize, and delete real-life reward vouchers (e.g., *1 Hour Gaming Pass*, *Cheat Meal Feast*).
* **Coin Economy**: Earn coins through consistent habit completion and redeem them for guilt-free leisure.
* **Redemption History**: Dedicated logs tracking past redemptions with timestamps and individual removal capabilities.

### 4. ⚔️ Multi-Day Challenge Engine
* **Structured Campaigns**: Enroll in or create multi-day campaigns (e.g., *30-Day Peak Discipline*).
* **Day-by-Day Progression**: Unlock daily quest lists with specific XP rewards.
* **Full Campaign & Quest Management**: Complete control to add tasks, remove individual quests, or delete entire campaigns.

### 5. 🥗 Fitness & Nutrition Hub
* **Macro & Calorie Tracker**: Track daily consumed calories, protein, carbs, and fats against personalized targets with dynamic progress rings.
* **Hydration Tracker**: Incremental water tracker with milestone XP rewards.
* **Workout Logger & Custom Exercises**: Log sets, reps, and weights with an extensible exercise library supporting custom user-defined movements.

### 6. ⏱️ Study & Focus Buddy
* **Gamified Pomodoro Sprint Engine**: Preset sprints (25m Focus, 50m Deep Work, 5m/15m Breaks) plus customizable timers.
* **Subject & Topic Tracking**: Tag deep-work sessions with subjects and session notes.
* **Persistent History**: Stores past study logs, total minutes, and cumulative focus hours.

### 7. 💰 Personal Finance Hub
* **Income & Expense Tracking**: Categorized financial transactions with instant budget summaries.
* **Visual Expense Analytics**: Interactive spending charts powered by Recharts.
* **Financial Discipline Score**: Gamified feedback encouraging mindful saving.

### 8. 🏆 Community Leaderboard
* Real-time XP leaderboard showcasing rankings, player badges, streak counters, and player levels.

### 9. 🎨 Modern Design & Dual-Layer Persistence
* **Light Emerald & Midnight Dark Themes**: High-contrast, clean typography (*Outfit*, *Plus Jakarta Sans*, and *JetBrains Mono*) with immediate pre-render anti-flash hydration.
* **Dual-Layer Persistence**: Resilient local-first caching through `localStorage` coupled with debounced auto-saving to MongoDB Atlas.
* **Direct Deep Linking**: Preserves views across `/dashboard`, `/rewards`, `/study`, `/fitness`, `/finance`, and `/challenges` with SPA URL synchronization and history support.

---

## 🛠️ Tech Stack

### Frontend
* **Core**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
* **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with optimized localStorage middleware & debounced sync)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/), CSS variables
* **Data Visualization**: [Recharts](https://recharts.org/)
* **Icons & UI**: [Lucide React](https://lucide.dev/), [Canvas Confetti](https://www.kirilv.com/canvas-confetti/)
* **Audio**: Native Web Audio API sound synthesizer

### Backend
* **Runtime**: [Node.js](https://nodejs.org/), [Express 5](https://expressjs.com/)
* **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/)
* **Authentication**: JSON Web Tokens (JWT), HTTP-only cookies, [bcryptjs](https://www.npmjs.com/package/bcryptjs)
* **Artificial Intelligence**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Google Gemini Flash/Pro)
* **Security & Routing**: CORS, Cookie Parser, Dotenv

---

## 📁 Repository Structure

```text
lifixify/
├── backend/
│   ├── config/             # MongoDB connection configuration
│   ├── middleware/         # JWT verification & auth middleware
│   ├── models/             # Mongoose schemas (User, Fitness, Study, Challenge, Finance)
│   ├── routes/             # REST API routes (auth, ai, fitness, study, challenges, users)
│   ├── server.js           # Express server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # UI modules (RewardsShop, StudyBuddyHub, AiLifeCoach, etc.)
│   │   ├── services/       # Client-side API fetch client
│   │   ├── store/          # Zustand global store (useStore.js)
│   │   ├── utils/          # Web Audio sound effects & helpers
│   │   ├── App.jsx         # App router, deep linking & layout
│   │   ├── main.jsx        # React root entry
│   │   └── index.css       # Tailwind base styles & tokens
│   ├── index.html          # HTML entry with anti-flash theme script
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json         # SPA rewrite rules
├── vercel.json             # Root deployment configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18 or newer)
* **npm** or **yarn**
* **MongoDB** (local URI or MongoDB Atlas connection string)
* **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

---

### Installation & Setup

#### 1. Clone the repository
```bash
git clone https://github.com/souvikbera2709-create/Lifixify.git
cd Lifixify
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/lifixify?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Start the backend development server:
```bash
npm run dev
```

#### 3. Frontend Setup
Open a new terminal tab:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory (optional for local dev):
```env
VITE_API_URL=http://localhost:5001/api
```

Start the Vite development server:
```bash
npm run dev
```

Your app will be available at `http://localhost:5173`!

---

## 🎮 Video Demo & Presentation

Watch our detailed walkthrough covering feature flows, quest progression, AI coaching, and custom rewards:
* 🎬 **[Google Drive Video Demonstration](https://drive.google.com/file/d/1m1oOr2vLseGd2mZhGvOMOPX8wh22sD5g/view?usp=share_link)**

---

## 🤝 Contributing

Contributions are welcome! If you would like to submit improvements:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**. Feel free to use and adapt it for your own personal growth journey!
