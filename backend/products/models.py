from django.db import models

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

    productname = models.CharField(max_length=100)
    productpic = models.ImageField(upload_to='productpics')
    description = models.TextField(blank=True)
    purchaseyear = models.DateTimeField()
    condtion = models.CharField(max_length=10, choices=CONDITION_CHOICES)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)