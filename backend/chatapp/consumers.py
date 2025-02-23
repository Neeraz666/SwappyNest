import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from .models import Conversation, Message
from django.db.models import Q

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = None  # Initialize to None
        
        # Check if the room_name is 'undefined' or doesn't contain participant IDs
        if self.room_name == 'undefined' or '_' not in self.room_name:
            await self.close()
            return

        try:
            participant_ids = list(map(int, self.room_name.split('_')[1:]))
            
            # Ensure we have exactly two participant IDs
            if len(participant_ids) != 2:
                await self.close()
                return

            self.sender_id, self.receiver_id = participant_ids

            # Get or create a conversation for these participants
            self.conversation = await self.get_or_create_conversation(self.sender_id, self.receiver_id)
            
            # Set up the WebSocket group name for this conversation
            self.room_group_name = f'chat_{self.conversation.id}'

            # Join the WebSocket group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
        except Exception as e:
            print(f"Error in connect: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        # Check if room_group_name was set before attempting to use it
        if hasattr(self, 'room_group_name') and self.room_group_name:
            try:
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
            except Exception as e:
                print(f"Error in disconnect: {str(e)}")

    async def receive(self, text_data):
        # Process incoming WebSocket message
        data = json.loads(text_data)
        sender_id = data['sender_id']
        receiver_id = data['receiver_id']
        message_content = data['message']

        # Validate that the participants are part of this conversation
        if not await self.are_participants_valid(sender_id, receiver_id):
            await self.close()
            return

        # Save the message to the database
        message = await self.save_message(self.conversation, sender_id, receiver_id, message_content)

        # Broadcast the message to the conversation group
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

        # Send updates to both participants' chat list channels
        conversation_data = await self.get_conversation_data(self.conversation.id)
        for participant_id in [sender_id, receiver_id]:
            await self.channel_layer.group_send(
                f'chat_list_{participant_id}',
                {
                    'type': 'update_chat_list',
                    'conversation': conversation_data
                }
            )

    async def chat_message(self, event):
        # Send chat message to WebSocket
        await self.send(text_data=json.dumps(event['message']))

    @sync_to_async
    def save_message(self, conversation, sender_id, receiver_id, message_content):
        # Save a new message to the database
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)

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

        conversation = Conversation.objects.filter(participants=sender).filter(participants=receiver).distinct()

        if conversation.exists():
            return conversation.first()
        else:
            conversation = Conversation.objects.create()
            conversation.participants.add(sender, receiver)
            return conversation

    @sync_to_async
    def are_participants_valid(self, sender_id, receiver_id):
        # Validate that both sender and receiver are part of this conversation
        participants = list(self.conversation.participants.all())
        participant_ids = {user.id for user in participants}
        return {sender_id, receiver_id}.issubset(participant_ids)

    @sync_to_async
    def get_conversation_data(self, conversation_id):
        conversation = Conversation.objects.get(id=conversation_id)
        participants = conversation.participants.all()
        last_message = conversation.messages.order_by('-timestamp').first()
        return {
            'id': conversation.id,
            'participants': [
                {
                    'id': participant.id,
                    'username': participant.username,
                    'profilephoto': participant.profilephoto.url if participant.profilephoto else None
                }
                for participant in participants
            ],
            'last_message': last_message.content if last_message else None,
            'timestamp': str(last_message.timestamp) if last_message else None
        }

class ChatListConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Set up WebSocket connection for chat list updates
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'chat_list_{self.user_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave the WebSocket group when disconnecting
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def update_chat_list(self, event):
        # Send chat list update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'update_conversation',
            'conversation': event['conversation']
        }))

