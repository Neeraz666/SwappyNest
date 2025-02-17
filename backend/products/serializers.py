from rest_framework.serializers import ModelSerializer, DateField, DateTimeField
from .models import Product, Image, Interest
from user.serializers import UserSerializer

class ImageSerializer(ModelSerializer):
    class Meta:
        model = Image
        fields = ('image',)
        
        
class ProductSerializer(ModelSerializer):
    # Assuming you have an ImageSerializer to handle the images
    images = ImageSerializer(many=True)  
    user = UserSerializer(read_only=True)
    
    # Format the purchaseyear field to display only the year
    purchaseyear = DateField(format='%Y')
    
    # Format the created_at field to display only date and time (hour and minute)
    created_at = DateTimeField(format='%Y-%m-%d %H:%M')

    class Meta:
        model = Product
        fields = '__all__'
        
class InterestSerializer(ModelSerializer):
    class Meta:
        model = Interest
        fields = '__all__'