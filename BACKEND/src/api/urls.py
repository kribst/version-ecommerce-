from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteSettingsViewSet, ProductCarouselViewSet, ProductPromotionViewSet, FeaturedPromotionViewSet

router = DefaultRouter()
router.register(r'site-settings', SiteSettingsViewSet, basename='site-settings')
router.register(r'product-carousel', ProductCarouselViewSet, basename='product-carousel')
router.register(r'promotions', ProductPromotionViewSet, basename='promotion')
router.register(r'featured-promotions', FeaturedPromotionViewSet, basename='featured-promotion')




urlpatterns = [
    path('', include(router.urls)),
]
