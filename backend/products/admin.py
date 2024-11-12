from django.contrib import admin
from .models import Product

# Register your models here.
class ProductAdmin(admin.ModelAdmin):
    list_display = ('productname', 'category', 'purchaseyear',)
    list_display_links = ('productname',)
    search_fields = ('productname', 'category', 'condition',)
    list_per_page = 50

admin.site.register(Product, ProductAdmin)