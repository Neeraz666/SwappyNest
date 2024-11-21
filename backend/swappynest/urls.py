from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import LogoutView

urlpatterns = [
    path('api-auth/', include('rest_framework.urls')),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh_pair'),

    path('api/user/', include('user.urls')),

    path('api/products/', include('products.urls')),

    path('admin/', admin.site.urls),

    path('api/logout/', LogoutView.as_view(), name='Logout'),
    
]


from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)
