# SkillAble Backend — API Reference

## Base URL
```
http://localhost:8000/api/
```

## Authentication
All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## 1. AUTH ENDPOINTS

### POST /api/auth/signup/seeker/
Register a Job Seeker account.

**Request:**
```json
{
  "full_name": "Arjun Sharma",
  "email": "arjun@example.com",
  "password": "SecurePass123",
  "aadhaar_number": "234567891234",
  "pwd_certificate_id": "PWD-MH-2024-00123",
  "disability_type": "DEAF",
  "screen_reader": false,
  "voice_navigation": false,
  "sign_language_support": true
}
```

**Response 201:**
```json
{
  "message": "Account created successfully.",
  "email": "arjun@example.com"
}
```

**Validation errors (400):**
```json
{
  "aadhaar_number": ["Aadhaar must be exactly 12 digits."]
}
```

---

### POST /api/auth/signup/employer/
Register an Employer account (requires admin approval before posting jobs).

**Request:**
```json
{
  "full_name": "Priya Nair",
  "email": "priya@techcorp.com",
  "password": "SecurePass456",
  "company_name": "TechCorp India",
  "company_description": "Inclusive tech company hiring PWD professionals.",
  "company_website": "https://techcorp.in",
  "industry": "Technology",
  "location": "Bengaluru, Karnataka"
}
```

**Response 201:**
```json
{
  "message": "Employer account created. Awaiting admin approval.",
  "email": "priya@techcorp.com"
}
```

---

### POST /api/auth/login/
Obtain JWT tokens.

**Request:**
```json
{
  "email": "arjun@example.com",
  "password": "SecurePass123"
}
```

**Response 200:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
Token payload includes: `role`, `full_name`, `is_verified`.

---

### POST /api/auth/token/refresh/
**Request:** `{ "refresh": "<token>" }`
**Response:** `{ "access": "<new_access_token>" }`

---

### GET /api/auth/me/
Get the current user's full profile.

**Response 200:**
```json
{
  "id": 1,
  "email": "arjun@example.com",
  "full_name": "Arjun Sharma",
  "role": "JOB_SEEKER",
  "is_verified": false,
  "date_joined": "2024-01-15T10:30:00Z",
  "seeker_profile": {
    "disability_type": "DEAF",
    "pwd_certificate_id": "PWD-MH-2024-00123",
    "skills": ["Python", "Django"],
    "experience_years": 2,
    "education": [],
    "work_experience": []
  },
  "accessibility": {
    "screen_reader": false,
    "voice_navigation": false,
    "sign_language_support": true,
    "high_contrast": false,
    "font_size": "medium"
  }
}
```

---

### PATCH /api/auth/profile/seeker/
Update job seeker profile.

**Request:**
```json
{
  "skills": ["Python", "Django", "REST API", "PostgreSQL"],
  "experience_years": 3,
  "headline": "Backend Developer | Deaf Professional",
  "education": [
    {"degree": "B.Tech Computer Science", "institution": "VJTI Mumbai", "year": 2021}
  ],
  "work_experience": [
    {"title": "Junior Developer", "company": "StartupXYZ", "from": "2021-07", "to": "2023-12"}
  ]
}
```

---

### PATCH /api/auth/accessibility/
Update accessibility preferences.

**Request:**
```json
{
  "screen_reader": true,
  "font_size": "large",
  "high_contrast": true
}
```

---

## 2. JOBS ENDPOINTS

### GET /api/jobs/
List all active jobs with optional filters.

**Query Parameters:**
| Param | Values | Example |
|-------|--------|---------|
| `job_type` | FULL_TIME, PART_TIME, REMOTE, CONTRACT | `?job_type=REMOTE` |
| `location` | string | `?location=Mumbai` |
| `industry` | string | `?industry=Technology` |
| `is_accessibility_friendly` | true/false | `?is_accessibility_friendly=true` |
| `experience_level` | ENTRY, MID, SENIOR, LEAD | `?experience_level=ENTRY` |
| `skills` | comma-separated | `?skills=Python,Django` |
| `min_salary` | integer | `?min_salary=50000` |
| `search` | string | `?search=backend developer` |

**Response 200:**
```json
{
  "count": 42,
  "next": "http://localhost:8000/api/jobs/?page=2",
  "previous": null,
  "results": [
    {
      "id": 7,
      "title": "Backend Developer",
      "company_name": "TechCorp India",
      "location": "Bengaluru",
      "job_type": "FULL_TIME",
      "experience_level": "ENTRY",
      "required_skills": ["Python", "Django", "PostgreSQL"],
      "is_accessibility_friendly": true,
      "accessibility_features": ["Sign language interpreter", "Flexible hours"],
      "salary_min": 600000,
      "salary_max": 900000,
      "deadline": "2024-04-30",
      "created_at": "2024-03-01T09:00:00Z"
    }
  ]
}
```

---

### POST /api/jobs/   (Employer only)
Create a job posting.

**Request:**
```json
{
  "title": "Backend Developer",
  "description": "We are looking for a passionate backend developer...",
  "requirements": "3+ years of Django experience...",
  "required_skills": ["Python", "Django", "PostgreSQL", "REST API"],
  "job_type": "FULL_TIME",
  "experience_level": "MID",
  "location": "Bengaluru, Karnataka",
  "industry": "Technology",
  "is_accessibility_friendly": true,
  "accessibility_features": ["Sign language interpreter", "Flexible schedule", "Remote-friendly"],
  "salary_min": 700000,
  "salary_max": 1200000,
  "deadline": "2024-06-30"
}
```

---

### GET /api/jobs/{id}/match/   (Job Seeker only)
Check if this job matches your profile.

**Response 200:**
```json
{
  "job_id": 7,
  "match": true,
  "match_score": 0.75,
  "message": "This job matches your profile!",
  "matched_skills": ["Python", "Django", "PostgreSQL"],
  "missing_skills": ["REST API"]
}
```

---

### GET /api/jobs/my_jobs/   (Employer only)
List employer's own job postings.

---

## 3. APPLICATIONS ENDPOINTS

### POST /api/applications/   (Verified Job Seeker only)
Apply to a job.

**Request:**
```json
{
  "job": 7,
  "cover_letter": "I am excited to apply for this role..."
}
```

**Response 201:**
```json
{
  "id": 15,
  "job": 7,
  "job_title": "Backend Developer",
  "company_name": "TechCorp India",
  "status": "APPLIED",
  "cover_letter": "I am excited to apply...",
  "applied_at": "2024-03-10T14:22:00Z"
}
```

**Error — not verified (403):**
```json
{
  "detail": "Your account must be verified before applying to jobs."
}
```

---

### GET /api/applications/
List your applications (seeker) or received applications (employer).

---

### PATCH /api/applications/{id}/update_status/   (Employer only)
Update application status.

**Request:** `{ "status": "UNDER_REVIEW" }`

Valid statuses: `APPLIED`, `UNDER_REVIEW`, `INTERVIEW_SCHEDULED`, `REJECTED`, `HIRED`

---

## 4. RESUME ENDPOINTS

### POST /api/resumes/
Upload a resume. Triggers AI analysis automatically.

**Request:** `multipart/form-data`
```
file: <PDF or DOCX, max 5MB>
is_primary: true
```

**Response 201:**
```json
{
  "id": 3,
  "file": "/media/resumes/user_1/resume_v3.pdf",
  "version": 3,
  "is_primary": true,
  "uploaded_at": "2024-03-10T15:00:00Z",
  "analysis": {
    "score": 72.5,
    "missing_skills": ["Docker", "Kubernetes", "AWS"],
    "suggestions": [
      {
        "category": "formatting",
        "suggestion": "Add a professional summary at the top.",
        "priority": "high"
      },
      {
        "category": "skills",
        "suggestion": "Add more skills. Missing: Docker, AWS.",
        "priority": "high"
      }
    ],
    "role_compatibility": {
      "role": "Software Engineer",
      "score": 0.75,
      "all": {
        "Software Engineer": 0.75,
        "Data Analyst": 0.33,
        "Product Manager": 0.0
      }
    },
    "improved_resume_text": "...[AI-improved version]..."
  }
}
```

---

### POST /api/resumes/{id}/reanalyze/
Re-trigger AI analysis for an existing resume.

---

### PATCH /api/resumes/{id}/set_primary/
Mark a resume version as primary.

---

## 5. INTERVIEW ENDPOINTS

### POST /api/interviews/rooms/   (Employer only)
Schedule an interview room. Auto-updates application status to INTERVIEW_SCHEDULED.

**Request:**
```json
{
  "application": 15,
  "scheduled_at": "2024-04-05T10:00:00Z",
  "duration_minutes": 60,
  "notes": "Please join 5 minutes early. Sign language interpreter will be available."
}
```

**Response 201:**
```json
{
  "id": 2,
  "room_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "application": 15,
  "applicant_name": "Arjun Sharma",
  "job_title": "Backend Developer",
  "scheduled_at": "2024-04-05T10:00:00Z",
  "duration_minutes": 60,
  "room_url": "ws://localhost:8000/ws/interview/a1b2c3d4-e5f6-7890-abcd-ef1234567890/",
  "created_at": "2024-03-11T09:00:00Z"
}
```

---

## 6. WEBSOCKET — INTERVIEW ROOM

**Connect:**
```
ws://localhost:8000/ws/interview/<room_id>/
```
Include JWT token as query param or via subprotocol:
```
ws://localhost:8000/ws/interview/<room_id>/?token=<access_token>
```

**Send a chat message:**
```json
{ "type": "chat", "message": "Hello, can you hear me?" }
```

**Receive a chat message:**
```json
{
  "type": "chat",
  "message": "Hello, can you hear me?",
  "sender_id": 1,
  "sender_name": "Arjun Sharma"
}
```

**Send sign language landmarks (Deaf user):**
```json
{
  "type": "sign_data",
  "landmarks": [
    [0.52, 0.78, 0.001],
    [0.54, 0.72, 0.002],
    "... (21 points total)"
  ]
}
```

**Receive sign language result (broadcast to all):**
```json
{
  "type": "sign_result",
  "sender_id": 1,
  "sender_name": "Arjun Sharma",
  "gesture": "hello",
  "text": "Hello",
  "confidence": 0.92
}
```

**User joined/left events:**
```json
{ "type": "user_joined", "user_id": 2, "full_name": "Priya Nair" }
{ "type": "user_left",   "user_id": 2, "full_name": "Priya Nair" }
```

---

## 7. ACCESSIBILITY ENDPOINTS

### POST /api/accessibility/voice-command/
Process a voice navigation command (Blind users).

**Request:**
```json
{ "command": "Hello Bandhu search jobs" }
```

**Response — command recognised:**
```json
{
  "active": true,
  "matched": true,
  "command": "search jobs",
  "action": "navigate",
  "route": "/jobs",
  "message": "Opening job search."
}
```

**Response — filter command:**
```json
{
  "active": true,
  "matched": true,
  "command": "filter remote jobs",
  "action": "filter_jobs",
  "filters": { "job_type": "REMOTE" },
  "message": "Filtering for remote jobs."
}
```

**Response — activation phrase missing:**
```json
{
  "active": false,
  "message": "Say 'Hello Bandhu' to activate voice navigation."
}
```

---

### POST /api/accessibility/sign-language/
Predict sign language gesture from MediaPipe landmarks (standalone, outside interview).

**Request:**
```json
{
  "landmarks": [
    [0.52, 0.78, 0.001],
    [0.54, 0.72, 0.002],
    "... 21 points"
  ]
}
```

**Response:**
```json
{
  "gesture": "help",
  "text": "I need help",
  "confidence": 0.88
}
```

---

## 8. RESOURCES ENDPOINTS

### GET /api/resources/
List all published resources.

**Query Parameters:**
| Param | Values |
|-------|--------|
| `category` | category ID |
| `resource_type` | ARTICLE, VIDEO, WEBINAR, GUIDE, CHECKLIST |
| `is_accessible_for_blind` | true/false |
| `is_accessible_for_deaf` | true/false |
| `has_sign_language_video` | true/false |
| `search` | text search |

**Response 200:**
```json
{
  "count": 12,
  "results": [
    {
      "id": 1,
      "title": "Resume Building Guide for PWD Professionals",
      "category_name": "Career Development",
      "resource_type": "GUIDE",
      "description": "A comprehensive guide to building an inclusive resume...",
      "external_url": "https://skillable.in/guides/resume",
      "is_accessible_for_blind": true,
      "is_accessible_for_deaf": true,
      "has_sign_language_video": true,
      "has_audio_description": true
    }
  ]
}
```

### GET /api/resources/categories/
List all resource categories.

```json
[
  { "id": 1, "name": "Resume Building",      "slug": "resume-building" },
  { "id": 2, "name": "Interview Preparation","slug": "interview-prep" },
  { "id": 3, "name": "Workplace Rights",     "slug": "workplace-rights" },
  { "id": 4, "name": "Skill Development",    "slug": "skill-development" },
  { "id": 5, "name": "Career Development",   "slug": "career-development" },
  { "id": 6, "name": "Job Search Strategy",  "slug": "job-search-strategy" }
]
```

---

## 9. ERROR RESPONSES

| Code | Meaning |
|------|---------|
| 400  | Validation error — check `errors` field |
| 401  | Missing or invalid JWT token |
| 403  | Permission denied (wrong role, unverified account) |
| 404  | Resource not found |
| 422  | Unprocessable entity (e.g. invalid file type) |
| 429  | Rate limit exceeded (100/hr anon, 1000/hr user) |
| 503  | AI microservice unavailable |
| 504  | AI microservice timed out |
