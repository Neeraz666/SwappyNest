from django.urls import re_path
from .consumers import ChatConsumer, ChatListConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>[a-zA-Z0-9_\-]+)/$', ChatConsumer.as_asgi()),
    re_path(r'ws/chat/list/(?P<user_id>\d+)/$', ChatListConsumer.as_asgi()),
]

