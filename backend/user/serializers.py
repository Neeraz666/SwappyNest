from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserReview

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

class UserReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserReview
        fields = '__all__'

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5")
        
        return value