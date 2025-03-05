from django.contrib import admin
from .models import Product, Image, Interest, LikedProduct


class ImageAdmin(admin.TabularInline):
    model = Image
    extra = 1
    can_delete = True


class ProductAdmin(admin.ModelAdmin):
    list_display = ('productname', 'category', 'purchaseyear',)
    list_display_links = ('productname',)
    search_fields = ('productname', 'category', 'condition',)
    list_per_page = 50
    inlines = [ImageAdmin]

class InterestAdmin(admin.ModelAdmin):
    list_display = ('user', 'interested_products')
    list_display_links = ('user',)
    search_fields = ('user',)
    list_per_page = 50

class LikedProductsAdmin(admin.ModelAdmin):
    list_display = ('user', 'liked_products')
    list_display_links = ('user', 'liked_products')
    search_fields = ('user',)
    list_per_page = 50

admin.site.register(Product, ProductAdmin)
admin.site.register(Interest, InterestAdmin)
admin.site.register(LikedProduct, LikedProductsAdmin)
