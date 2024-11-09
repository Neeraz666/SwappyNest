import json
import base64
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Message
from asgiref.sync import sync_to_async
from django.contrib.auth.models import User
from cryptography.fernet import Fernet
from django.conf import settings

# Encryption key - store this securely!
ENCRYPTION_KEY = settings.ENCRYPTION_KEY
cipher_suite = Fernet(ENCRYPTION_KEY)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Join the room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Track user as online
        await self.update_user_status(online=True)

        # Load last 30 messages
        last_30_messages = await self.get_last_30_messages()
        for message in last_30_messages:
            decrypted_content = self.decrypt_message(message.content) if message.encrypted else message.content
            await self.send(text_data=json.dumps({
                'message': decrypted_content,
                'user': message.user.username,
                'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'image': message.image.url if message.image else None
            }))

    async def disconnect(self, close_code):
        # Leave the room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        # Update user status to offline
        await self.update_user_status(online=False)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        username = data['username']
        image_data = data.get('image')  # Image data in base64

        if message or image_data:
            encrypted_message = self.encrypt_message(message) if message else None
            image = await self.save_image(image_data) if image_data else None

            # Save message to the database
            await self.save_message(username, encrypted_message, image)

            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'chat_message',
                'message': encrypted_message,
                'username': username,
                'image': image.url if image else None,
            })

    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        image_url = event.get('image')

        # Decrypt message before sending
        decrypted_message = self.decrypt_message(message) if message else None

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': decrypted_message,
            'username': username,
            'image': image_url,
        }))

    async def typing_indicator(self, event):
        typing = event['typing']
        username = event['username']

        await self.send(text_data=json.dumps({
            'typing': typing,
            'username': username,
        }))

    async def online_status(self, event):
        status = event['online']
        username = event['username']

        await self.send(text_data=json.dumps({
            'online': status,
            'username': username,
        }))

    @sync_to_async
    def get_last_30_messages(self, offset=0):
        return Message.objects.filter(room_name=self.room_name).order_by('-timestamp')[offset:offset + 30]

    @sync_to_async
    def save_message(self, username, content, image=None):
        user = User.objects.get(username=username)
        Message.objects.create(user=user, content=content, room_name=self.room_name, image=image, encrypted=True)

    @sync_to_async
    def save_image(self, image_data):
        # Save image data from base64
        from django.core.files.base import ContentFile
        format, imgstr = image_data.split(';base64,')  # Parse the base64 image data
        ext = format.split('/')[-1]
        image = ContentFile(base64.b64decode(imgstr), name=f'chat_image.{ext}')
        return image

    @sync_to_async
    def update_user_status(self, online):
        # Store user online/offline status in a cache (Redis or database)
        pass

    def encrypt_message(self, message):
        return cipher_suite.encrypt(message.encode()).decode()

    def decrypt_message(self, encrypted_message):
        return cipher_suite.decrypt(encrypted_message.encode()).decode()
