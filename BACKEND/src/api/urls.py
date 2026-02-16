from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SiteSettingsViewSet,
    ProductCarouselViewSet,
    ProductPromotionViewSet,
    FeaturedPromotionViewSet,
    CategoryViewSet,
    NewProductsViewSet,
    ParametrePageViewSet,
    MainFlashProductViewSet,
    SecondaryFlashProductViewSet,
    ProductSearchViewSet,
    ProductDetailViewSet,
    CommentaireViewSet,
    ProductCommentairesViewSet,
    BoutiqueViewSet,
    PromotionsViewSet,
    CategoryProductsViewSet,
    CreatePayPalOrderView,
    CapturePayPalOrderView,
)

router = DefaultRouter()
router.register(r'site-settings', SiteSettingsViewSet, basename='site-settings')
router.register(r'product-carousel', ProductCarouselViewSet, basename='product-carousel')
router.register(r'promotions', ProductPromotionViewSet, basename='promotion')
router.register(r'featured-promotions', FeaturedPromotionViewSet, basename='featured-promotion')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'new-products', NewProductsViewSet, basename='new-products')
router.register(r'parametre-page', ParametrePageViewSet, basename='parametre-page')
router.register(r'flash-main-product', MainFlashProductViewSet, basename='flash-main-product')
router.register(r'flash-secondary-products', SecondaryFlashProductViewSet, basename='flash-secondary-products')
router.register(r'search', ProductSearchViewSet, basename='product-search')
router.register(r'boutique', BoutiqueViewSet, basename='boutique')
router.register(r'promotions-page', PromotionsViewSet, basename='promotions-page')
router.register(r'category-products', CategoryProductsViewSet, basename='category-products')
router.register(r'products', ProductDetailViewSet, basename='product-detail')
router.register(r'commentaires', CommentaireViewSet, basename='commentaire')
router.register(r'product-commentaires', ProductCommentairesViewSet, basename='product-commentaires')

urlpatterns = [
    path("", include(router.urls)),
    path("paypal/create-order/", CreatePayPalOrderView.as_view(), name="paypal-create-order"),
    path("paypal/capture-order/", CapturePayPalOrderView.as_view(), name="paypal-capture-order"),
]
