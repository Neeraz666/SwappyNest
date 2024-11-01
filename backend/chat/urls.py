from django.urls import path
from .views import ChatRoomList, MessageList

urlpatterns = [
    path('rooms/', ChatRoomList.as_view(), name='chat_room_list'),
    path('messages/', MessageList.as_view(), name='message_list'),
]