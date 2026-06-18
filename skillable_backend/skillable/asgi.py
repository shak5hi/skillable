import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "skillable.settings")
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
import interviews.routing
from skillable.token_auth import JWTAuthMiddleware

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        URLRouter(interviews.routing.websocket_urlpatterns)
    ),
})
