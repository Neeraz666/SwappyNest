from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    profilephoto = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'firstname', 'lastname', 'profilephoto', 'phone', 'address')
        extra_kwargs = {
            'username': {'read_only': True},
            'email': {'required': True},
        }

    