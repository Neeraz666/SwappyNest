from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import Conversation
from django.contrib.auth import get_user_model

class ConversationListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)  # Only authenticated users can access this view

    def get(self, request):
        # Get all conversations that the user is part of
        conversations = Conversation.objects.filter(participants=request.user)
        data = []

        for conversation in conversations:
            # Gather participant data
            participants = [
                {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
                for user in conversation.participants.all()
            ]

            # Generate the conversation name: "conversation_user1_user2"
            participant_usernames = sorted([user.email for user in conversation.participants.all()])
            conversation_name = f"conversation_{'_'.join(participant_usernames)}"

            # Add the conversation details to the response data
            data.append({
                'id': conversation.id,
                'participants': participants,
                'name': conversation_name,
                'created_at': conversation.created_at
            })

        return Response(data)
