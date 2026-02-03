from rest_framework import serializers
from .models import (
    SiteSettings,
    ProductCarousel,
    ProductPromotion,
    Category,
    Product,
    ParametrePage,
    ProductFlash,
    FlashProductItem,
    Commentaire,
)


# Informations générales sur l'entreprise

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            # Informations générales
            'company_name',
            'statut_juridique',
            'rc_number',
            'nif',

            # Contacts
            'phone',
            'support_phone',
            'whatsapp',
            'email',
            'support_email',

            # Réseaux sociaux
            'facebook_page',
            'instagram',
            'twitter',
            'linkedin',
            'youtube',
            'tiktok',

            # Adresse et horaires
            'location',
            'opening_hours',

            # Contenu
            'about',

            # SEO
            'meta_title',
            'meta_description',
            'meta_keywords',

            # Branding
            'logo',
            'logo_light',
            'logo_dark',
            'favicon',

            # Documents légaux
            'cgv',
            'privacy_policy',
            'refund_policy',
            'shipping_policy',

            # Horodatage
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'company_name',  # On peut rendre en lecture seule si tu veux que ce soit modifiable seulement via l'admin
            'logo',  # idem pour le branding si tu veux restreindre
            'created_at',
            'updated_at',
        ]


# Fin Informations générales sur l'entreprise
# Fin Informations générales sur l'entreprise
# Fin Informations générales sur l'entreprise


# Produit du carousel
# Produit du carousel
# Produit du carousel

class ProductCarouselSerializer(serializers.ModelSerializer):
    # On expose des champs additionnels qui viennent du produit
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.IntegerField(source='product.price', read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = ProductCarousel
        fields = [
            'id',
            'product',
            'product_name',
            'product_price',
            'product_image',
            'comment_1',
            'comment_2',
            'is_active',
            'position',
            'created_at',
        ]
        read_only_fields = ['created_at']

    def get_product_image(self, obj):
        """Retourne l'image principale du produit, ou la première, ou l'image par défaut (image ou image_url)"""
        primary_image = obj.product.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.image.url

        first_image = obj.product.images.first()
        if first_image:
            return first_image.image.url

        # Utilise image_display_url qui gère image ET image_url
        return obj.product.image_display_url


# Produit promotionnel
# Produit promotionnel

class ProductPromotionSerializer(serializers.ModelSerializer):
    # Infos produit
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)

    # Prix d'origine en entier
    original_price = serializers.IntegerField(
        source='product.price',
        read_only=True
    )

    # Prix promo en entier
    promo_price = serializers.IntegerField(
        read_only=True
    )

    discount_percent = serializers.ReadOnlyField()
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = ProductPromotion
        fields = [
            'id',
            'product',
            'product_name',
            'product_slug',
            'original_price',
            'promo_price',
            'discount_percent',
            'label',
            'is_active',
            'is_featured',
            'start_date',
            'end_date',
            'product_image',
        ]

    def get_product_image(self, obj):
        """Image principale du produit (image ou image_url)"""
        primary = obj.product.images.filter(is_primary=True).first()
        if primary:
            return primary.image.url

        first = obj.product.images.first()
        if first:
            return first.image.url

        # Utilise image_display_url qui gère image ET image_url
        return obj.product.image_display_url

# Produit categorie
# Produit categorie

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image']


# Paramètres de page
# Paramètres de page


class ParametrePageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParametrePage
        fields = [
            'id',
            'new_products_category_limit',
            'new_products_per_category_limit',
            'commentaires_per_page',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


# Nouveaux produits (Catégories + Produits récents)


class NewProductItemSerializer(serializers.ModelSerializer):
    """
    Produit simplifié pour la section Nouveaux produits.
    """
    image = serializers.SerializerMethodField()
    category = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'price',
            'compare_at_price',
            'image',
            'image_url',
            'created_at',
            'category',
        ]

    def get_image(self, obj):
        return obj.image_display_url


class CategoryNewProductsSerializer(serializers.ModelSerializer):
    """
    Catégorie + produits récents limités.
    """
    products = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'products']

    def get_products(self, obj):
        limit = self.context.get('products_limit')
        products_qs = obj.products.filter(is_active=True).order_by('-created_at')
        if limit:
            products_qs = products_qs[:limit]
        return NewProductItemSerializer(products_qs, many=True).data






# Flash promotion produit principal
# Flash promotion produit principal

from rest_framework import serializers
from django.utils import timezone
from .models import FlashProductItem
from datetime import timedelta

class MainFlashProductSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    # Prix en entier
    product_price = serializers.IntegerField(source="product.price", read_only=True)
    
    # Prix de comparaison depuis FlashProductItem (priorité) ou depuis le produit
    compare_at_price = serializers.SerializerMethodField()
    
    product_image = serializers.SerializerMethodField()

    start_date = serializers.DateTimeField(read_only=True)
    end_date = serializers.DateTimeField(read_only=True)

    remaining_time = serializers.SerializerMethodField()  # <-- Nouveau champ formaté

    class Meta:
        model = FlashProductItem
        fields = [
            "product_name",
            "product_price",
            "compare_at_price",
            "product_image",
            "start_date",
            "end_date",
            "remaining_time",
        ]

    def get_compare_at_price(self, obj):
        """
        Retourne le prix de comparaison depuis FlashProductItem,
        sinon depuis le produit associé
        """
        if obj.compare_at_price:
            return obj.compare_at_price
        return obj.product.compare_at_price if obj.product.compare_at_price else None

    def get_product_image(self, obj):
        return obj.product.image_display_url

    def get_remaining_time(self, obj):
        """
        Retourne le temps restant dans le format JJ-HH-MM-SS
        """
        now = timezone.now()

        if not obj.end_date:
            return None

        # Calcul du delta
        delta = obj.end_date - now

        # Si temps écoulé → retourner 00-00-00-00
        if delta.total_seconds() <= 0:
            return "00-00-00-00"

        # Extraire jour/heure/min/sec
        days = delta.days
        hours, remainder = divmod(delta.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        # Retourner avec padding 2 digits
        return f"{days:02d}-{hours:02d}-{minutes:02d}-{seconds:02d}"


class SecondaryFlashProductSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="name", read_only=True)

    # Prix en entier
    product_price = serializers.IntegerField(source="price", read_only=True)

    product_image = serializers.SerializerMethodField()
    start_date = serializers.SerializerMethodField()
    end_date = serializers.SerializerMethodField()
    remaining_time = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "product_name",
            "product_price",
            "product_image",
            "start_date",
            "end_date",
            "remaining_time",
        ]

    def get_product_image(self, obj):
        """Retourne l'image du produit"""
        return obj.image_display_url

    def get_start_date(self, obj):
        """Retourne la date de début pour ce produit secondaire"""
        flash = ProductFlash.objects.filter(is_active=True, secondary_products=obj).first()
        return flash.secondary_start_date if flash else None

    def get_end_date(self, obj):
        """Retourne la date de fin pour ce produit secondaire"""
        flash = ProductFlash.objects.filter(is_active=True, secondary_products=obj).first()
        return flash.secondary_end_date if flash else None

    def get_remaining_time(self, obj):
        """Retourne le temps restant formaté (jour-heure-min-seconde)"""
        flash = ProductFlash.objects.filter(is_active=True, secondary_products=obj).first()

        if not flash or not flash.secondary_end_date:
            return None

        from django.utils import timezone
        now = timezone.now()

        delta = flash.secondary_end_date - now

        if delta.total_seconds() <= 0:
            return "00-00-00-00"  # Le compte à rebours est terminé

        days = delta.days
        hours, remainder = divmod(delta.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        return f"{days:02d}-{hours:02d}-{minutes:02d}-{seconds:02d}"


# Recherche de produits
# Recherche de produits

class ProductSearchSerializer(serializers.ModelSerializer):
    """
    Serializer pour les résultats de recherche de produits.
    """
    image = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    category_slug = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'price',
            'compare_at_price',
            'image',
            'image_url',
            'category',
            'category_slug',
            'description',
            'shot_description',
        ]

    def get_image(self, obj):
        return obj.image_display_url

    def get_category(self, obj):
        return obj.category.name if obj.category else None

    def get_category_slug(self, obj):
        return obj.category.slug if obj.category else None


# Détail de produit
# Détail de produit

class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Serializer pour les détails complets d'un produit.
    """
    image = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    category_slug = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'price',
            'compare_at_price',
            'image',
            'image_url',
            'images',
            'category',
            'category_slug',
            'description',
            'shot_description',
            'stock',
            'is_active',
            'created_at',
            'updated_at',
        ]

    def get_image(self, obj):
        """Retourne l'image principale du produit"""
        return obj.image_display_url

    def get_category(self, obj):
        """Retourne le nom de la catégorie"""
        return obj.category.name if obj.category else None

    def get_category_slug(self, obj):
        """Retourne le slug de la catégorie"""
        return obj.category.slug if obj.category else None

    def get_images(self, obj):
        """Retourne toutes les images du produit"""
        images = obj.images.all()
        return [
            {
                'id': img.id,
                'image': img.image.url if img.image else None,
                'is_primary': img.is_primary,
            }
            for img in images
        ]


# Commentaires
# Commentaires

class CommentaireSerializer(serializers.ModelSerializer):
    """
    Serializer pour les commentaires de produits.
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    stars_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Commentaire
        fields = [
            'id',
            'product',
            'product_name',
            'nom',
            'email',
            'commentaire',
            'note',
            'stars_display',
            'save_email',
            'is_approved',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['is_approved', 'created_at', 'updated_at']
    
    def get_stars_display(self, obj):
        """Retourne une représentation en étoiles de la note"""
        return '★' * obj.note + '☆' * (5 - obj.note)
    
    def validate_note(self, value):
        """Valide que la note est entre 1 et 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("La note doit être entre 1 et 5.")
        return value
    
    def validate_commentaire(self, value):
        """Valide la longueur du commentaire"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Le commentaire doit contenir au moins 10 caractères.")
        if len(value) > 1000:
            raise serializers.ValidationError("Le commentaire ne peut pas dépasser 1000 caractères.")
        return value.strip()


class CommentaireCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer un commentaire (sans is_approved visible).
    """
    class Meta:
        model = Commentaire
        fields = [
            'product',
            'nom',
            'email',
            'commentaire',
            'note',
            'save_email',
        ]
    
    def validate_note(self, value):
        """Valide que la note est entre 1 et 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("La note doit être entre 1 et 5.")
        return value
    
    def validate_commentaire(self, value):
        """Valide la longueur du commentaire"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Le commentaire doit contenir au moins 10 caractères.")
        if len(value) > 1000:
            raise serializers.ValidationError("Le commentaire ne peut pas dépasser 1000 caractères.")
        return value.strip()


class ProductCommentairesSummarySerializer(serializers.Serializer):
    """
    Serializer pour le résumé des commentaires d'un produit.
    """
    total_count = serializers.IntegerField()
    average_rating = serializers.FloatField()
    rating_distribution = serializers.DictField()
    commentaires = CommentaireSerializer(many=True)