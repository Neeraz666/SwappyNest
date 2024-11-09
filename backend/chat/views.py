from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import Message, UserStatus
from django.contrib.auth.decorators import login_required
from django.utils import timezone

@login_required
def chat_room(request, room_name):
    """
    Renders the chat room interface for a specific room.
    """
    return render(request, 'chat/chat_room.html', {
        'room_name': room_name
    })

@login_required
def send_message(request):
    """
    Handles sending a message from a user.
    """
    if request.method == 'POST':
        user = request.user
        room_name = request.POST.get('room_name')
        content = request.POST.get('content', '')
        image = request.FILES.get('image', None)

        message = Message.objects.create(
            user=user,
            content=content,
            image=image,
            room_name=room_name
        )
        return JsonResponse({
            'status': 'success',
            'message': {
                'user': message.user.username,
                'content': message.content,
                'image': message.image.url if message.image else None,
                'timestamp': message.timestamp.isoformat(),
            }
        })

    return JsonResponse({'status': 'error'}, status=400)

@login_required
def get_messages(request, room_name):
    """
    Fetches the last 30 messages for the specified chat room.
    """
    messages = Message.objects.filter(room_name=room_name).order_by('-timestamp')[:30]
    messages_data = [{
        'user': message.user.username,
        'content': message.content,
        'image': message.image.url if message.image else None,
        'timestamp': message.timestamp.isoformat(),
    } for message in messages]
    
    return JsonResponse({'messages': messages_data})

@login_required
def update_user_status(request):
    """
    Updates the online/offline status of the user.
    """
    user_status, created = UserStatus.objects.get_or_create(user=request.user)
    user_status.is_online = True
    user_status.last_seen = timezone.now()
    user_status.save()
    
    return JsonResponse({'status': 'updated'})

@login_required
def user_logout(request):
    """
    Updates user status to offline upon logout.
    """
    user_status, _ = UserStatus.objects.get_or_create(user=request.user)
    user_status.is_online = False
    user_status.save()
    return redirect('login')  
