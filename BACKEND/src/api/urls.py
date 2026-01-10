from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteSettingsViewSet


router = DefaultRouter()
router.register(r'site-settings', SiteSettingsViewSet, basename='site-settings')



urlpatterns = [
    path('', include(router.urls)),
]
