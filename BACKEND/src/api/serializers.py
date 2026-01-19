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
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
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
    original_price = serializers.DecimalField(
        source='product.price',
        max_digits=10,
        decimal_places=2,
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
    product_price = serializers.DecimalField(source="product.price", max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.SerializerMethodField()

    start_date = serializers.DateTimeField(read_only=True)
    end_date = serializers.DateTimeField(read_only=True)

    remaining_time = serializers.SerializerMethodField()  # <-- Nouveau champ formaté

    class Meta:
        model = FlashProductItem
        fields = [
            "product_name",
            "product_price",
            "product_image",
            "start_date",
            "end_date",
            "remaining_time",
        ]

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
    product_price = serializers.DecimalField(source="price", max_digits=10, decimal_places=2, read_only=True)
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
