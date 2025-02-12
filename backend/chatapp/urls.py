from django.urls import path
from .views import ConversationListView, ConversationMessagesView

urlpatterns = [
    path('conversations/', ConversationListView.as_view()), # List all conversations
    path('conversations/<int:conversation_id>/messages/', ConversationMessagesView.as_view(), name='conversation-messages'),
]
