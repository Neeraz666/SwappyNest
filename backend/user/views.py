from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .serializers import UserSerializer
from rest_framework.generics import RetrieveAPIView


User = get_user_model()

# Create your views here.
class SignUpView(APIView):
    permission_classes = (permissions.AllowAny, )

    def post(self, request, format=None):
        data = self.request.data

        email = data['email']
        username = data['username']
        firstname = data['firstname']
        lastname = data['lastname']
        password = data['password']
        password1 = data['password1']
        profilephoto = data['profilephoto']
        phone = data['phone']
        address = data['address']

        if password == password1:
            try:
                validate_password(password)

            except ValidationError as e:
                return Response({'Error': e.messages})
            
            if User.objects.filter(email=email).exists():
                return Response({'error': 'Email already exists! Try another one.'})
            
            else:
                user = User.objects.create_user(email=email, username=username, firstname=firstname, lastname=lastname, password=password, profilephoto=profilephoto, phone=phone, address=address)

                user.save()

                return Response({'Success': 'User created successfully.'})
            
        else:
            return Response({'error': 'Passwords donot match! Try again.'})


class UserDetail(RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
    
