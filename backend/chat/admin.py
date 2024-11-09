from django.contrib import admin
from .models import ChatRoom, Message, UserStatus

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    ordering = ('created_at',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'room_name', 'timestamp', 'encrypted')
    list_filter = ('room_name', 'encrypted')
    search_fields = ('content',)
    ordering = ('timestamp',)
    date_hierarchy = 'timestamp'

@admin.register(UserStatus)
class UserStatusAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_online', 'last_seen')
    search_fields = ('user__username',)
    ordering = ('last_seen',)
