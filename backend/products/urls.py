from django.urls import path
from .views import UploadProduct, ListAllProduct

urlpatterns = [
    path('uploadproduct/', UploadProduct.as_view(), name='UploadProduct'),
    path('listallproduct/', ListAllProduct.as_view(), name='ListAllProduct'),
]
