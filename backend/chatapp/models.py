from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings

class Conversation(models.Model):
    # A conversation involves two users
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        # Sanitize the conversation name: replace spaces and special characters with underscores
        participant_emails = [user.email for user in self.participants.all()]
        return "conversation_" + "_".join(sorted(participant_emails))

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'Message from {self.sender} to {self.receiver} at {self.timestamp}'