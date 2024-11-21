from django.urls import path
from .views import UploadProduct, ListAllProduct, ListCategoricalProduct, ProductSearchView, UserProduct

urlpatterns = [
    path('uploadproduct/', UploadProduct.as_view(), name='UploadProduct'),
    path('listallproduct/', ListAllProduct.as_view(), name='ListAllProduct'),
    path('search/', ProductSearchView.as_view(), name='ProductSearchView'),
    path('user-product/', UserProduct.as_view(), name='UserProduct'),
    path('<slug:slug>/', ListCategoricalProduct.as_view(),
         name='ListCategoricalProduct'),
    
    
]
