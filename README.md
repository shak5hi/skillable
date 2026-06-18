# SkillAble 🚀

### Empowering People with Disabilities Through Inclusive Employment

SkillAble is an AI-powered inclusive job platform designed to connect people with disabilities with accessible employment opportunities. The platform bridges the gap between job seekers and employers by providing accessibility-first features, AI-assisted tools, and inclusive hiring workflows.

## 🌟 Problem Statement

Millions of talented individuals with disabilities face barriers in finding suitable employment due to:

* Limited accessibility in traditional job portals
* Lack of disability-friendly job listings
* Difficult interview processes
* Resume preparation challenges
* Communication barriers

SkillAble aims to create an inclusive ecosystem where every individual can access employment opportunities with dignity and confidence.

# ✨ Key Features

## 👨‍💼 For Job Seekers

### Job Discovery

* Browse accessible job opportunities
* Search and filter jobs by category
* View detailed job descriptions
* Disability-friendly workplace information

### Resume Management

* Upload resumes
* Resume storage and management
* AI-powered resume analysis
* Resume improvement suggestions

### Application Tracking

* Apply to jobs directly
* Track application status
* Manage submitted applications
* View interview invitations

### Accessibility Support

* Voice Navigation
* Keyboard-friendly navigation
* Accessibility settings panel
* Inclusive UI design

---

## 🏢 For Employers

### Employer Dashboard

* Manage job postings
* Track applicants
* Review candidate profiles
* Monitor recruitment activity

### Job Management

* Create new job listings
* Update job information
* Manage hiring workflow
* View application statistics


## 🤖 AI-Powered Features

### Resume Analysis Service

Uses AI to:

* Analyze uploaded resumes
* Extract candidate information
* Identify strengths and weaknesses
* Suggest resume improvements

### Sign Language Assistance

AI-based sign language recognition service for improved accessibility and communication support.

## 🎥 Interview Platform

Real-time interview rooms powered by WebSockets.

Features include:

* Live interview sessions
* Real-time communication
* Accessible interview experience
* Interactive interview management

# 🏗️ System Architecture

```text
┌─────────────────┐
│ React Frontend  │
└────────┬────────┘
         │ REST APIs
         ▼
┌─────────────────┐
│ Django Backend  │
│ Django REST API │
└───────┬─────────┘
        │
 ┌──────┼───────────┐
 │      │           │
 ▼      ▼           ▼
Jobs  Users    Applications
Service Service Service

        │
        ▼
 ┌─────────────────┐
 │ AI Microservices│
 ├─────────────────┤
 │ Resume Analysis │
 │ Sign Language   │
 └─────────────────┘

        │
        ▼
 PostgreSQL + Redis
```

---

# 🛠️ Tech Stack

## Frontend

* React 19
* Vite
* React Router
* Axios
* Zustand
* Framer Motion
* Tailwind CSS

## Backend

* Django 5
* Django REST Framework
* Django Channels
* JWT Authentication
* PostgreSQL
* Redis

## AI Services

* FastAPI
* Python
* NumPy
* PDF Processing
* Resume Parsing

## Real-Time Communication

* Django Channels
* WebSockets
* Daphne ASGI Server

---

# 📂 Project Structure

```text
SkillAble/
│
├── skillAble_frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   └── store/
│   └── public/
│
├── skillable_backend/
│   ├── users/
│   ├── jobs/
│   ├── applications/
│   ├── interviews/
│   ├── resumes/
│   ├── accessibility/
│   ├── resources/
│   ├── core/
│   └── ai_services/
│
└── README.md
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/your-username/SkillAble.git

cd SkillAble
```

---

## 2. Frontend Setup

```bash
cd skillAble_frontend

npm install

npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## 3. Backend Setup

```bash
cd skillable_backend

python -m venv venv

source venv/bin/activate
```

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Create admin user:

```bash
python manage.py createsuperuser
```

Start server:

```bash
python manage.py runserver
```

Backend runs at:

```text
http://localhost:8000
```

---

# 📡 API Modules

### Authentication

* User Registration
* User Login
* JWT Authentication

### Jobs

* Create Job
* Update Job
* Delete Job
* Browse Jobs

### Applications

* Apply for Jobs
* Track Applications
* Employer Review

### Resources

* Learning Resources
* Career Guidance
* Interview Preparation

### Accessibility

* Voice Navigation
* Accessibility Settings
* Sign Language Support

---

# 🎯 Accessibility First Design

SkillAble follows inclusive design principles:

✅ Keyboard Navigation

✅ Screen Reader Friendly

✅ Voice Navigation Support

✅ Accessible Color Contrast

✅ Responsive Design

✅ Inclusive User Experience

---

# 🚀 Future Enhancements

* AI Job Recommendation Engine
* Video Interview Analysis
* Speech-to-Text Integration
* Aadhaar-Based Verification
* Multi-Language Support
* AI Career Counselor
* Accessibility Compliance Checker
* Employer Accessibility Ratings

---

# 👥 Contributors

Built with ❤️ to create equal employment opportunities for everyone.

SkillAble believes that talent has no disability.

---

# 📜 License

This project is intended for educational, research, hackathon, and social impact purposes.

---

## 💡 Tagline

**"Inclusive Careers. Limitless Opportunities."**
