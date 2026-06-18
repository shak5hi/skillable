from django.urls import path
from .views import VoiceCommandView, SignLanguageView
from users.views import AccessibilityPreferenceView

urlpatterns = [
    # POST — process a voice command and return a structured action
    path('voice-command/', VoiceCommandView.as_view(), name='voice-command'),

    # POST — run sign-language landmark prediction via AI microservice
    path('sign-language/', SignLanguageView.as_view(), name='sign-language'),

    # GET / PATCH — retrieve or update the user's saved accessibility preferences
    # Used by AccessibilitySettings.jsx on save
    path('preferences/', AccessibilityPreferenceView.as_view(), name='accessibility-preferences'),
]
