from rest_framework import serializers
from .models import SiteSettings, ProductCarousel, ProductPromotion


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
        """Retourne l'image principale du produit, ou la première, ou l'image par défaut"""
        primary_image = obj.product.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.image.url

        first_image = obj.product.images.first()
        if first_image:
            return first_image.image.url

        if obj.product.image:
            return obj.product.image.url

        return None


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
        """Image principale du produit"""
        primary = obj.product.images.filter(is_primary=True).first()
        if primary:
            return primary.image.url

        first = obj.product.images.first()
        if first:
            return first.image.url

        if obj.product.image:
            return obj.product.image.url

        return None
