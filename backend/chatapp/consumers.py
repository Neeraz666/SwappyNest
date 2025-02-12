import json
import re
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from .models import Conversation, Message
from django.db.models import Q

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        # Get the room name from the URL (e.g., "conversation_6_7")
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        # Parse the room name to get the participant IDs (e.g., [6, 7])
        participant_ids = list(map(int, self.room_name.split('_')[1:]))
        participant_ids.sort()  # Sort the participant IDs to ensure uniqueness

        # Get the sender and receiver based on the participant IDs
        self.sender_id, self.receiver_id = participant_ids

        # Get or create the conversation
        conversation = await self.get_or_create_conversation(self.sender_id, self.receiver_id)
        print(conversation.id)

        # Set the room group name to the conversation ID
        self.room_group_name = f'chat_{conversation.id}'

        # Join the WebSocket room
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        sender_id = data['sender_id']
        receiver_id = data['receiver_id']
        message_content = data['message']

        # Save message in the database
        message = await self.save_message(sender_id, receiver_id, message_content)

        # Broadcast the message to the WebSocket group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': message.id,
                    'sender_id': sender_id,
                    'receiver_id': receiver_id,
                    'content': message_content,
                    'timestamp': str(message.timestamp)
                }
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    @sync_to_async
    def save_message(self, sender_id, receiver_id, message_content):
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)

        # Ensure conversation participants are sorted
        participants = sorted([sender, receiver], key=lambda user: user.id)

        # Try to get an existing conversation between sender and receiver (in any order)
        conversation = Conversation.objects.filter(
            participants__in=[sender, receiver]
        ).distinct()

        if conversation.count() == 0:
            # If no conversation exists, create a new one and add both users
            conversation = Conversation.objects.create()
            conversation.participants.add(*participants)
        else:
            # If a conversation exists, get the first one
            conversation = conversation.first()

        # Save the message
        message = Message.objects.create(
            conversation=conversation,
            sender=sender,
            receiver=receiver,
            content=message_content
        )

        return message

    @sync_to_async
    def get_or_create_conversation(self, sender_id, receiver_id):
        # Get or create conversation between sender and receiver (using sorted participant IDs)
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)

        # Sort participants to ensure consistent conversation IDs
        participants = sorted([sender, receiver], key=lambda user: user.id)

        # Try to get an existing conversation between sender and receiver (in any order)
        conversation = Conversation.objects.filter(
            participants__in=[sender and receiver]
        ).distinct()

        if conversation.exists():
            return conversation.first()
        else:
            conversation = Conversation.objects.create()
            conversation.participants.add(*participants)
            return conversation
