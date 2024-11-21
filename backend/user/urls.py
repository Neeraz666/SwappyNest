from django.urls import path
from .views import SignUpView, UserDetail

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='SignUp'),
    path('profile/', UserDetail.as_view(), name='Profile'),
]
