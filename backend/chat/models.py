from django.db import models
from django.conf import settings  # Import settings here
from django.contrib.auth.models import User

class ChatRoom(models.Model):
    name = models.CharField(max_length=255)

class Message(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
