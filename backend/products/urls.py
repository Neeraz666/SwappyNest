from django.urls import path
from .views import UploadProduct, ListAllProduct, ListCategoricalProduct, ProductSearchView, InterestDetailView

urlpatterns = [
    path('uploadproduct/', UploadProduct.as_view(), name='UploadProduct'),
    path('search/', ProductSearchView.as_view(), name='ProductSearchView'),
    path('listallproduct/', ListAllProduct.as_view(), name='ListAllProduct'),
    path('interest/', InterestDetailView.as_view(), name='interest-detail'), 
    path('<slug:slug>/', ListCategoricalProduct.as_view(), name='ListCategoricalProduct'),
]
