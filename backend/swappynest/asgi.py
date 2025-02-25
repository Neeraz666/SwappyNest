import os, django
from django.core.asgi import get_asgi_application # For default ASGI application for Django
from channels.routing import ProtocolTypeRouter, URLRouter # ProtocolTypeRouter allows routing based on the protocols such as 'http', 'websocket' etc. And URLRouter is used for route based url patterns (specifically for WebSocket routing)
from channels.auth import AuthMiddlewareStack # Middleware  for handling authentication in WebSockets
from chatapp.routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'swappynest.settings')
django.setup() 

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    )
})