# MedLink | Healthcare Directory & Appointment Booking

A localized healthcare directory and appointment booking web application built with a Node/Express backend (MongoDB/Mongoose) and a React (Vite + Tailwind CSS) frontend. Features AI-powered symptom analysis to map patient symptoms directly to medical specialists.

## Tech Stack

- **Database:** MongoDB with Mongoose ODM
- **Backend:** Node.js & Express.js
- **Frontend:** React.js, Tailwind CSS, Vite
- **Authentication:** JSON Web Tokens (JWT) with secure role routing
- **AI Integration:** Google Gemini API / OpenAI API with keyword-based rule-matching fallback

---

## Getting Started

### Unified Workspace Commands (Recommended)

From the root project folder, you can manage both backend and frontend directories using these shortcuts:

1. **Install all dependencies** (for both frontend and backend):
   ```bash
   npm run install-all
   ```

2. **Run Development Servers**:
   - Start the backend: `npm run dev-backend`
   - Start the frontend client: `npm run dev-frontend`

3. **Build Frontend Static Assets**:
   ```bash
   npm run build-prod
   ```

---

### Prerequisites

Make sure you have Node.js (version 16+) and MongoDB installed on your local system, or use a MongoDB Atlas connection string.

---

### Step 1: Set Up & Run the Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables in `.env`:
   - Open [backend/.env](file:///d:/health_care.app/backend/.env)
   - Update `MONGO_URI` if your MongoDB runs on a different port or name.
   - (Optional) Provide `GEMINI_API_KEY` or `OPENAI_API_KEY` to run the AI symptom checker. Otherwise, the app automatically runs on a robust rules-based keyword fallback.

4. (Optional) Run the diagnostic database connection script to verify schemas and connection:
   ```bash
   node scripts/testConnection.js
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server runs on [http://localhost:5000](http://localhost:5000).*

---

### Step 2: Set Up & Run the Frontend

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The client app boots on [http://localhost:3000](http://localhost:3000) (requests are automatically proxied to the backend).*

---

## Core Features & Testing Walkthrough

### 1. Authentication System
- Go to the navbar and select **Patient Portal** to register as a new patient (specify name, email, password, phone, and city).
- Select **Doctor Portal** to register as a new Specialist Doctor (specify specialty, experience years, clinic address, and phone).

### 2. AI Symptom Router
- Log in as a Patient.
- Enter natural symptoms in the AI Symptom Assistant (e.g. `"I have a severe headache, slight dizziness and blurry vision"`).
- Hit **Map Symptoms to Specialty**.
- The AI will route you to the correct specialty (e.g. `Neurologist`) and explain why. It will automatically apply the search filter.

### 3. Booking Engine with Concurrency Control
- In the Patient Dashboard, search for doctors in your city.
- Click **Book Appointment** on a doctor's card.
- The calendar dynamically checks the doctor's weekly limits (e.g., if a doctor works Mon-Fri, weekend dates will show no slots).
- Time slots are generated based on the doctor's starting hour, ending hour, and slot duration.
- Already booked slots on that date are dynamically excluded.
- Duplicate bookings on the exact same `[doctorId, date, timeslot]` are rejected at both controller and database levels (compound unique index) to avoid double booking.

### 4. Doctor Dashboard
- Log in as a Doctor.
- Go to **My Schedule** to view your agenda. View pending requests and choose to **Confirm**, **Cancel**, or mark as **Completed**.
- Go to **Availability Limits** to adjust your working schedule: add or remove working days, adjust starting/ending hours, and set custom slot durations (15m, 20m, 30m, 45m, 60m).
