from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone

class ChatRoom(models.Model):
    """
    Store information about chat rooms.
    """
    name = models.CharField(max_length=255, unique=True)  # Ensure room names are unique
    created_at = models.DateTimeField(default=timezone.now) 

    def __str__(self):
        return self.name

class Message(models.Model):
    """
    Store chat messages: text content or an image attachment.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  
    content = models.TextField(blank=True, null=True)  
    image = models.ImageField(upload_to='chat_images/', blank=True, null=True) 
    room_name = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, default=1)  
    timestamp = models.DateTimeField(auto_now_add=True)  
    encrypted = models.BooleanField(default=False) 

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"Message from {self.user.username} in {self.room_name}"

class UserStatus(models.Model):
    """
    To track the online/offline status of users.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {'Online' if self.is_online else 'Offline'}"