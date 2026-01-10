from rest_framework import serializers
from .models import SiteSettings


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
            'logo',          # idem pour le branding si tu veux restreindre
            'created_at',
            'updated_at',
        ]


# Fin Informations générales sur l'entreprise
# Fin Informations générales sur l'entreprise
# Fin Informations générales sur l'entreprise