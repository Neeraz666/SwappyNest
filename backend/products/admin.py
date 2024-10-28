from django.contrib import admin
from .models import Product

# Register your models here.
class ProductAdmin(admin.ModelAdmin):
    list_display = ('')
    list_display_links = ('',)
    search_fields = ('')
    list_per_page = 50

admin.site.register(Product, ProductAdmin)