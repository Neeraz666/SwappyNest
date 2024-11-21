import uuid
from django.db import models
from user.models import UserAccount

# Create your models here.
class Product(models.Model):
    CONDITION_CHOICES = [
        ('new','New'),
        ('good','Good'),
        ('used','Used'),
    ]

    CATEGORY_CHOICES = [
        ('accessories', 'Accessories'),
        ('automotive', 'Automotive'),
        ('books', 'Books'),
        ('beauty', 'Beauty'),
        ('collectibles', 'Collectibles'),
        ('crafts', 'Crafts'),
        ('electronics', 'Electronics'),
        ('fitness', 'Fitness'),
        ('furniture', 'Furniture'),
        ('garden', 'Garden'),
        ('groceries', 'Groceries'),
        ('health', 'Health'),
        ('home_appliances', 'Home Appliances'),
        ('kitchenware', 'Kitchenware'),
        ('movies', 'Movies'),
        ('music', 'Music'),
        ('outdoor', 'Outdoor'),
        ('pet_supplies', 'Pet Supplies'),
        ('fashion', 'Fashion'),
        ('sports', 'Sports'),
        ('stationery', 'Stationery'),
        ('toys', 'Toys'),
        ('video_games', 'Video Games'),
        ('watches', 'Watches'),
        ('jewelry', 'Jewelry'),
    ]

    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    productname = models.CharField(max_length=100)
    # productpic = models.ImageField(upload_to='productpics')
    description = models.TextField(blank=True)
    purchaseyear = models.DateField()
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.productname 
    
class Image(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products')
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    def __str__(self):
        return f"{self.uuid}--{self.product.productname}"
    
