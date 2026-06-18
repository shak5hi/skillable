# SkillAble Backend

Inclusive job platform for people with disabilities — Django + DRF backend.

---

## Project Structure

```
skillable/
├── skillable/           # Django project (settings, urls, asgi)
├── users/               # Custom User model, role-based signup, profiles
├── jobs/                # Job listings, search, filters, AI matching
├── applications/        # Apply, track status
├── interviews/          # WebSocket interview rooms (Django Channels)
├── resumes/             # Upload, versioning, AI analysis
├── accessibility/       # Voice navigation, sign language API
├── resources/           # Resource centre (guides, webinars, videos)
├── core/                # Shared permissions, utilities
├── ai_services/
│   ├── resume_service/       # FastAPI resume analysis microservice
│   └── sign_language_service/ # FastAPI sign language recognition
├── requirements.txt
├── docker-compose.yml
├── Dockerfile
├── manage.py
└── API_DOCS.md
```

---

## Quick Start (Docker — recommended)

```bash
git clone <repo>
cd skillable

# Copy and edit environment variables
cp .env.example .env

# Build and start all services
docker compose up --build

# In a separate terminal — run migrations and create admin
docker compose exec django python manage.py migrate
docker compose exec django python manage.py createsuperuser

# Load sample resource categories
docker compose exec django python manage.py shell -c "
from resources.models import ResourceCategory
cats = [
    ('Resume Building', 'resume-building'),
    ('Interview Preparation', 'interview-prep'),
    ('Workplace Rights', 'workplace-rights'),
    ('Skill Development', 'skill-development'),
    ('Career Development', 'career-development'),
    ('Job Search Strategy', 'job-search-strategy'),
]
for name, slug in cats:
    ResourceCategory.objects.get_or_create(name=name, slug=slug)
print('Done')
"
```

**Services running:**
| Service | URL |
|---------|-----|
| Django API | http://localhost:8000 |
| Admin panel | http://localhost:8000/admin |
| Resume AI | http://localhost:8001 |
| Sign Language AI | http://localhost:8003 |

---

## Quick Start (Local development)

### Prerequisites
- Python 3.12+
- PostgreSQL 14+
- Redis 7+

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
export SECRET_KEY="your-secret-key"
export DB_NAME="skillable"
export DB_USER="postgres"
export DB_PASSWORD="postgres"
export DB_HOST="localhost"
export REDIS_HOST="localhost"
export AI_RESUME_URL="http://localhost:8001"
export AI_SIGN_LANG_URL="http://localhost:8003"

# 4. Create database
createdb skillable

# 5. Run migrations
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Start Django (with Channels/ASGI)
daphne -b 0.0.0.0 -p 8000 skillable.asgi:application

# 8. In separate terminals — start AI microservices
cd ai_services/resume_service
uvicorn main:app --port 8001 --reload

cd ai_services/sign_language_service
uvicorn main:app --port 8003 --reload
```

---

## Key Design Decisions

### Security
- **Aadhaar hashing** — Raw Aadhaar is immediately hashed with SHA-256 via `profile.set_aadhaar()`. The raw value never touches the database.
- **JWT** — Access tokens expire in 1 hour; refresh tokens rotate every 7 days.
- **Role permissions** — Custom `IsJobSeeker`, `IsEmployer`, `IsAdmin`, `IsVerifiedJobSeeker` permission classes enforce role-based access at the view level.
- **File validation** — Resume uploads are validated for MIME type (PDF / DOCX only) and size (≤5MB) before storage.
- **Rate limiting** — 100 req/hr for anonymous users, 1000 req/hr for authenticated users (configurable).

### Accessibility
- **Voice navigation** — Activated with "Hello Bandhu". Commands are resolved to structured `action` payloads the React frontend can execute.
- **Sign language** — MediaPipe landmarks sent to FastAPI → PyTorch model → text. Works both in live interview rooms (WebSocket) and standalone (REST).
- **Resource flags** — Every resource carries `is_accessible_for_blind`, `is_accessible_for_deaf`, `has_sign_language_video`, `has_audio_description` so the frontend can filter appropriately.

### Scalability
- **WebSockets** — Django Channels with Redis channel layers. Each interview room is an isolated group. Access checked against the database on connect.
- **AI microservices** — Fully decoupled FastAPI services. Django calls them via `httpx`. Timeouts and fallbacks prevent cascade failures.
- **Celery-ready** — `_trigger_analysis()` in `ResumeViewSet` is designed to be trivially moved to a Celery task by wrapping the body in `@shared_task`.

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | (required) | Django secret key |
| `DEBUG` | `True` | Debug mode |
| `DB_NAME` | `skillable` | PostgreSQL database name |
| `DB_USER` | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | `postgres` | PostgreSQL password |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `REDIS_HOST` | `127.0.0.1` | Redis host for Channels |
| `AI_RESUME_URL` | `http://localhost:8001` | Resume analysis service |
| `AI_MATCHING_URL` | `http://localhost:8002` | Job matching service |
| `AI_SIGN_LANG_URL` | `http://localhost:8003` | Sign language service |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed frontend origins |
| `ALLOWED_HOSTS` | `*` | Django allowed hosts |

---

## Approving Employers (Admin)

Employers cannot post jobs until an admin verifies them.

```python
# Django admin or shell
from users.models import User
user = User.objects.get(email="priya@techcorp.com")
user.is_verified = True
user.save()
```

Or via the Django admin panel at `/admin/users/user/`.

---

## Running Tests

```bash
python manage.py test users jobs applications resumes accessibility resources
```

---

## API Documentation

Full request/response examples: see `API_DOCS.md`

Interactive Swagger UI (add `drf-spectacular` to requirements):
```bash
pip install drf-spectacular
# Add 'drf_spectacular' to INSTALLED_APPS and configure urls
# Then visit: http://localhost:8000/api/schema/swagger-ui/
```
