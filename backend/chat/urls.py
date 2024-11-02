from django.urls import path
from . import views

urlpatterns = [
    path('<str:room_name>/', views.chat_room, name='chat_room'),
    path('send_message/', views.send_message, name='send_message'),
    path('get_messages/<str:room_name>/', views.get_messages, name='get_messages'),
    path('update_status/', views.update_user_status, name='update_user_status'),
]
