from django.urls import path
from .views import UploadProduct

urlpatterns = [
    path('uploadproduct/', UploadProduct.as_view(), name='UploadProduct')
]
