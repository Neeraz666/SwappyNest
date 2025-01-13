from django.urls import path
from .views import SignUpView, UserDetail, UserProductsView, ReviewCreateAPIView, ListReviewForUserAPIView, ListReviewByUserAPIView

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='SignUp'),
    path('profile/<int:id>/', UserDetail.as_view(), name='Profile'),
    path('<int:id>/products', UserProductsView.as_view(), name='user-products'),
    path('createreview/', ReviewCreateAPIView.as_view(), name='createreview'),
    path('foruserreviewlist/<int:user_id>/', ListReviewForUserAPIView.as_view(), name='foruserreviewlist'),
    path('byuserreviewlist/<int:user_id>/', ListReviewByUserAPIView.as_view(), name='byuserreviewlist'),
]
