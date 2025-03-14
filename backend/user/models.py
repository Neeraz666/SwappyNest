from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.conf import settings

# Create your models here.
class UserAccountManager(BaseUserManager):
    
    def create_user(self, email, username, password=None, **extra_fields):
        
        if not email:
            raise ValueError('Email address needed.')

        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)

        user.set_password(password)
        user.save()

        return user
    
    def create_superuser(self, email, username, password):
        user = self.create_user(email, username, password)

        user.is_superuser = True
        user.is_staff = True

        user.save()

        return user
    

class UserAccount(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(max_length=255)
    firstname = models.CharField(max_length=255)
    lastname = models.CharField(max_length=55)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    profilephoto = models.ImageField(blank=True, null=True)
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_expiration = models.DateTimeField(blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def get_full_name(self):
        return str(self.firstname) + str(self.lastname)
    
    def get_short_name(self):
        return self.username
    
    def __str__(self):
        return self.email
    





class UserReview(models.Model):

    reviewed_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name = 'received_reviews'
    )

    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.SET_NULL,
        null = True,
        blank = True,
        related_name= 'written_reviews'
    )

    rating = models.PositiveIntegerField()
    content = models.TextField(blank = True)
    created_at = models.DateTimeField(auto_now_add = True)
    updated_at = models.DateTimeField(auto_now = True)

    def __str__(self):
        return f'Review for {self.reviewed_user} by P{self.reviewer}'
    