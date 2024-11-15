from django.urls import path
from .views import UploadProduct, ListAllProduct, ListCategoricalProduct, ProductSearchView

urlpatterns = [
    path('uploadproduct/', UploadProduct.as_view(), name='UploadProduct'),
    path('listallproduct/', ListAllProduct.as_view(), name='ListAllProduct'),
    path('<slug:slug>/', ListCategoricalProduct.as_view(), name='ListCategoricalProduct'),
    path('search/', ProductSearchView.as_view(), name='ProductSearchView'),
]
