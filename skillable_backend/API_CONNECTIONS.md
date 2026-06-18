# SkillAble Frontend-Backend API Connection Guide

## Overview
This document details all the REST API connections between the Django backend and React frontend for the SkillAble project.

## Base Configuration
- **Backend Base URL**: `http://localhost:8000`
- **Frontend API Client**: `src/api/axios.js`
- **Authentication**: JWT (JSON Web Tokens)
- **Token Storage**: localStorage (`access_token`, `refresh_token`)

---

## Authentication API

### Login (POST)
**Endpoint**: `/api/auth/login/`
**Frontend**: `src/pages/Login.jsx`
**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "JOB_SEEKER",
    "is_verified": true
  }
}
```

### Signup - Job Seeker (POST)
**Endpoint**: `/api/auth/signup/seeker/`
**Frontend**: `src/pages/SignupSeeker.jsx`
**Request**:
```json
{
  "email": "seeker@example.com",
  "password": "password123",
  "full_name": "Jane Seeker",
  "aadhaar_number": "123456789012",
  "pwd_certificate_id": "PWD123456",
  "disability_type": "Visual Impairment",
  "screen_reader": true,
  "voice_navigation": false,
  "sign_language_support": false
}
```

### Signup - Employer (POST)
**Endpoint**: `/api/auth/signup/employer/`
**Frontend**: `src/pages/SignupEmployer.jsx`
**Request**:
```json
{
  "email": "employer@company.com",
  "password": "password123",
  "full_name": "John Employer",
  "company_name": "Tech Company Inc",
  "company_description": "A tech startup",
  "company_website": "https://company.com",
  "industry": "IT",
  "location": "Bangalore"
}
```

### Token Refresh (POST)
**Endpoint**: `/api/auth/token/refresh/`
**Request**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```
**Response**:
```json
{
  "access": "new_access_token_here"
}
```

### Get Current User (GET)
**Endpoint**: `/api/auth/me/`
**Frontend**: Used in dashboard components
**Response**: User object with profiles

---

## Jobs API

###  Browse Jobs (GET)
**Endpoint**: `/api/jobs/`
**Frontend**: `src/pages/BrowseJobs.jsx`
**Query Parameters**:
```
- search: string (searches title, description, skills, location)
- job_type: FULL_TIME|PART_TIME|REMOTE|CONTRACT
- experience_level: ENTRY|MID|SENIOR|LEAD
- location: string
- industry: string
- is_accessibility_friendly: true|false
- skills: comma-separated list
```
**Example**: `/api/jobs/?search=react&job_type=FULL_TIME&is_accessibility_friendly=true`
**Response**:
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/jobs/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Senior Frontend Developer",
      "description": "...",
      "job_type": "FULL_TIME",
      "location": "Remote",
      "experience_level": "SENIOR",
      "required_skills": ["React", "JavaScript", "CSS"],
      "salary_min": 1200000,
      "salary_max": 1800000,
      "is_accessibility_friendly": true,
      "company_name": "Tech Corp",
      "company_website": "https://techcorp.com",
      "is_active": true,
      "created_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

### Check Job Match (GET)
**Endpoint**: `/api/jobs/{id}/match/`
**Frontend**: `src/pages/BrowseJobs.jsx` - "Check Match" button
**Authentication**: Required (Job Seeker)
**Response**:
```json
{
  "job_id": 1,
  "match": true,
  "match_score": 0.85,
  "message": "This job matches your profile!",
  "matched_skills": ["React", "JavaScript"],
  "missing_skills": ["TypeScript"]
}
```

### Post a Job (POST)
**Endpoint**: `/api/jobs/`
**Frontend**: `src/pages/PostJob.jsx`
**Authentication**: Required (Employer)
**Request**:
```json
{
  "title": "Senior Frontend Developer",
  "description": "We are looking for...",
  "requirements": "Must have 5+ years...",
  "job_type": "FULL_TIME",
  "experience_level": "SENIOR",
  "location": "Remote",
  "industry": "IT",
  "required_skills": ["React", "JavaScript", "TypeScript"],
  "salary_min": 1200000,
  "salary_max": 1800000,
  "is_accessibility_friendly": true,
  "accessibility_features": ["Sign Language Interpreter", "Screen Reader Compatible"],
  "deadline": "2026-03-31"
}
```

### My Jobs (GET)
**Endpoint**: `/api/jobs/my_jobs/`
**Frontend**: `src/pages/EmployerDashboard.jsx`
**Authentication**: Required (Employer)

---

## Applications API

### List Applications (GET)
**Endpoint**: `/api/applications/`
**Frontend**: `src/pages/MyApplications.jsx`
**Authentication**: Required
**Response**:
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "job": 101,
      "job_title": "Frontend Developer",
      "company_name": "Tech Corp",
      "status": "APPLIED",
      "cover_letter": "I am interested...",
      "applied_at": "2026-03-10T14:30:00Z",
      "updated_at": "2026-03-10T14:30:00Z"
    }
  ]
}
```

### Apply for a Job (POST)
**Endpoint**: `/api/applications/`
**Frontend**: `src/pages/JobDetail.jsx` (apply button)
**Authentication**: Required (Job Seeker)
**Request**:
```json
{
  "job": 1,
  "cover_letter": "I am interested in this position..."
}
```

### Update Application Status (PATCH)
**Endpoint**: `/api/applications/{id}/update_status/`
**Frontend**: Employer Dashboard
**Authentication**: Required (Employer)
**Request**:
```json
{
  "status": "INTERVIEW_SCHEDULED"
}
```
**Valid Statuses**: APPLIED, INTERVIEW_SCHEDULED, INTERVIEW_COMPLETED, OFFER_SENT, ACCEPTED, REJECTED

---

## Resumes API

### List Resumes (GET)
**Endpoint**: `/api/resumes/`
**Frontend**: `src/pages/ResumeManager.jsx`
**Authentication**: Required (Job Seeker)
**Response**:
```json
{
  "results": [
    {
      "id": 1,
      "file": "/media/resumes/user_2/resume_v2.pdf",
      "version": 2,
      "is_primary": true,
      "uploaded_at": "2026-03-10T10:30:00Z",
      "analysis": {
        "id": 1,
        "score": 82,
        "missing_skills": ["TypeScript"],
        "suggestions": {...},
        "role_compatibility": {...}
      }
    }
  ]
}
```

### Upload Resume (POST)
**Endpoint**: `/api/resumes/`
**Frontend**: `src/pages/ResumeManager.jsx` - Upload
**Authentication**: Required (Job Seeker)
**Request**: Multipart form data
```
- file: PDF or DOCX file (max 5MB)
```
**Response**: Resume object with analysis (if AI service is available)

### Set Primary Resume (PATCH)
**Endpoint**: `/api/resumes/{id}/set_primary/`
**Frontend**: `src/pages/ResumeManager.jsx`
**Authentication**: Required (Job Seeker)

### Re-analyze Resume (POST)
**Endpoint**: `/api/resumes/{id}/reanalyze/`
**Frontend**: `src/pages/ResumeManager.jsx` - "Re-analyze" button
**Authentication**: Required (Job Seeker)

---

## Interview API

### List Interview Rooms (GET)
**Endpoint**: `/api/interviews/rooms/`
**Frontend**: `src/pages/InterviewRoom.jsx`
**Authentication**: Required
**Response**: List of interview rooms with WebSocket URLs

### Create Interview Room (POST)
**Endpoint**: `/api/interviews/rooms/`
**Frontend**: Employer creates from application
**Authentication**: Required (Employer)
**Request**:
```json
{
  "application": 1,
  "scheduled_at": "2026-03-20T14:00:00Z",
  "duration_minutes": 60
}
```

---

## Resources API

### List Resource Categories (GET)
**Endpoint**: `/api/resources/categories/`
**Frontend**: `src/pages/Resources.jsx`
**Authentication**: Not required

### List Resources (GET)
**Endpoint**: `/api/resources/`
**Frontend**: `src/pages/Resources.jsx`
**Query Parameters**:
```
- category: ID
- resource_type: string
- is_accessible_for_blind: true|false
- is_accessible_for_deaf: true|false
- has_sign_language_video: true|false
- has_audio_description: true|false
- search: string
```
**Authentication**: Not required

---

## Accessibility API

### Voice Command (POST)
**Endpoint**: `/api/accessibility/voice-command/`
**Frontend**: `src/components/accessibility/VoiceNavigationButton.jsx`
**Authentication**: Required
**Request**:
```json
{
  "command": "Hello Bandhu search jobs"
}
```
**Response**:
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

### Sign Language Recognition (POST)
**Endpoint**: `/api/accessibility/sign-language/`
**Frontend**: Sign Language integration component
**Authentication**: Required
**Request**:
```json
{
  "landmarks": [[x, y, z], ...]  // 21 MediaPipe hand landmarks
}
```
**Response**:
```json
{
  "gesture": "hello",
  "text": "Hello",
  "confidence": 0.95
}
```

---

## Error Handling

All API errors follow this format:
```json
{
  "detail": "Error message",
  "error_code": "SPECIFIC_ERROR"
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad request
- **401**: Unauthorized (login required or token expired)
- **403**: Forbidden (insufficient permissions)
- **404**: Not found
- **500**: Server error

---

## CORS Configuration

Currently configured for development:
```python
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
```

For production, update in `skillable/settings.py` with your frontend domain.

---

## Authentication Flow

1. User logs in via `/api/auth/login/`
2. Receive `access_token` and `refresh_token`
3. Store both in localStorage
4. Include `Authorization: Bearer {access_token}` in all requests
5. If token expires (401), use `refresh_token` to get new access token
6. Auto-logout if refresh fails

---

## Testing the APIs

### Using cURL
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Browse Jobs
curl -X GET "http://localhost:8000/api/jobs/?search=react" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Frontend Console
```javascript
import api from './src/api/axios'

// Login
api.post('/api/auth/login/', {email: 'user@example.com', password: 'pass'})

// Browse Jobs
api.get('/api/jobs/?search=react')
```

---

## Environment Variables

**Backend** (`.env` file):
```
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=skillable
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
CORS_ORIGINS=http://localhost:3000
```

**Frontend** (already configured in `src/api/axios.js`):
```javascript
const api = axios.create({ baseURL: 'http://localhost:8000' })
```

---

## Notes
- All timestamps are in ISO 8601 format (UTC)
- Pagination uses `page` query parameter (default: 1)
- Page size is 20 items per default
- File uploads use multipart/form-data
- WebSocket URLs for interviews: `ws://localhost:8000/ws/interview/{room_id}/`
