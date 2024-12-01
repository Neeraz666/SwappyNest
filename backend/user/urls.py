from django.urls import path
from .views import SignUpView, UserDetail, UserProductsView

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='SignUp'),
    path('profile/<int:id>/', UserDetail.as_view(), name='Profile'),
    path('<int:id>/products', UserProductsView.as_view(), name='user-products'),
]
