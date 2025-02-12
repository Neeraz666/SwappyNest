import json
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

        # Get or create the conversation and store it
        self.conversation = await self.get_or_create_conversation(self.sender_id, self.receiver_id)

        # Set the room group name to the conversation ID
        self.room_group_name = f'chat_{self.conversation.id}'

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

        # Verify sender and receiver are part of the conversation
        if not await self.are_participants_valid(sender_id, receiver_id):
            await self.close()
            return

        # Save message in the database using the stored conversation
        message = await self.save_message(self.conversation, sender_id, receiver_id, message_content)

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
    def save_message(self, conversation, sender_id, receiver_id, message_content):
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)

        # Save the message directly to the provided conversation
        message = Message.objects.create(
            conversation=conversation,
            sender=sender,
            receiver=receiver,
            content=message_content
        )
        return message

    @sync_to_async
    def get_or_create_conversation(self, sender_id, receiver_id):
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)

        # Query for conversations that include both participants
        conversation = Conversation.objects.filter(participants=sender).filter(participants=receiver).distinct()

        if conversation.exists():
            return conversation.first()
        else:
            # Create new conversation and add both participants
            conversation = Conversation.objects.create()
            conversation.participants.add(sender, receiver)
            return conversation

    @sync_to_async
    def are_participants_valid(self, sender_id, receiver_id):
        # Check if both sender and receiver are in the conversation's participants
        participants = list(self.conversation.participants.all())
        participant_ids = {user.id for user in participants}
        return {sender_id, receiver_id}.issubset(participant_ids)