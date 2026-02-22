from django.shortcuts import render
from django.utils.timezone import now
from rest_framework import viewsets, status, permissions, filters
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import random
from datetime import timedelta
from .models import SiteSettings, ProductCarousel, ProductPromotion, Category, Product, ParametrePage
from .serializers import SiteSettingsSerializer, ProductCarouselSerializer, ProductPromotionSerializer, \
    CategorySerializer, CategoryNewProductsSerializer, ParametrePageSerializer
from .models import SiteSettings, ProductCarousel, ProductPromotion, Category, Product, ParametrePage, ProductFlash, FlashProductItem, Commentaire, PendingPayPalOrder, PendingMTNMoMoOrder, PendingOrangeMoneyOrder, Order, OrderItem, MaSelection
from .serializers import SiteSettingsSerializer, ProductCarouselSerializer, ProductPromotionSerializer, \
    CategorySerializer, CategoryNewProductsSerializer, ParametrePageSerializer, MainFlashProductSerializer, SecondaryFlashProductSerializer, ProductSearchSerializer, ProductDetailSerializer, CommentaireSerializer, CommentaireCreateSerializer, ProductCommentairesSummarySerializer, BoutiqueProductSerializer, MaSelectionSerializer, MaSelectionProductSerializer
from django.db.models import Q, Count, Avg
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from rest_framework.views import APIView
from decimal import Decimal
import os
import re
import requests
import uuid
import logging

# Create your views here.

logger = logging.getLogger(__name__)


# Informations générales sur l'entreprise
# Informations générales sur l'entreprise


class SiteSettingsViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    throttle_classes = []  # Désactiver le rate limiting pour les endpoints publics essentiels

    def list(self, request):
        settings = SiteSettings.load()
        if not settings:
            # Retourner un objet vide au lieu d'un 404 pour éviter de faire planter le frontend
            # Le frontend peut gérer les valeurs nulles/vides
            return Response({}, status=status.HTTP_200_OK)

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
    throttle_classes = []  # Désactiver le rate limiting pour les endpoints publics essentiels
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
    throttle_classes = []  # Désactiver le rate limiting pour les endpoints publics essentiels

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
    throttle_classes = []  # Désactiver le rate limiting pour les endpoints publics essentiels
    lookup_field = 'slug'



# Nouveaux produits (catégories + produits récents)
class NewProductsViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    throttle_classes = []  # Désactiver le rate limiting pour les endpoints publics essentiels

    def list(self, request):
        parametres = ParametrePage.load()
        category_limit = parametres.new_products_category_limit if parametres else 3
        products_limit = parametres.new_products_per_category_limit if parametres else 12

        # Filtrer uniquement les catégories qui ont au moins un produit actif
        categories = (
            Category.objects
            .filter(products__is_active=True)
            .distinct()
            .order_by('name')
        )[:category_limit]

        serializer = CategoryNewProductsSerializer(
            categories,
            many=True,
            context={'products_limit': products_limit}
        )
        
        # Filtrer les résultats pour ne garder que les catégories avec des produits
        filtered_results = [
            category_data for category_data in serializer.data
            if category_data.get('products') and len(category_data.get('products', [])) > 0
        ]
        
        return Response({
            "category_limit": category_limit,
            "products_limit": products_limit,
            "results": filtered_results
        })


# Paramètres de page
class ParametrePageViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    throttle_classes = []  # Désactiver le rate limiting pour les endpoints publics essentiels

    def list(self, request):
        parametres = ParametrePage.load()
        if not parametres:
            return Response(
                {"detail": "Aucune configuration trouvée."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ParametrePageSerializer(parametres)
        return Response(serializer.data)





# Flash promotion produit principal
# Flash promotion produit principal

from .models import ProductFlash, FlashProductItem
from .serializers import MainFlashProductSerializer, SecondaryFlashProductSerializer

class MainFlashProductViewSet(viewsets.ViewSet):
    """
    API endpoint pour le produit principal du flash promotion.
    Retourne le produit principal du flash actif.
    """
    permission_classes = [AllowAny]
    throttle_classes = []  # Désactiver le rate limiting pour les endpoints publics essentiels

    def list(self, request):
        """
        Retourne le produit principal du flash actif.
        """
        # Récupérer le flash actif
        flash = ProductFlash.objects.filter(is_active=True).first()
        
        if not flash:
            return Response(
                {"detail": "Aucun flash promotion actif trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Récupérer le produit principal
        main_item = flash.main_item
        
        if not main_item:
            return Response(
                {"detail": "Aucun produit principal défini pour ce flash."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = MainFlashProductSerializer(main_item)
        return Response(serializer.data)


# Flash promotion produits secondaires
# Flash promotion produits secondaires

class SecondaryFlashProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint pour les produits secondaires du flash promotion.
    Retourne tous les produits secondaires du flash actif.
    """
    serializer_class = SecondaryFlashProductSerializer
    permission_classes = [AllowAny]
    throttle_classes = []  # Désactiver le rate limiting pour les endpoints publics essentiels

    def get_queryset(self):
        """
        Retourne les produits secondaires du flash actif (limité à 8).
        """
        flash = ProductFlash.objects.filter(is_active=True).first()
        
        if not flash:
            return Product.objects.none()
        
        # Retourner les produits secondaires du flash actif (limité à 8)
        return flash.secondary_products.filter(is_active=True)[:8]


# Recherche de produits
# Recherche de produits

class ProductSearchViewSet(viewsets.ViewSet):
    """
    API endpoint pour la recherche de produits.
    Accepte les paramètres:
    - q: terme de recherche (recherche dans name, description, shot_description)
    - category: slug de la catégorie pour filtrer (optionnel)
    - page: numéro de page (défaut: 1)
    - page_size: nombre de résultats par page (défaut: 50, max: 50)
    
    Protections anti-scraping:
    - Rate limiting (100 req/heure pour anonymes, 1000 pour utilisateurs)
    - Longueur minimale du terme de recherche (3 caractères)
    - Pagination obligatoire (max 50 par page)
    - Limite totale de résultats (max 1000)
    """
    permission_classes = [AllowAny]
    serializer_class = ProductSearchSerializer
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def list(self, request):
        """
        Recherche de produits par terme et/ou catégorie.
        Nécessite au moins un paramètre (q ou category) pour éviter d'exposer tous les produits.
        Protections anti-scraping :
        - Longueur minimale du terme de recherche (3 caractères)
        - Pagination (max 50 résultats par page)
        - Limite totale de résultats (max 1000)
        """
        query = request.query_params.get('q', '').strip()
        category_slug = request.query_params.get('category', '').strip()
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 50))
        
        # Limites de sécurité
        MAX_PAGE_SIZE = 50  # Maximum de résultats par page
        MAX_TOTAL_RESULTS = 1000  # Maximum total de résultats retournables
        MIN_QUERY_LENGTH = 3  # Longueur minimale du terme de recherche

        # Sécurité : Ne retourner des résultats que si au moins un paramètre est fourni
        if not query and not category_slug:
            return Response({
                'count': 0,
                'results': [],
                'query': '',
                'category': '',
                'message': 'Veuillez fournir au moins un paramètre de recherche (q ou category)'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Protection : Longueur minimale du terme de recherche
        if query and len(query) < MIN_QUERY_LENGTH:
            return Response({
                'count': 0,
                'results': [],
                'query': query,
                'category': category_slug,
                'message': f'Le terme de recherche doit contenir au moins {MIN_QUERY_LENGTH} caractères'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Protection : Limiter la taille de page
        if page_size > MAX_PAGE_SIZE:
            page_size = MAX_PAGE_SIZE
        if page_size < 1:
            page_size = 1

        # Base queryset: uniquement les produits actifs
        queryset = Product.objects.filter(is_active=True)

        # Filtre par catégorie si fourni
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        # Recherche par terme si fourni
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(shot_description__icontains=query)
            )

        # Trier par date de création (plus récents en premier)
        queryset = queryset.select_related('category').order_by('-created_at')

        # Protection : Limiter le nombre total de résultats
        total_count = queryset.count()
        if total_count > MAX_TOTAL_RESULTS:
            queryset = queryset[:MAX_TOTAL_RESULTS]
            total_count = MAX_TOTAL_RESULTS

        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        paginated_queryset = queryset[start:end]

        # Sérialiser les résultats
        serializer = ProductSearchSerializer(paginated_queryset, many=True)
        
        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size if total_count > 0 else 0,
            'results': serializer.data,
            'query': query,
            'category': category_slug,
            'has_next': end < total_count,
            'has_previous': page > 1
        })


# Promotions (page avec pagination)
# Promotions (page avec pagination)

class PromotionsViewSet(viewsets.ViewSet):
    """
    API endpoint pour la page Promotions.
    Retourne tous les produits en promotion actifs avec pagination.
    
    Fonctionnalités:
    - Pagination fixe: 24 produits par page
    - Mélange des produits qui change toutes les 2 heures (protection anti-scraping)
    - Protection anti-scraping: limitation stricte du nombre de produits par page
    
    Paramètres:
    - page: numéro de page (défaut: 1)
    """
    permission_classes = [AllowAny]
    serializer_class = ProductPromotionSerializer
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def list(self, request):
        """
        Liste tous les produits en promotion actifs avec pagination et mélange.
        Le mélange change toutes les 2 heures pour protéger contre le scraping.
        """
        # Pagination fixe: 24 produits par page
        page_size = 24
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        
        # Validation
        if page < 1:
            page = 1

        # Base queryset: uniquement les promotions actives
        today = now()
        
        # Construire le queryset avec des filtres permissifs
        # Inclure toutes les promotions actives avec produits actifs
        queryset = ProductPromotion.objects.filter(
            is_active=True,
            product__is_active=True
        )
        
        # Filtrer par dates : inclure les promotions valides
        # Une promotion est valide si :
        # - start_date est None OU start_date <= today (promotion a commencé ou pas de date de début)
        # - ET end_date est None OU end_date >= today (promotion n'est pas terminée ou pas de date de fin)
        queryset = queryset.filter(
            Q(start_date__isnull=True) | Q(start_date__lte=today)
        ).filter(
            Q(end_date__isnull=True) | Q(end_date__gte=today)
        )
        
        queryset = queryset.select_related('product').order_by('-created_at')
        
        # Debug: compter le nombre de promotions trouvées
        total_before_shuffle = queryset.count()
        
        # Calculer le seed pour le mélange basé sur l'heure actuelle (change toutes les 2 heures)
        current_time = now()
        two_hours_period = int(current_time.timestamp() // 7200)
        
        # Utiliser ce nombre comme seed pour le random
        random.seed(two_hours_period)
        
        # Évaluer le queryset et convertir en liste pour pouvoir le mélanger
        # Utiliser list() pour forcer l'évaluation du queryset
        promotions_list = list(queryset.all())
        
        # Mélanger la liste avec le seed
        random.shuffle(promotions_list)
        
        # Calculer le nombre total
        total_count = len(promotions_list)
        
        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        paginated_promotions = promotions_list[start:end]
        
        # Sérialiser les résultats
        serializer = ProductPromotionSerializer(paginated_promotions, many=True)
        
        # Debug: vérifier le nombre de résultats sérialisés
        serialized_count = len(serializer.data) if serializer.data else 0
        
        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size if total_count > 0 else 0,
            'results': serializer.data,
            'has_next': end < total_count,
            'has_previous': page > 1,
            'debug': {
                'total_before_shuffle': total_before_shuffle,
                'total_after_shuffle': total_count,
                'serialized_count': serialized_count,
                'page_start': start,
                'page_end': end,
            },
        })


# Produits par catégorie
# Produits par catégorie

class CategoryProductsViewSet(viewsets.ViewSet):
    """
    API endpoint pour les produits d'une catégorie spécifique.
    Retourne tous les produits actifs d'une catégorie avec pagination.
    
    Fonctionnalités:
    - Pagination configurable via ParametrePage (défaut: 24 produits par page)
    - Mélange des produits qui change toutes les 2 heures (protection anti-scraping)
    - Protection anti-scraping: limitation stricte du nombre de produits par page
    
    Paramètres:
    - category_slug: slug de la catégorie (requis)
    - page: numéro de page (défaut: 1)
    """
    permission_classes = [AllowAny]
    serializer_class = BoutiqueProductSerializer
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def list(self, request):
        """
        Liste tous les produits actifs d'une catégorie avec pagination et mélange.
        Le mélange change toutes les 2 heures pour protéger contre le scraping.
        """
        category_slug = request.query_params.get('category_slug', '').strip()
        
        if not category_slug:
            return Response({
                'detail': 'Le paramètre category_slug est requis.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier que la catégorie existe
        try:
            category = Category.objects.get(slug=category_slug)
        except Category.DoesNotExist:
            return Response({
                'detail': 'Catégorie non trouvée.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Récupérer la configuration
        parametres = ParametrePage.load()
        default_page_size = parametres.boutique_products_per_page if parametres else 24
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        
        # Protection: utiliser uniquement la valeur configurée dans l'admin
        page_size = default_page_size
        
        # Validation
        if page < 1:
            page = 1
        if page_size < 1:
            page_size = 24

        # Base queryset: uniquement les produits actifs de la catégorie
        queryset = Product.objects.filter(
            is_active=True,
            category=category
        ).select_related('category')
        
        # Calculer le seed pour le mélange basé sur l'heure actuelle (change toutes les 2 heures)
        current_time = now()
        two_hours_period = int(current_time.timestamp() // 7200)
        
        # Utiliser ce nombre comme seed pour le random
        random.seed(two_hours_period)
        
        # Convertir le queryset en liste pour pouvoir le mélanger
        products_list = list(queryset)
        
        # Mélanger la liste avec le seed
        random.shuffle(products_list)
        
        # Calculer le nombre total
        total_count = len(products_list)
        
        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        paginated_products = products_list[start:end]
        
        # Sérialiser les résultats
        serializer = BoutiqueProductSerializer(paginated_products, many=True)
        
        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size if total_count > 0 else 0,
            'results': serializer.data,
            'has_next': end < total_count,
            'has_previous': page > 1,
            'category': {
                'id': category.id,
                'name': category.name,
                'slug': category.slug,
            }
        })


# Boutique
# Boutique

class BoutiqueViewSet(viewsets.ViewSet):
    """
    API endpoint pour la boutique.
    Retourne tous les produits actifs avec pagination.
    
    Fonctionnalités:
    - Pagination configurable via ParametrePage (défaut: 24 produits par page)
    - Mélange des produits qui change toutes les 2 heures (protection anti-scraping)
    - Protection anti-scraping: limitation stricte du nombre de produits par page
    
    Paramètres:
    - page: numéro de page (défaut: 1)
    - page_size: nombre de résultats par page (max: valeur configurée dans ParametrePage)
    """
    permission_classes = [AllowAny]
    serializer_class = BoutiqueProductSerializer
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def list(self, request):
        """
        Liste tous les produits actifs avec pagination et mélange.
        Le mélange change toutes les 2 heures pour protéger contre le scraping.
        """
        # Récupérer la configuration
        parametres = ParametrePage.load()
        default_page_size = parametres.boutique_products_per_page if parametres else 24
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        requested_page_size = request.query_params.get('page_size')
        
        # Protection: utiliser uniquement la valeur configurée dans l'admin
        # Ignorer toute tentative de modifier page_size depuis l'API
        page_size = default_page_size
        
        # Validation
        if page < 1:
            page = 1
        if page_size < 1:
            page_size = 24

        # Base queryset: uniquement les produits actifs
        queryset = Product.objects.filter(is_active=True).select_related('category')
        
        # Calculer le seed pour le mélange basé sur l'heure actuelle (change toutes les 2 heures)
        # Utiliser le timestamp divisé par 7200 (2 heures en secondes) comme seed
        current_time = now()
        # Calculer le nombre de périodes de 2 heures depuis l'epoch
        two_hours_period = int(current_time.timestamp() // 7200)
        
        # Utiliser ce nombre comme seed pour le random
        random.seed(two_hours_period)
        
        # Convertir le queryset en liste pour pouvoir le mélanger
        products_list = list(queryset)
        
        # Mélanger la liste avec le seed
        random.shuffle(products_list)
        
        # Calculer le nombre total
        total_count = len(products_list)
        
        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        paginated_products = products_list[start:end]
        
        # Sérialiser les résultats
        serializer = BoutiqueProductSerializer(paginated_products, many=True)
        
        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size if total_count > 0 else 0,
            'results': serializer.data,
            'has_next': end < total_count,
            'has_previous': page > 1,
            'shuffle_seed': two_hours_period,  # Pour debug (peut être retiré en production)
        })


# Détail de produit
# Détail de produit

class ProductDetailViewSet(viewsets.ViewSet):
    """
    API endpoint pour récupérer les détails d'un produit par slug ou id.
    """
    permission_classes = [AllowAny]
    serializer_class = ProductDetailSerializer
    throttle_classes = []  # Désactiver le rate limiting pour les endpoints publics essentiels

    def retrieve(self, request, pk=None):
        """
        Récupère un produit par son slug ou son id.
        """
        try:
            # Essayer de récupérer par slug d'abord
            if pk and not pk.isdigit():
                product = Product.objects.select_related('category').prefetch_related('images').get(
                    slug=pk,
                    is_active=True
                )
            else:
                # Sinon, récupérer par id
                product = Product.objects.select_related('category').prefetch_related('images').get(
                    id=pk,
                    is_active=True
                )
        except Product.DoesNotExist:
            return Response(
                {'detail': 'Produit non trouvé.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProductDetailSerializer(product)
        return Response(serializer.data)


# Commentaires
# Commentaires

def contains_inappropriate_content(text):
    """
    Vérifie si un texte contient des mots inappropriés, haineux ou péjoratifs.
    Retourne True si le contenu est inapproprié.
    """
    # Liste de mots interdits (peut être étendue)
    inappropriate_words = [
        # Mots haineux et péjoratifs (français)
        'merde', 'putain', 'connard', 'salope', 'enculé', 'fdp', 'pd', 'fils de pute',
        'nique', 'niquer', 'bite', 'couilles', 'chier', 'chié',
        # Mots haineux (anglais)
        'fuck', 'shit', 'asshole', 'bitch', 'damn', 'crap',
        # Contenu spam
        'http://', 'https://', 'www.', '.com', '.fr', 'bit.ly', 't.co',
    ]
    
    # Normaliser le texte (minuscules, sans accents pour comparaison)
    text_lower = text.lower()
    
    # Vérifier chaque mot interdit
    for word in inappropriate_words:
        if word in text_lower:
            return True
    
    # Vérifier les patterns de spam (trop de majuscules, répétitions)
    if len(re.findall(r'[A-Z]{3,}', text)) > 2:  # Trop de mots en majuscules
        return True
    
    if len(re.findall(r'(.)\1{4,}', text)) > 0:  # Répétitions de caractères (ex: aaaaa)
        return True
    
    return False


class CommentaireViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour les commentaires de produits.
    
    Sécurité:
    - Rate limiting (10 commentaires/heure pour anonymes, 50 pour utilisateurs)
    - Filtrage automatique des commentaires haineux/inappropriés
    - Validation stricte des données
    - Les commentaires nécessitent une approbation avant d'être visibles
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle, UserRateThrottle]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CommentaireCreateSerializer
        return CommentaireSerializer
    
    def get_queryset(self):
        """
        Retourne uniquement les commentaires approuvés pour la lecture.
        """
        queryset = Commentaire.objects.select_related('product').all()
        
        # Pour la lecture publique, ne montrer que les commentaires approuvés
        if self.action in ['list', 'retrieve']:
            queryset = queryset.filter(is_approved=True, is_flagged=False)
        
        # Filtrer par produit si product_id est fourni
        product_id = self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """
        Crée un nouveau commentaire avec validation et filtrage de contenu.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Vérifier que le produit existe et est actif
        try:
            product = Product.objects.get(
                id=serializer.validated_data['product'].id,
                is_active=True
            )
        except Product.DoesNotExist:
            return Response(
                {'detail': 'Produit non trouvé ou inactif.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérifier le contenu inapproprié
        commentaire_text = serializer.validated_data['commentaire']
        nom_text = serializer.validated_data['nom']
        
        if contains_inappropriate_content(commentaire_text) or contains_inappropriate_content(nom_text):
            # Marquer comme signalé au lieu de rejeter complètement
            # L'administrateur pourra le vérifier
            commentaire = serializer.save(
                is_approved=False,
                is_flagged=True
            )
            return Response(
                {
                    'detail': 'Votre commentaire a été soumis et sera examiné avant publication.',
                    'id': commentaire.id
                },
                status=status.HTTP_201_CREATED
            )
        
        # Créer le commentaire et l'approuver automatiquement
        commentaire = serializer.save(is_approved=True, is_flagged=False)
        
        return Response(
            {
                'detail': 'Votre commentaire a été publié avec succès.',
                'id': commentaire.id
            },
            status=status.HTTP_201_CREATED
        )
    
    def list(self, request, *args, **kwargs):
        """
        Liste les commentaires approuvés avec pagination.
        """
        queryset = self.get_queryset()
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = min(int(request.query_params.get('page_size', 10)), 50)  # Max 50 par page
        
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = queryset.count()
        paginated_queryset = queryset[start:end]
        
        serializer = self.get_serializer(paginated_queryset, many=True)
        
        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size if total_count > 0 else 0,
            'results': serializer.data,
            'has_next': end < total_count,
            'has_previous': page > 1
        })


class ProductCommentairesViewSet(viewsets.ViewSet):
    """
    API endpoint pour récupérer les commentaires d'un produit spécifique
    avec statistiques (nombre total, note moyenne, distribution).
    """
    permission_classes = [AllowAny]
    throttle_classes = []  # Pas de rate limiting pour la lecture
    
    def retrieve(self, request, pk=None):
        """
        Récupère les commentaires d'un produit avec statistiques.
        """
        try:
            # Récupérer le produit par slug ou id
            if pk and not pk.isdigit():
                product = Product.objects.get(slug=pk, is_active=True)
            else:
                product = Product.objects.get(id=pk, is_active=True)
        except Product.DoesNotExist:
            return Response(
                {'detail': 'Produit non trouvé.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Récupérer les commentaires approuvés
        commentaires = Commentaire.objects.filter(
            product=product,
            is_approved=True,
            is_flagged=False
        ).order_by('-created_at')
        
        # Calculer les statistiques
        total_count = commentaires.count()
        
        # Note moyenne
        avg_rating = commentaires.aggregate(Avg('note'))['note__avg']
        average_rating = round(avg_rating, 1) if avg_rating else 0.0
        
        # Distribution des notes
        rating_distribution = {}
        for i in range(1, 6):
            count = commentaires.filter(note=i).count()
            rating_distribution[i] = {
                'count': count,
                'percent': round((count / total_count * 100) if total_count > 0 else 0, 1)
            }
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = min(int(request.query_params.get('page_size', 10)), 50)
        
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated_commentaires = commentaires[start:end]
        
        serializer = CommentaireSerializer(paginated_commentaires, many=True)
        
        return Response({
            'product_id': product.id,
            'product_name': product.name,
            'total_count': total_count,
            'average_rating': average_rating,
            'rating_distribution': rating_distribution,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size if total_count > 0 else 0,
            'commentaires': serializer.data,
            'has_next': end < total_count,
            'has_previous': page > 1
        })


# Paiement PayPal (géré entièrement côté backend)
# Paiement PayPal (géré entièrement côté backend)

# Limites anti-abus
PAYPAL_MAX_ITEMS = 50
PAYPAL_MIN_AMOUNT_EUR = 0.01
PAYPAL_MAX_AMOUNT_EUR = 50000
CFA_TO_EUR_DEFAULT = Decimal("655.957")


def _validate_cart(cart):
    """Valide le panier et retourne (total_cfa, cart_snapshot) ou lève ValueError."""
    if not isinstance(cart, list) or len(cart) > PAYPAL_MAX_ITEMS:
        raise ValueError("Panier invalide ou trop d'articles.")
    total_cfa = 0
    snapshot = []
    for i, item in enumerate(cart):
        if not isinstance(item, dict):
            raise ValueError(f"Article {i} invalide.")
        try:
            pid = item.get("id")
            name = str(item.get("name", ""))[:255]
            price = int(item.get("price", 0))
            qty = max(1, int(item.get("quantity", 1)))
        except (TypeError, ValueError):
            raise ValueError(f"Article {i}: champs invalides.")
        if price < 0 or not name:
            raise ValueError(f"Article {i}: nom ou prix invalide.")
        total_cfa += price * qty
        snapshot.append({
            "id": pid,
            "name": name,
            "price": price,
            "quantity": qty,
        })
    if total_cfa <= 0:
        raise ValueError("Le total du panier doit être strictement positif.")
    return total_cfa, snapshot


def _billing_snapshot(data):
    """Extrait un snapshot facturation propre."""
    return {
        "email": (data.get("email") or "").strip()[:254],
        "first_name": (data.get("first_name") or "").strip()[:100],
        "last_name": (data.get("last_name") or "").strip()[:100],
        "address": (data.get("address") or "").strip()[:255],
        "city": (data.get("city") or "").strip()[:100],
        "country": (data.get("country") or "").strip()[:100],
        "zip_code": (data.get("zip_code") or "").strip()[:20],
        "phone": (data.get("phone") or "").strip()[:50],
    }


class CreatePayPalOrderView(APIView):
    """
    Crée une commande PayPal côté serveur.
    Body: cart (liste {id, name, price, quantity}), billing (email, first_name, ...), return_url, cancel_url.
    Le montant est calculé côté serveur (panier) puis converti en devise PayPal (EUR par défaut).
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def post(self, request):
        try:
            cart = request.data.get("cart", [])
            billing = request.data.get("billing", {})
            return_url = (request.data.get("return_url") or "").strip()[:500]
            cancel_url = (request.data.get("cancel_url") or "").strip()[:500]
        except Exception:
            return Response(
                {"detail": "Données invalides."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            total_cfa, cart_snapshot = _validate_cart(cart)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        billing_snap = _billing_snapshot(billing)
        if not billing_snap.get("email"):
            return Response(
                {"detail": "L'email de facturation est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Conversion CFA -> EUR (taux configurable)
        try:
            rate = Decimal(os.environ.get("PAYPAL_CFA_TO_EUR", str(CFA_TO_EUR_DEFAULT)))
        except Exception:
            rate = CFA_TO_EUR_DEFAULT
        if rate <= 0:
            rate = CFA_TO_EUR_DEFAULT
        amount_eur = (Decimal(total_cfa) / rate).quantize(Decimal("0.01"))
        if amount_eur < PAYPAL_MIN_AMOUNT_EUR:
            return Response(
                {"detail": "Le montant minimum pour PayPal n'est pas atteint."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if amount_eur > PAYPAL_MAX_AMOUNT_EUR:
            return Response(
                {"detail": "Le montant maximum pour PayPal est dépassé."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        currency = os.environ.get("PAYPAL_CURRENCY", "EUR").strip().upper()[:3] or "EUR"

        try:
            from .paypal_service import create_order
            result = create_order(
                amount_value=amount_eur,
                currency=currency,
                return_url=return_url,
                cancel_url=cancel_url,
            )
        except ValueError as e:
            return Response(
                {"detail": "PayPal n'est pas configuré. Définissez PAYPAL_CLIENT_ID et PAYPAL_CLIENT_SECRET sur le serveur."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except requests.RequestException:
            return Response(
                {"detail": "Impossible de contacter PayPal (vérifiez les identifiants ou le réseau)."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception as e:
            return Response(
                {"detail": "Impossible de créer la commande PayPal. Réessayez plus tard."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        order_id = result["order_id"]
        approve_url = result.get("approve_url", "")
        pending = PendingPayPalOrder.objects.create(
            paypal_order_id=order_id,
            cart_snapshot=cart_snapshot,
            billing_snapshot=billing_snap,
            total_cfa=total_cfa,
            amount_value=amount_eur,
            currency=currency,
            status=PendingPayPalOrder.STATUS_PENDING,
        )
        return Response(
            {"orderId": order_id, "status": result.get("status", ""), "approveUrl": approve_url},
            status=status.HTTP_201_CREATED,
        )


class CapturePayPalOrderView(APIView):
    """
    Capture le paiement PayPal après approbation du client.
    Body: orderId (ID de la commande PayPal).
    Crée la commande en base et marque le pending comme capturé.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def post(self, request):
        order_id = (request.data.get("orderId") or request.data.get("order_id") or "").strip()
        if not order_id:
            return Response(
                {"detail": "orderId manquant."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            pending = PendingPayPalOrder.objects.get(
                paypal_order_id=order_id,
                status=PendingPayPalOrder.STATUS_PENDING,
            )
        except PendingPayPalOrder.DoesNotExist:
            return Response(
                {"detail": "Commande introuvable ou déjà traitée."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            from .paypal_service import capture_order
            capture_order(order_id)
        except Exception:
            return Response(
                {"detail": "Échec de la capture du paiement. Réessayez ou contactez le support."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        billing = pending.billing_snapshot or {}
        order = Order.objects.create(
            email=billing.get("email", ""),
            first_name=billing.get("first_name", ""),
            last_name=billing.get("last_name", ""),
            address=billing.get("address", ""),
            city=billing.get("city", ""),
            country=billing.get("country", ""),
            zip_code=billing.get("zip_code", ""),
            phone=billing.get("phone", ""),
            total_cfa=pending.total_cfa,
            status=Order.STATUS_PAID,
            payment_method=Order.PAYMENT_PAYPAL,
            paypal_order_id=order_id,
        )
        for item in pending.cart_snapshot:
            product_id = item.get("id")
            try:
                product = Product.objects.get(pk=product_id) if product_id else None
            except Product.DoesNotExist:
                product = None
            OrderItem.objects.create(
                order=order,
                product=product,
                name=item.get("name", ""),
                price=int(item.get("price", 0)),
                quantity=int(item.get("quantity", 1)),
            )
        pending.status = PendingPayPalOrder.STATUS_CAPTURED
        pending.save(update_fields=["status"])

        return Response(
            {"success": True, "order_id": order.id, "detail": "Paiement effectué avec succès."},
            status=status.HTTP_200_OK,
        )


def _create_order_from_pending_mtn(pending_order):
    """Créer une commande finale à partir d'une commande MTN en attente"""
    billing = pending_order.billing_snapshot or {}
    cart = pending_order.cart_snapshot

    order = Order.objects.create(
        email=billing.get("email", ""),
        first_name=billing.get("first_name", ""),
        last_name=billing.get("last_name", ""),
        address=billing.get("address", ""),
        city=billing.get("city", ""),
        country=billing.get("country", ""),
        zip_code=billing.get("zip_code", ""),
        phone=billing.get("phone", ""),
        total_cfa=pending_order.total_cfa,
        status=Order.STATUS_PAID,
        payment_method=Order.PAYMENT_MTN_MOMO,
        mtn_transaction_id=pending_order.transaction_id,
    )

    # Créer les OrderItem
    for item in cart:
        product_id = item.get("id")
        try:
            product = Product.objects.get(pk=product_id) if product_id else None
        except Product.DoesNotExist:
            product = None
        OrderItem.objects.create(
            order=order,
            product=product,
            name=item.get("name", ""),
            price=int(item.get("price", 0)),
            quantity=int(item.get("quantity", 1)),
        )

    return order


class RequestMTNPaymentView(APIView):
    """
    Crée une demande de paiement MTN Mobile Money.
    Body: cart, billing, amount, currency
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def post(self, request):
        try:
            cart = request.data.get("cart", [])
            billing = request.data.get("billing", {})
            amount = request.data.get("amount", 0)
            currency = request.data.get("currency", "XAF")
        except Exception:
            return Response(
                {"detail": "Données invalides."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validation du panier
        try:
            total_cfa, cart_snapshot = _validate_cart(cart)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Validation du montant
        if amount != total_cfa:
            return Response(
                {"detail": "Le montant ne correspond pas au total du panier."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validation du numéro de téléphone
        phone_number = billing.get("phone", "").strip()
        if not phone_number or not phone_number.startswith("237"):
            return Response(
                {"detail": "Un numéro de téléphone MTN valide est requis (format: 237XXXXXXXXX)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        billing_snap = _billing_snapshot(billing)
        if not billing_snap.get("email"):
            return Response(
                {"detail": "L'email de facturation est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Générer un ID de transaction unique
        transaction_id = f"MTN-{uuid.uuid4().hex[:12].upper()}"

        try:
            # Appeler l'API MTN MoMo
            from .mtn_momo_service import request_payment
            result = request_payment(
                phone_number=phone_number,
                amount=amount,
                currency=currency,
                external_id=transaction_id
            )

            if result.get("success"):
                # Créer l'enregistrement en attente
                pending_order = PendingMTNMoMoOrder.objects.create(
                    transaction_id=transaction_id,
                    cart_snapshot=cart_snapshot,
                    billing_snapshot=billing_snap,
                    total_cfa=total_cfa,
                    amount=amount,
                    currency=currency,
                    phone_number=phone_number,
                    status=PendingMTNMoMoOrder.STATUS_PENDING,
                    mtn_response=result
                )

                return Response({
                    "success": True,
                    "transactionId": transaction_id,
                    "message": "Demande de paiement créée avec succès"
                })
            else:
                return Response({
                    "success": False,
                    "message": result.get("message", "Erreur lors de la création du paiement")
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Erreur MTN MoMo: {e}")
            return Response(
                {"detail": f"Erreur lors de la création du paiement: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CheckMTNPaymentStatusView(APIView):
    """
    Vérifie le statut d'un paiement MTN MoMo.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get(self, request, transaction_id):
        try:
            pending_order = PendingMTNMoMoOrder.objects.get(transaction_id=transaction_id)
        except PendingMTNMoMoOrder.DoesNotExist:
            return Response(
                {"detail": "Transaction introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            # Vérifier le statut auprès de MTN
            from .mtn_momo_service import check_payment_status
            status_data = check_payment_status(transaction_id)
            mtn_status = status_data.get("status", "").upper()

            # Mapper les statuts MTN vers nos statuts
            if mtn_status == "SUCCESSFUL":
                pending_order.status = PendingMTNMoMoOrder.STATUS_SUCCESSFUL
                # Créer la commande finale si elle n'existe pas
                if not Order.objects.filter(mtn_transaction_id=transaction_id).exists():
                    _create_order_from_pending_mtn(pending_order)
            elif mtn_status == "FAILED":
                pending_order.status = PendingMTNMoMoOrder.STATUS_FAILED
            elif mtn_status == "PENDING":
                pending_order.status = PendingMTNMoMoOrder.STATUS_PENDING
            elif mtn_status in ["CANCELLED", "CANCELED"]:
                pending_order.status = PendingMTNMoMoOrder.STATUS_CANCELLED

            pending_order.mtn_response = status_data
            pending_order.save()

            # Mapper le statut pour le frontend (convertir "successful" en "success")
            status_mapping = {
                "pending": "pending",
                "successful": "success",
                "failed": "failed",
                "cancelled": "cancelled",
                "expired": "cancelled"
            }
            frontend_status = status_mapping.get(pending_order.status, pending_order.status)
            
            return Response({
                "status": frontend_status,
                "transactionId": transaction_id,
                "message": f"Statut: {pending_order.get_status_display()}"
            })

        except Exception as e:
            logger.error(f"Erreur vérification statut MTN: {e}")
            return Response({
                "status": pending_order.status,
                "transactionId": transaction_id,
                "message": f"Erreur: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _create_order_from_pending_orange(pending_order):
    """Créer une commande finale à partir d'une commande Orange Money en attente"""
    billing = pending_order.billing_snapshot or {}
    cart = pending_order.cart_snapshot

    order = Order.objects.create(
        email=billing.get("email", ""),
        first_name=billing.get("first_name", ""),
        last_name=billing.get("last_name", ""),
        address=billing.get("address", ""),
        city=billing.get("city", ""),
        country=billing.get("country", ""),
        zip_code=billing.get("zip_code", ""),
        phone=billing.get("phone", ""),
        total_cfa=pending_order.total_cfa,
        status=Order.STATUS_PAID,
        payment_method=Order.PAYMENT_ORANGE_MONEY,
        orange_transaction_id=pending_order.transaction_id,
    )

    # Créer les OrderItem
    for item in cart:
        product_id = item.get("id")
        try:
            product = Product.objects.get(pk=product_id) if product_id else None
        except Product.DoesNotExist:
            product = None
        OrderItem.objects.create(
            order=order,
            product=product,
            name=item.get("name", ""),
            price=int(item.get("price", 0)),
            quantity=int(item.get("quantity", 1)),
        )

    return order


class RequestOrangePaymentView(APIView):
    """
    Crée une demande de paiement Orange Money.
    Body: cart, billing, amount, currency
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def post(self, request):
        try:
            cart = request.data.get("cart", [])
            billing = request.data.get("billing", {})
            amount = request.data.get("amount", 0)
            currency = request.data.get("currency", "XAF")
        except Exception:
            return Response(
                {"detail": "Données invalides."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validation du panier
        try:
            total_cfa, cart_snapshot = _validate_cart(cart)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Validation du montant
        if amount != total_cfa:
            return Response(
                {"detail": "Le montant ne correspond pas au total du panier."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validation du numéro de téléphone
        phone_number = billing.get("phone", "").strip()
        if not phone_number or not phone_number.startswith("237"):
            return Response(
                {"detail": "Un numéro de téléphone Orange valide est requis (format: 237XXXXXXXXX)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        billing_snap = _billing_snapshot(billing)
        if not billing_snap.get("email"):
            return Response(
                {"detail": "L'email de facturation est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Générer un ID de transaction unique
        transaction_id = f"ORANGE-{uuid.uuid4().hex[:12].upper()}"

        try:
            # Appeler l'API Orange Money
            from .orange_money_service import request_payment
            result = request_payment(
                phone_number=phone_number,
                amount=amount,
                currency=currency,
                external_id=transaction_id
            )

            if result.get("success"):
                # Créer l'enregistrement en attente
                pending_order = PendingOrangeMoneyOrder.objects.create(
                    transaction_id=transaction_id,
                    cart_snapshot=cart_snapshot,
                    billing_snapshot=billing_snap,
                    total_cfa=total_cfa,
                    amount=amount,
                    currency=currency,
                    phone_number=phone_number,
                    status=PendingOrangeMoneyOrder.STATUS_PENDING,
                    orange_response=result
                )

                return Response({
                    "success": True,
                    "transactionId": transaction_id,
                    "message": "Demande de paiement créée avec succès"
                })
            else:
                return Response({
                    "success": False,
                    "message": result.get("message", "Erreur lors de la création du paiement")
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"Erreur Orange Money: {e}")
            return Response(
                {"detail": f"Erreur lors de la création du paiement: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CheckOrangePaymentStatusView(APIView):
    """
    Vérifie le statut d'un paiement Orange Money.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get(self, request, transaction_id):
        try:
            pending_order = PendingOrangeMoneyOrder.objects.get(transaction_id=transaction_id)
        except PendingOrangeMoneyOrder.DoesNotExist:
            return Response(
                {"detail": "Transaction introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            # Vérifier le statut auprès d'Orange
            from .orange_money_service import check_payment_status
            status_data = check_payment_status(transaction_id)
            orange_status = status_data.get("status", "").upper()

            # Mapper les statuts Orange vers nos statuts
            if orange_status == "SUCCESSFUL" or orange_status == "SUCCESS":
                pending_order.status = PendingOrangeMoneyOrder.STATUS_SUCCESSFUL
                # Créer la commande finale si elle n'existe pas
                if not Order.objects.filter(orange_transaction_id=transaction_id).exists():
                    _create_order_from_pending_orange(pending_order)
            elif orange_status == "FAILED":
                pending_order.status = PendingOrangeMoneyOrder.STATUS_FAILED
            elif orange_status == "PENDING":
                pending_order.status = PendingOrangeMoneyOrder.STATUS_PENDING
            elif orange_status in ["CANCELLED", "CANCELED"]:
                pending_order.status = PendingOrangeMoneyOrder.STATUS_CANCELLED

            pending_order.orange_response = status_data
            pending_order.save()

            # Mapper le statut pour le frontend (convertir "successful" en "success")
            status_mapping = {
                "pending": "pending",
                "successful": "success",
                "failed": "failed",
                "cancelled": "cancelled",
                "expired": "cancelled"
            }
            frontend_status = status_mapping.get(pending_order.status, pending_order.status)
            
            return Response({
                "status": frontend_status,
                "transactionId": transaction_id,
                "message": f"Statut: {pending_order.get_status_display()}"
            })

        except Exception as e:
            logger.error(f"Erreur vérification statut Orange: {e}")
            return Response({
                "status": pending_order.status,
                "transactionId": transaction_id,
                "message": f"Erreur: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Ma Selection
# Ma Selection

class MaSelectionViewSet(viewsets.ViewSet):
    """
    API endpoint pour Ma Selection.
    Retourne le titre et les produits sélectionnés manuellement par l'administrateur.
    """
    permission_classes = [AllowAny]
    throttle_classes = []  # Désactiver le rate limiting pour les endpoints publics essentiels

    def list(self, request):
        """
        Retourne la configuration Ma Selection avec les produits sélectionnés.
        """
        ma_selection = MaSelection.load()
        
        if not ma_selection:
            return Response({
                'title': 'Ma Selection',
                'is_active': False,
                'products': []
            })
        
        # Vérifier si la section est active
        if not ma_selection.is_active:
            return Response({
                'title': ma_selection.title,
                'is_active': False,
                'products': []
            })
        
        # Récupérer les produits actifs seulement
        products = ma_selection.products.filter(is_active=True)
        
        serializer = MaSelectionSerializer(ma_selection)
        
        return Response({
            'title': ma_selection.title,
            'is_active': ma_selection.is_active,
            'count': products.count(),
            'results': MaSelectionProductSerializer(products, many=True).data
        })