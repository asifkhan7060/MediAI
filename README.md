<p align="center">
  <img src="https://img.shields.io/badge/MediAI-Healthcare%20Platform-0EA5E9?style=for-the-badge&logo=hospital&logoColor=white" alt="MediAI" />
</p>

<h1 align="center">🏥 MediAI — AI-Powered Healthcare Platform</h1>

<p align="center">
  <em>Bridging the gap between patients and healthcare professionals using Artificial Intelligence</em>
</p>

<p align="center">
  <a href="https://medi-ai-maaz.vercel.app"><img src="https://img.shields.io/badge/🌐_Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" /></a>
  <a href="https://mediai-backend-oa88.onrender.com/api/health"><img src="https://img.shields.io/badge/🔗_API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live%20%E2%9C%85-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-Groq%20%2B%20Mistral%20API-FF6F00?style=flat-square&logo=ai&logoColor=white" />
  <img src="https://img.shields.io/badge/Auth-Firebase%20Google-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Socket.io-Real--Time-010101?style=flat-square&logo=socket.io&logoColor=white" />
</p>

---

## 📋 Table of Contents

- [Live Demo](#-live-demo)
- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [User Roles & Dashboards](#-user-roles--dashboards)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Live Demo

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | [medi-ai-maaz.vercel.app](https://medi-ai-maaz.vercel.app) | ✅ Live |
| **Backend API** | [mediai-backend-oa88.onrender.com](https://mediai-backend-oa88.onrender.com/api/health) | ✅ Live |
| **Database** | MongoDB Atlas (Cloud) | ✅ Connected |

> **Note:** The backend is hosted on Render's free tier. After 15 minutes of inactivity, the first request may take ~30-50 seconds (cold start).

---

## 🚨 Problem Statement

Accessing reliable medical advice and finding the right specialist can be overwhelming for patients. Key challenges include:

- **Symptom Confusion** — Patients struggle to understand their symptoms and often rely on unreliable sources for self-diagnosis.
- **Language Barriers** — Non-English speakers face difficulties describing symptoms to medical professionals or digital tools.
- **Complex Medical Reports** — Lab reports with technical jargon and reference ranges are difficult for the average person to interpret.
- **Finding the Right Doctor** — Patients don't know which specialist to consult for their condition, leading to unnecessary visits.
- **Delayed Treatment** — Hesitation and lack of clarity often result in delayed diagnosis and increased anxiety.
- **Fragmented Healthcare** — Booking appointments, managing payments, and communicating with doctors happen across multiple disconnected platforms.

---

## 💡 Our Solution

**MediAI** is a comprehensive, AI-powered healthcare platform that acts as a one-stop solution for patients seeking medical assistance. It leverages **cloud-based AI APIs** (Groq + Mistral) to provide fast, scalable, and intelligent healthcare guidance — from symptom analysis to doctor consultation.

### What Makes MediAI Different?

| Feature | Traditional Apps | MediAI |
|---------|-----------------|--------|
| AI Processing | Slow / no AI | **Cloud AI via Groq (Llama 3.3) + Mistral API** |
| Language Support | English only | **Hindi, Hinglish, Marathi + Voice Input** |
| Report Analysis | Manual reading | **AI-powered OCR + Simplified Explanations** |
| Doctor Matching | Manual search | **AI-driven specialist recommendation** |
| Home Remedies | Generic tips | **Condition-specific natural remedies with safety warnings** |
| Authentication | Email/Password only | **Firebase Google Sign-In + JWT** |

---

## ✨ Key Features

### 🔍 1. Multimodal AI Symptom Checker
- Input symptoms via **text or voice** in multiple languages (English, Hindi, Hinglish, Marathi)
- AI analyzes symptoms using **Llama 3.3 LLM** via Groq Cloud API
- Returns **top 2 disease predictions** with confidence levels (low/medium/high) and **clinical reasoning**
- LLM considers **symptom combinations** and avoids false positives (e.g., no Paralysis without numbness)
- Minimum 2 symptoms required for reliable AI inference
- Includes doctor specialist routing and safety disclaimers

### 🌿 2. AI Home Remedies Assistant
- Get **safe, natural home remedies** for predicted conditions before your appointment
- Remedies include ingredients, preparation methods, and dosage guidelines
- **Crucial warning signs** highlighted — tells you when to stop self-care and seek urgent help
- Powered by Groq AI (Llama 3.3) for context-aware, condition-specific suggestions

### 👨‍⚕️ 3. Smart Doctor Recommendations
- AI recommends the **best-suited specialists** dynamically matching the disease without hardcoded limitations (See All)
- Doctors sorted by **relevance, rating, experience, and proximity**
- Detailed doctor profiles with qualifications, fees, and availability schedules
- **Patient reviews and ratings** system for informed decision-making

### 📊 4. Medical Report Analyzer
- **Upload medical reports** (images/photos of lab reports)
- **Tesseract.js OCR** extracts text from report images
- **AI analyzes** extracted data and provides:
  - Simplified explanations in plain language
  - Highlighted abnormal values with significance
  - Recommended follow-up actions
  - Severity assessment

### 📍 5. Nearby Hospitals & Doctors Locator
### 📍 5. Nearby Hospitals & Clinics Locator
- **GPS-based** location detection using browser geolocation API
- **OpenStreetMap Nominatim API** integration for fast, reliable hospital discovery without payload timeouts
- **Strict Haversine spherical math** applied for precise radius filtering
- **OSRM / Google Maps Distance Matrix API** fallback chain for accurate road-based travel calculations
- Filter by distance and rating seamlessly
- Filter by specialty, distance, and rating

### 📅 6. Seamless Appointment Booking
- Browse available time slots from doctor schedules
- **Real-time availability** — no double bookings
- Appointment confirmation with status tracking (Pending → Confirmed → Completed)
- Appointment history for both patients and doctors

### 💬 7. Real-Time Chat (Socket.io)
- **Instant messaging** between patients and doctors
- **Typing indicators** and read receipts
- Chat rooms created per appointment for organized communication
- **Bidirectional Unread Message Notifications:** Dynamic red UI alert badges populating directly over Appointment lists for both Patients and Doctors
- Online/offline status tracking

### 💳 8. Payment Integration (Razorpay)
- Secure **Razorpay payment gateway** integration
- Payment verification with cryptographic signature validation
- Payment history and receipt generation
- Refund tracking for cancelled appointments

### 🤖 9. AI Medical Chatbot
- General-purpose **medical Q&A chatbot** powered by Mistral AI API
- Ask any health-related question and get instant AI responses
- Maintains conversation context for follow-up questions
- Includes appropriate medical disclaimers

### 🚨 10. Advanced Emergency Mode
- **Floating Action Button (FAB)**: Quick-access red emergency button available on all patient pages.
- **Confirmation Modal**: Intermediary step to prevent accidental triggers with "Call Now" and "Activate Mode" options.
- **Full-Screen Emergency UI**: High-contrast, urgent red UI that disables normal navigation for focused help.
- **GPS Location Integration**: Auto-fetches coordinates and generates a shareable Google Maps link message.
- **Instant Actions**: Large, accessible buttons for Calling 108, Finding Nearby Hospitals, and sharing location details.
- **Safety Guidance**: Static instructions to help users stay calm and prioritize safety during a crisis.

### 🏢 11. Hospital Support Directory
- **Centralized Contact Info**: Dedicated page for primary healthcare facility details.
- **Editable Directory**: Administrative capability to update hospital name, address, phone, and about section.
- **Quick Support Actions**: "Call Support" and "Send Email" demo integrations for rapid assistance.

### 🔐 12. Role-Based Authentication & Dashboards
- **Firebase Google Sign-In** + **JWT-based** secure authentication
- Three user roles: **Patient, Doctor, Admin**
- Each role has a dedicated dashboard with relevant features
- Protected routes with role-based access control

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │   React   │  │ Tailwind │  │  Framer  │  │  shadcn/ui   │  │
│  │ TypeScript│  │   CSS    │  │  Motion  │  │  Components  │  │
│  └─────┬─────┘  └──────────┘  └──────────┘  └──────────────┘  │
│        │                                                        │
│  ┌─────┴──────────────────────────────────────────────────┐    │
│  │  React Router v6  │  Axios HTTP  │  Socket.io Client   │    │
│  └─────┬─────────────┴──────┬───────┴─────────┬───────────┘    │
└────────┼────────────────────┼─────────────────┼────────────────┘
         │ REST API           │ REST API        │ WebSocket
         ▼                    ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js + Express)                    │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │
│  │   Auth   │  │ Symptom   │  │  Report   │  │   Chat via  │  │
│  │  (JWT)   │  │ Analysis  │  │ Analyzer  │  │  Socket.io  │  │
│  ├──────────┤  ├───────────┤  ├───────────┤  ├─────────────┤  │
│  │ Doctors  │  │ Home      │  │ Chatbot   │  │  Emergency  │  │
│  │ CRUD     │  │ Remedies  │  │ AI Q&A    │  │  Services   │  │
│  ├──────────┤  ├───────────┤  ├───────────┤  ├─────────────┤  │
│  │Appt Mgmt │  │ AI Doctor │  │ Admin     │  │  Payments   │  │
│  │& Booking │  │ Recommend │  │ Panel     │  │ (Razorpay)  │  │
│  └─────┬────┘  └─────┬─────┘  └─────┬─────┘  └──────┬──────┘  │
└────────┼─────────────┼───────────────┼───────────────┼─────────┘
         │             │               │               │
         ▼             ▼               │               │
┌─────────────┐  ┌───────────┐        │               │
│   MongoDB   │  │  Ollama   │        │               │
│  (Mongoose) │  │(Llama3.1) │        │               │
│             │  │  Local AI │        │               │
│ Collections:│  └───────────┘        │               │
│ • Users     │                       │               │
│ • Doctors   │  ┌───────────┐        │               │
│ • Patients  │  │Tesseract  │◄───────┘               │
│ • Appts     │  │   (OCR)   │                        │
│ • Messages  │  └───────────┘  ┌───────────┐         │
│ • Payments  │                 │ Razorpay  │◄────────┘
│ • Reviews   │                 │   API     │
└─────────────┘                 └───────────┘
```

### Data Flow

1. **Symptom Analysis Flow:**
   `User Input → Symptom Normalization (Dictionary + Mistral fallback) → Ollama (Llama 3.1) → LLM Disease Prediction with Reasoning → Doctor Specialist Mapping → Doctor Recommendation → Appointment Booking`

2. **Report Analysis Flow:**
   `Image Upload → Multer → Tesseract.js OCR → Text Extraction → Ollama AI Analysis → Simplified Report`

3. **Chat Flow:**
   `User Message → Socket.io → Server → MongoDB (persist) → Socket.io → Recipient`

4. **Payment Flow:**
   `Appointment → Razorpay Order → Payment Gateway → Webhook Verification → Payment Confirmed`

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI component library with hooks |
| **TypeScript** | Type-safe JavaScript for fewer bugs |
| **Vite** | Lightning-fast dev server & build tool |
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | Accessible, customizable component library |
| **Framer Motion** | Smooth animations & page transitions |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **Socket.io Client** | Real-time WebSocket communication |
| **Leaflet + React-Leaflet** | Interactive maps |
| **Recharts** | Data visualization & charts |
| **React Three Fiber** | 3D graphics on the landing page |
| **Lucide React** | Beautiful icon library |
| **Zod** | Schema validation |
| **React Hook Form** | Performant form handling |
| **TanStack React Query** | Server state management & caching |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web application framework |
| **MongoDB + Mongoose** | NoSQL database with ODM |
| **Socket.io** | Real-time bidirectional communication |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Multer** | File upload handling |
| **Tesseract.js** | OCR (Optical Character Recognition) |
| **Nodemailer** | Email notifications |
| **Razorpay SDK** | Payment gateway integration |

### AI & NLP
| Technology | Purpose |
|-----------|---------|
| **Groq Cloud API** | Ultra-fast LLM inference platform |
| **Llama 3.3 (via Groq)** | Primary LLM for symptom-to-disease prediction with clinical reasoning |
| **Mistral AI API** | LLM for chatbot, report analysis, symptom normalization fallback & home remedies |
| **Web Speech API** | Browser-native voice input |

### Deployment & Infrastructure
| Technology | Purpose |
|-----------|---------|
| **Vercel** | Frontend hosting (React + Vite) |
| **Render** | Backend hosting (Node.js + Express) |
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Firebase** | Google OAuth authentication |

---

## 📁 Project Structure

```
MediAI/
├── 📄 index.html                    # Entry HTML file
├── 📄 package.json                  # Frontend dependencies
├── 📄 vite.config.ts                # Vite configuration
├── 📄 tailwind.config.ts            # Tailwind CSS configuration
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 .env                          # Frontend environment variables
│
├── 📂 src/                          # Frontend source code
│   ├── 📄 main.tsx                  # React entry point
│   ├── 📄 App.tsx                   # Root component with routing
│   ├── 📄 index.css                 # Global styles
│   │
│   ├── 📂 pages/                    # Page components
│   │   ├── 📄 Home.tsx              # Landing page with 3D hero
│   │   ├── 📄 SymptomChecker.tsx    # AI symptom analysis page
│   │   ├── 📄 Chatbot.tsx           # AI medical chatbot
│   │   ├── 📄 ReportAnalyzer.tsx    # Medical report analysis
│   │   ├── 📄 Doctors.tsx           # Doctor listing & search
│   │   ├── 📄 NearbyDoctors.tsx     # Map-based doctor finder
│   │   ├── 📄 BookAppointment.tsx   # Appointment booking
│   │   ├── 📄 Emergency.tsx         # Emergency services
│   │   ├── 📄 Login.tsx             # User login
│   │   ├── 📄 Register.tsx          # User registration
│   │   └── 📂 dashboard/            # Role-based dashboards
│   │       ├── 📄 PatientDashboard.tsx
│   │       ├── 📄 PatientAppointments.tsx
│   │       ├── 📄 PatientPayments.tsx
│   │       ├── 📄 PatientProfile.tsx
│   │       ├── 📄 PaymentGateway.tsx
│   │       ├── 📄 DoctorDashboard.tsx
│   │       ├── 📄 DoctorAppointments.tsx
│   │       ├── 📄 DoctorProfile.tsx
│   │       ├── 📄 DoctorSchedule.tsx
│   │       ├── 📄 ChatRoom.tsx
│   │       ├── 📄 AdminDashboard.tsx
│   │       ├── 📄 AdminDoctors.tsx
│   │       ├── 📄 AdminUsers.tsx
│   │       └── 📄 AdminAppointments.tsx
│   │
│   ├── 📂 components/               # Reusable components
│   │   ├── 📄 Navbar.tsx            # Navigation bar
│   │   ├── 📄 DashboardLayout.tsx   # Dashboard sidebar layout
│   │   ├── 📄 HeroScene.tsx         # 3D landing page scene
│   │   ├── 📄 HomeRemedies.tsx      # AI home remedies component
│   │   ├── 📄 VoiceInput.tsx        # Voice input component
│   │   ├── 📄 DoctorCard.tsx        # Doctor info card
│   │   ├── 📄 Disclaimer.tsx        # Medical disclaimer
│   │   ├── 📄 RateDoctorDialog.tsx  # Doctor rating modal
│   │   ├── 📄 ProtectedRoute.tsx    # Auth route guard
│   │   ├── 📄 PatientOnlyRoute.tsx  # Patient role guard
│   │   └── 📂 ui/                   # shadcn/ui components
│   │
│   ├── 📂 context/                  # React context providers
│   │   ├── 📄 AuthContext.tsx       # Authentication state
│   │   └── 📄 ThemeContext.tsx       # Dark/Light theme
│   │
│   ├── 📂 hooks/                    # Custom React hooks
│   ├── 📂 lib/                      # Utilities & configs
│   │   ├── 📄 api.ts               # Axios API client
│   │   ├── 📄 symptoms.ts          # Symptom data mapping
│   │   ├── 📄 diseaseMapping.ts    # Disease-to-specialist mapping
│   │   └── 📄 types.ts             # TypeScript type definitions
│   └── 📂 integrations/            # Third-party integrations
│
├── 📂 server/                       # Backend source code
│   ├── 📄 server.js                 # Express app + Socket.io setup
│   ├── 📄 package.json              # Backend dependencies
│   ├── 📄 .env                      # Backend environment variables
│   ├── 📄 .env.example              # Environment template
│   │
│   ├── 📂 config/
│   │   └── 📄 db.js                 # MongoDB connection
│   │
│   ├── 📂 models/                   # Mongoose schemas
│   │   ├── 📄 User.js              # Base user model
│   │   ├── 📄 Doctor.js            # Doctor profile model
│   │   ├── 📄 Patient.js           # Patient profile model
│   │   ├── 📄 Appointment.js       # Appointment model
│   │   ├── 📄 Message.js           # Chat message model
│   │   ├── 📄 Payment.js           # Payment record model
│   │   └── 📄 Review.js            # Doctor review model
│   │
│   ├── 📂 controllers/              # Business logic
│   │   ├── 📄 authController.js             # Login/Register
│   │   ├── 📄 symptomController.js          # Symptom analysis
│   │   ├── 📄 symptomNormalizationController.js  # Multi-language normalization
│   │   ├── 📄 aiController.js               # AI report analysis
│   │   ├── 📄 homeRemediesController.js     # AI home remedies
│   │   ├── 📄 chatbotController.js          # AI chatbot
│   │   ├── 📄 doctorController.js           # Doctor CRUD
│   │   ├── 📄 appointmentController.js      # Appointment management
│   │   ├── 📄 chatController.js             # Chat messages
│   │   ├── 📄 paymentController.js          # Payment processing
│   │   ├── 📄 reviewController.js           # Doctor reviews
│   │   ├── 📄 adminController.js            # Admin operations
│   │   └── 📄 emergencyController.js        # Emergency services
│   │
│   ├── 📂 routes/                    # API route definitions
│   │   ├── 📄 authRoutes.js
│   │   ├── 📄 symptomRoutes.js
│   │   ├── 📄 aiRoutes.js
│   │   ├── 📄 chatbotRoutes.js
│   │   ├── 📄 doctorRoutes.js
│   │   ├── 📄 appointmentRoutes.js
│   │   ├── 📄 chatRoutes.js
│   │   ├── 📄 paymentRoutes.js
│   │   ├── 📄 reviewRoutes.js
│   │   ├── 📄 adminRoutes.js
│   │   └── 📄 emergencyRoutes.js
│   │
│   ├── 📂 middleware/                # Express middleware
│   │   ├── 📄 auth.js               # JWT verification
│   │   └── 📄 roleCheck.js          # Role-based access control
│   │
│   ├── 📂 utils/
│   │   └── 📄 seedDoctors.js        # Database seeder script
│   │
│   └── 📂 uploads/                   # Uploaded report images
│
└── 📂 public/                        # Static assets
    └── 📂 data/                      # Static data files
```

---

## 🚀 Deployment

MediAI is deployed using a split architecture:

| Component | Platform | URL |
|-----------|----------|-----|
| **Frontend** | Vercel | [medi-ai-maaz.vercel.app](https://medi-ai-maaz.vercel.app) |
| **Backend** | Render | [mediai-backend-oa88.onrender.com](https://mediai-backend-oa88.onrender.com/api/health) |
| **Database** | MongoDB Atlas | Cloud cluster (`cluster0.gvls0ef.mongodb.net`) |
| **Auth** | Firebase | Google Sign-In OAuth |
| **AI (Symptoms)** | Groq API | Llama 3.3 70B model |
| **AI (Chatbot)** | Mistral API | Mistral Large model |

### Deployment Config Files
- `vercel.json` — SPA rewrite rules for React Router
- `server/package.json` — Build command includes DB seeding on first deploy
- `.npmrc` — Handles peer dependency conflicts during Vercel builds

---

## 📋 Prerequisites

Before running MediAI **locally**, ensure you have the following installed:

| Requirement | Version | Download Link |
|------------|---------|---------------|
| **Node.js** | v18+ | [nodejs.org](https://nodejs.org/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

> **Note:** AI features use cloud APIs (Groq + Mistral) — no local AI setup needed. You'll need API keys from [console.groq.com](https://console.groq.com/keys) and [console.mistral.ai](https://console.mistral.ai/api-keys).

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/MaazKhan-29/MediAI.git
cd MediAI
```


### Step 2: Configure Environment Variables

**Backend** — Copy the example file and update values:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your credentials (see [Environment Variables](#-environment-variables) section below).

**Frontend** — Create a `.env` file in the project root:

```env
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

### Step 3: Install Dependencies

**Frontend (from project root):**

```bash
npm install --legacy-peer-deps
```

**Backend:**

```bash
cd server
npm install
```

### Step 4: Seed the Database

Populate the database with sample doctors and admin account:

```bash
cd server
npm run seed
```

> This creates **15+ sample doctors** across specializations and a default **admin account**.

### Step 5: Start Services

You need **2 terminals** running simultaneously:

**Terminal 1 — Backend Server:**
```bash
cd server
npm run dev
```

> ✅ Backend runs on `http://localhost:5000`

**Terminal 2 — Frontend Dev Server:**
```bash
# From project root
npm run dev
```

> ✅ Frontend runs on `http://localhost:8080`

### Step 6: Open the Application

Navigate to **http://localhost:8080** in your browser. 🎉

---

## 🔐 Environment Variables

### Backend (`server/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/mediai` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_strong_random_secret_key` |
| `PORT` | Backend server port | `5000` |
| `GROQ_API_KEY` | Groq API key for Llama 3.3 | `gsk_xxxxx` |
| `MISTRAL_API_KEY` | Mistral API key for chatbot | `your_mistral_key` |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID | `rzp_test_xxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay API Secret | `your_razorpay_secret` |
| `EMAIL_HOST` | SMTP email host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP email port | `587` |
| `EMAIL_USER` | Email address for notifications | `your_email@gmail.com` |
| `EMAIL_PASS` | Email app password | `your_app_password` |
| `CLIENT_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |
| `ADMIN_EMAILS` | Admin emails (comma-separated) | `admin@example.com` |
| `NODE_ENV` | Environment mode | `production` |

### Frontend (`.env` at project root)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GOOGLE_MAPS_KEY` | Google Maps API Key | `AIzaSy...` |

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/doctors` | List all approved doctors |
| `GET` | `/api/doctors/:id` | Get doctor details |
| `PUT` | `/api/doctors/profile` | Update doctor profile |
| `GET` | `/api/doctors/nearby` | Find nearby doctors |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/appointments` | Book a new appointment |
| `GET` | `/api/appointments/my` | Get user's appointments |
| `PUT` | `/api/appointments/:id/status` | Update appointment status |

### AI Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/symptoms/predict` | LLM-powered symptom → disease prediction (Groq/Llama 3.3) |
| `GET`  | `/api/symptoms/list` | Get all available symptoms for autocomplete |
| `POST` | `/api/symptoms/normalize` | Multilingual symptom normalization |
| `POST` | `/api/doctors/recommend` | Predict diseases + recommend ranked doctors |
| `POST` | `/api/ai/analyze-report` | AI medical report analysis (Groq) |
| `POST` | `/api/chatbot/message` | AI chatbot conversation (Mistral API) |
| `POST` | `/api/ai/home-remedies` | AI home remedy suggestions (Groq) |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments/create-order` | Create Razorpay order |
| `POST` | `/api/payments/verify` | Verify payment signature |
| `GET` | `/api/payments/history` | Get payment history |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/chat/:roomId` | Get chat messages |
| `POST` | `/api/chat/send` | Send a message |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/reviews` | Submit a doctor review |
| `GET` | `/api/reviews/:doctorId` | Get doctor reviews |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/dashboard` | Dashboard statistics |
| `GET` | `/api/admin/users` | List all users |
| `GET` | `/api/admin/doctors` | List all doctors (incl. pending) |
| `PUT` | `/api/admin/doctors/:id/approve` | Approve/reject doctor |

### Emergency
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/emergency/nearby` | Find nearby emergency services |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health status |

---

## 👥 User Roles & Dashboards

### 🧑‍💼 Patient
- View AI-predicted conditions and recommended doctors
- Book appointments and make payments
- Chat with doctors in real-time
- View appointment history and payment records
- Upload & analyze medical reports
- Rate and review doctors
- Access emergency mode via floating button for rapid assistance
- View and search hospital support information directory

### 👨‍⚕️ Doctor
- View and manage incoming appointments
- Accept/reject appointment requests
- Set availability schedule (day & time slots)
- Chat with patients
- View earnings and patient feedback
- Update professional profile

### 🛡️ Admin
- Dashboard with platform-wide analytics (users, appointments, revenue)
- Approve or reject doctor registrations
- Manage all users and doctors
- Update hospital support directory information
- View and manage all appointments
- Monitor platform activity

**Default Admin Credentials** (after seeding):
```
Email:    admin@mediai.com
Password: Admin@123
```

---

## 🧪 Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

---

## 🛠 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Port 5000 already in use` | Run `taskkill /F /IM node.exe` (Windows) or `kill -9 $(lsof -ti :5000)` (Mac/Linux) |
| Backend slow first load | Render free tier cold start — wait ~30-50s, subsequent requests are fast |
| MongoDB connection failed | Check `MONGO_URI` in env — ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0` |
| Symptom prediction fails | Verify `GROQ_API_KEY` is valid at [console.groq.com](https://console.groq.com) |
| Chatbot errors | Verify `MISTRAL_API_KEY` is valid at [console.mistral.ai](https://console.mistral.ai) |
| Google Sign-In fails | Add your domain to Firebase Console → Authentication → Authorized Domains |
| Prediction needs 2+ symptoms | This is by design — select at least 2 symptoms for accurate LLM prediction |
| Frontend can't reach backend | Check CORS — ensure `CLIENT_URL` in `server/.env` matches frontend URL |
| `npm install` fails | Try `npm install --legacy-peer-deps` or check `.npmrc` has `legacy-peer-deps=true` |
| Report upload fails | Ensure `server/uploads/` directory exists with write permissions |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is developed as a **Mini Project** for the **TE Sem 6** curriculum. It is intended for educational purposes.

---

<p align="center">
  Made with ❤️ by the MediAI Team
</p>
