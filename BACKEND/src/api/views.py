from django.shortcuts import render
from django.utils.timezone import now
from rest_framework import viewsets, status, permissions, filters
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import SiteSettings, ProductCarousel, ProductPromotion, Category
from .serializers import SiteSettingsSerializer, ProductCarouselSerializer, ProductPromotionSerializer, \
    CategorySerializer


# Create your views here.


# Informations générales sur l'entreprise
# Informations générales sur l'entreprise


class SiteSettingsViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        settings = SiteSettings.load()
        if not settings:
            return Response(
                {"detail": "Aucune configuration trouvée."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SiteSettingsSerializer(settings)
        return Response(serializer.data)


# Fin Informations générales sur l'entreprise
# Fin Informations générales sur l'entreprise
# Fin Informations générales sur l'entreprise


# Produit du carousel
# Produit du carousel
# Produit du carousel


class ProductCarouselViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint lecture seule pour les produits du carousel.
    """
    queryset = ProductCarousel.objects.all().order_by('position')
    serializer_class = ProductCarouselSerializer
    permission_classes = [permissions.AllowAny]  # lecture ouverte à tous
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['position', 'created_at']
    search_fields = ['product__name', 'comment_1', 'comment_2']

    def get_queryset(self):
        """
        Filtrer sur les produits actifs si query param 'active' est fourni
        ?active=true
        """
        queryset = super().get_queryset()
        active = self.request.query_params.get('active')
        if active is not None:
            if active.lower() in ['true', '1']:
                queryset = queryset.filter(is_active=True)
            elif active.lower() in ['false', '0']:
                queryset = queryset.filter(is_active=False)
        return queryset


# Fin Produit du carousel
# Fin Produit du carousel
# Fin Produit du carousel


# Produit du promotion
# Produit du promotion
# Produit du promotion


class FeaturedPromotionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Promotions mises en avant pour le hero (is_featured = True)
    """
    serializer_class = ProductPromotionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        today = now()
        limit = self.request.query_params.get("limit")

        qs = ProductPromotion.objects.filter(
            is_active=True,
            is_featured=True,
            start_date__lte=today,
            end_date__gte=today,
        ).select_related("product").order_by("-created_at")

        # Limite par défaut à 10, ou valeur passée en query param (?limit=5)
        try:
            if limit is not None:
                limit = int(limit)
            else:
                limit = 10
        except ValueError:
            limit = 10

        return qs[:limit]


class ProductPromotionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API lecture seule des produits en promotion
    """
    serializer_class = ProductPromotionSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]

    ordering_fields = ['created_at', 'promo_price']
    search_fields = ['product__name', 'label']

    def get_queryset(self):
        """
        Promotions actives + dates valides
        """
        today = now()

        return ProductPromotion.objects.filter(
            is_active=True
        ).filter(
            start_date__lte=today
        ).filter(
            end_date__gte=today
        ).select_related('product').order_by('-created_at')



# Produit categorie
# Produit categorie


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
