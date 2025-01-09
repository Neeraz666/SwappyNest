from django.contrib import admin
from .models import UserAccount, UserReview

# Register your models here.
class UserAccountAdmin(admin.ModelAdmin):
    list_display = ('email','firstname', 'lastname')
    list_display_links = ('email',)
    search_fields = ('email', 'username', 'firstname', 'lastname')
    list_per_page = 50
    readonly_fields = ('password', )

admin.site.register(UserAccount, UserAccountAdmin)

class UserReviewAdmin(admin.ModelAdmin):
    list_display = ('reviewed_user', 'reviewer', 'rating')
    list_display_links = ('rating',)
    list_per_page = 50

admin.site.register(UserReview, UserReviewAdmin)