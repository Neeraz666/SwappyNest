from django.urls import path
from .views import UploadProduct, ListAllProduct, ListCategoricalProduct, ProductSearchView, InterestDetailView, LikeProductView, ListLikedProducts

urlpatterns = [
    path('uploadproduct/', UploadProduct.as_view(), name='UploadProduct'),
    path('likeproduct/', LikeProductView.as_view(), name='LikeProductView'),
    path('listlikedproducts/', ListLikedProducts.as_view(), name='LikedProducts'),
    path('search/', ProductSearchView.as_view(), name='ProductSearchView'),
    path('listallproduct/', ListAllProduct.as_view(), name='ListAllProduct'),
    path('interest/', InterestDetailView.as_view(), name='interest-detail'), 
    path('<slug:slug>/', ListCategoricalProduct.as_view(), name='ListCategoricalProduct'),
]
