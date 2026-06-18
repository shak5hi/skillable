import random
from django.core.management.base import BaseCommand
from users.models import User, UserRole, EmployerProfile
from jobs.models import Job, JobType, ExperienceLevel

class Command(BaseCommand):
    help = 'Seeds dynamic, realistic jobs to make the portal MVP functional'

    def handle(self, *args, **kwargs):
        # Ensure at least one verified employer exists
        user, created = User.objects.get_or_create(
            email="inclusive@microsoft.com", 
            defaults={"full_name": "Microsoft Accessibility HR", "role": UserRole.EMPLOYER, "is_verified": True}
        )
        if created:
            user.set_password("password123")
            user.save()
            EmployerProfile.objects.create(
                user=user, 
                company_name="Microsoft", 
                company_description="Empowering every person and every organization on the planet to achieve more.",
                industry="Tech",
                location="Bengaluru"
            )
            self.stdout.write(self.style.SUCCESS("Created mock employer: inclusive@microsoft.com"))

        employer = user.employer_profile

        # Define some realistic jobs
        mock_jobs = [
            {
                "title": "Inclusive Frontend React Developer",
                "description": "We are looking for a frontend developer to build accessible React components. We strongly encourage PWD professionals to apply.",
                "requirements": "- 3+ years experience in React\n- Expertise in WAI-ARIA and semantic HTML",
                "job_type": JobType.FULL_TIME,
                "experience_level": ExperienceLevel.MID,
                "location": "Bengaluru / Remote",
                "required_skills": ["React", "JavaScript", "a11y", "Tailwind CSS"],
                "salary_min": 1800000,
                "salary_max": 2400000,
                "is_accessibility_friendly": True,
                "accessibility_features": ["Sign Language Interpreters", "High Contrast Workstation", "Screen Reader Compatible Software"]
            },
            {
                "title": "Backend Python Engineer",
                "description": "Join our core infrastructure team building scalable microservices in Python. We provide reasonable accommodations immediately.",
                "requirements": "- Proficiency in Python and Django/FastAPI\n- Understanding of distributed systems",
                "job_type": JobType.FULL_TIME,
                "experience_level": ExperienceLevel.SENIOR,
                "location": "Hyderabad / Hybrid",
                "required_skills": ["Python", "Django", "PostgreSQL", "FastAPI"],
                "salary_min": 2500000,
                "salary_max": 3500000,
                "is_accessibility_friendly": True,
                "accessibility_features": ["Flexible Work Hours", "Hearing Impaired Accommodations", "Neurodivergent Friendly Floor plan"]
            },
            {
                "title": "Accessibility QA Tester",
                "description": "Ensure our Azure platforms are AAA compliant across all dashboards. Perfect for screen-reader power users.",
                "requirements": "- Native experience with NVDA or JAWS\n- Certified Accessibility Professional",
                "job_type": JobType.CONTRACT,
                "experience_level": ExperienceLevel.ENTRY,
                "location": "Remote",
                "required_skills": ["Testing", "QA", "WCAG 2.1", "NVDA"],
                "salary_min": 800000,
                "salary_max": 1400000,
                "is_accessibility_friendly": True,
                "accessibility_features": ["Remote First", "Voice Control Systems Available"]
            }
        ]

        jobs_created = 0
        for j in mock_jobs:
            obj, c = Job.objects.get_or_create(title=j["title"], employer=employer, defaults=j)
            if c:
                jobs_created += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {jobs_created} highly dynamic jobs."))
