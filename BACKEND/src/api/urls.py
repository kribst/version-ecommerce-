from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteSettingsViewSet, ProductCarouselViewSet

router = DefaultRouter()
router.register(r'site-settings', SiteSettingsViewSet, basename='site-settings')
router.register(r'product-carousel', ProductCarouselViewSet, basename='product-carousel')



urlpatterns = [
    path('', include(router.urls)),
]
