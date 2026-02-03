from django.shortcuts import render
from django.utils.timezone import now
from rest_framework import viewsets, status, permissions, filters
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import SiteSettings, ProductCarousel, ProductPromotion, Category, Product, ParametrePage
from .serializers import SiteSettingsSerializer, ProductCarouselSerializer, ProductPromotionSerializer, \
    CategorySerializer, CategoryNewProductsSerializer, ParametrePageSerializer
from .models import SiteSettings, ProductCarousel, ProductPromotion, Category, Product, ParametrePage, ProductFlash, FlashProductItem, Commentaire
from .serializers import SiteSettingsSerializer, ProductCarouselSerializer, ProductPromotionSerializer, \
    CategorySerializer, CategoryNewProductsSerializer, ParametrePageSerializer, MainFlashProductSerializer, SecondaryFlashProductSerializer, ProductSearchSerializer, ProductDetailSerializer, CommentaireSerializer, CommentaireCreateSerializer, ProductCommentairesSummarySerializer
from django.db.models import Q, Count, Avg
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
import re

# Create your views here.


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