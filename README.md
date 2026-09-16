# SkillSync | Next-Gen Skill Alignment & Readiness Platform

> An AI-driven, tri-stakeholder platform bridging **Students**, **Educational Institutes**, and **Industry** with real-time competency gap analysis, syllabus alignment, and predictive career matching.

---

## Architecture & Directory Layout

```
skill-alignment/
│
├── public/
│   └── favicon.svg              # Platform SVG favicon & mark
│
├── src/
│   │
│   ├── assets/
│   │   └── logo.svg             # Vector wordmark logo
│   │
│   ├── components/
│   │   ├── Navbar.jsx           # Global header with live role switcher & profile menu
│   │   ├── Sidebar.jsx          # Context-aware navigation per stakeholder role
│   │   ├── StatCard.jsx         # Glassmorphic KPI card with trends & progress tracks
│   │   ├── SkillChart.jsx       # Interactive SVG Radar/Spider and Gap Comparison bars
│   │   ├── RecommendationCard.jsx # Targeted course upskilling pathways
│   │   └── JobCard.jsx          # Calibrated job cards with matched vs missing skills
│   │
│   ├── pages/
│   │   ├── Login.jsx            # Multi-role authentication with 1-click demo login
│   │   ├── Signup.jsx           # Role registration (Student, Institute, Industry)
│   │   ├── StudentDashboard.jsx # Personalized gap radar, matched jobs, micro-assessment
│   │   ├── InstituteDashboard.jsx # Accreditation, dept readiness, syllabus gap analysis
│   │   └── IndustryDashboard.jsx# Talent pipeline search & competency demand broadcast
│   │
│   ├── layouts/
│   │   └── DashboardLayout.jsx  # Responsive grid & mobile drawer layout
│   │
│   ├── lib/
│   │   └── supabase.js          # Supabase client with seamless offline fallback
│   │
│   ├── data/
│   │   └── demoData.js          # Comprehensive seed telemetry for all 3 stakeholders
│   │
│   ├── hooks/
│   │   └── useAuth.js           # Auth state, instant role switching, and session management
│   │
│   ├── App.jsx                  # Main application orchestrator
│   ├── main.jsx                 # React 18 DOM mount point
│   └── index.css                # Design system, glassmorphic styles, and CSS variables
│
├── supabase/
│   └── schema.sql               # Production PostgreSQL DDL, RLS policies, and triggers
│
├── .env                         # Environment credentials
├── .env.example                 # Template for Supabase URL and Anon Key
├── package.json                 # Project dependencies & scripts
└── README.md                    # System documentation
```

---

## Key Features

### 1. Student Portal
- **Interactive Competency Radar**: Compare verified skill proficiencies against target industry standards and university curricula.
- **Dynamic Target Roles**: Switch between *Full Stack AI Engineer*, *Cloud DevOps Architect*, and *Data Science & MLOps* to see realtime gap shifts.
- **Skill Calibration Simulation**: Take a 5-minute micro-assessment to verify skills (e.g. Docker multi-stage builds) and boost alignment score instantly.
- **Missing Skills Breakdown**: Job cards highlight exact competencies matched vs missing (e.g. Docker, Kubernetes, LangChain).
- **Targeted Upskilling**: Actionable courses curated specifically to close the largest competency deltas.

### 2. Institute Portal
- **Market Demand Calibration**: Index curricula against 48 hiring partner tech stacks.
- **Department Telemetry**: Track alignment scores across Computer Science, AI & DS, IT, and ECE.
- **Discrepancy Remediation**: Discover critical curriculum deficits (e.g. Containerization or LLM Agent architectures) and adopt syllabus revisions in 1 click.
- **ABET / Accreditation Reports**: Export structured compliance data.

### 3. Industry Portal
- **Talent Discovery Pipeline**: Search and filter 340+ pre-calibrated student profiles by verified tech stack, GPA, and graduation year.
- **Syllabus Demand Broadcast**: Post new job requirements to directly feed back emerging skill demands into university syllabi.
- **Zero-Waste Interview Scheduling**: 1-click candidate screening invitation with pre-computed match scores.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Run Locally
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### Supabase Setup (Optional)
The application works immediately out of the box with built-in **Interactive Demo Mode**!
To connect to your live Supabase project:
1. Copy `.env.example` to `.env`.
2. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Run the SQL script located in `supabase/schema.sql` within your Supabase SQL Editor.
