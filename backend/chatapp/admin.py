from django.contrib import admin
from .models import Conversation, Message

# Register your models here.

class MessageInLine(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ('sender', 'receiver', 'timestamp')

class ConversationAdmin(admin.ModelAdmin):
    inlines = [MessageInLine]
    list_display = ('__str__', 'created_at')
    search_fields = ('participants_username',)

admin.site.register(Conversation, ConversationAdmin)
admin.site.register(Message)