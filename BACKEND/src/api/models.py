from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _


# Informations générales sur l'entreprise


class SiteSettings(models.Model):
    # Informations générales
    company_name = models.CharField(_("Nom de l'entreprise"), max_length=255)
    statut_juridique = models.CharField(_("Statut juridique"), max_length=255, blank=True, null=True)
    rc_number = models.CharField(_("Numéro RC"), max_length=255, blank=True, null=True)
    nif = models.CharField(_("NIF"), max_length=255, blank=True, null=True)

    # Contacts
    phone = models.CharField(_("Téléphone"), max_length=50, blank=True, null=True)
    support_phone = models.CharField(_("Téléphone support"), max_length=50, blank=True, null=True)
    whatsapp = models.CharField(_("WhatsApp"), max_length=50, blank=True, null=True)
    email = models.EmailField(_("Email"), blank=True, null=True)
    support_email = models.EmailField(_("Email support"), blank=True, null=True)

    # Réseaux sociaux
    facebook_page = models.URLField(_("Facebook"), blank=True, null=True)
    instagram = models.URLField(_("Instagram"), blank=True, null=True)
    twitter = models.URLField(_("Twitter"), blank=True, null=True)
    linkedin = models.URLField(_("LinkedIn"), blank=True, null=True)
    youtube = models.URLField(_("YouTube"), blank=True, null=True)
    tiktok = models.URLField(_("TikTok"), blank=True, null=True)

    # Adresse
    location = models.CharField(_("Adresse"), max_length=255, blank=True, null=True)
    opening_hours = models.CharField(_("Horaires d'ouverture"), max_length=255, blank=True, null=True)

    # Contenu
    about = models.TextField(_("À propos"), blank=True, null=True)

    # SEO
    meta_title = models.CharField(_("Meta Title"), max_length=255, blank=True, null=True)
    meta_description = models.TextField(_("Meta Description"), blank=True, null=True)
    meta_keywords = models.CharField(_("Mots-clés SEO"), max_length=500, blank=True, null=True)

    # Branding
    logo = models.ImageField(upload_to="branding/", blank=True, null=True)
    logo_light = models.ImageField(upload_to="branding/", blank=True, null=True)
    logo_dark = models.ImageField(upload_to="branding/", blank=True, null=True)
    favicon = models.ImageField(
        upload_to="branding/",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(["ico", "png"])]
    )

    # Documents légaux
    cgv = models.FileField(
        upload_to="docs/",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(["pdf", "doc", "docx"])]
    )
    privacy_policy = models.TextField(_("Politique de confidentialité"), blank=True, null=True)
    refund_policy = models.TextField(_("Politique de remboursement"), blank=True, null=True)
    shipping_policy = models.TextField(_("Politique de livraison"), blank=True, null=True)

    # Horodatage
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Entreprise")
        verbose_name_plural = _("Entreprises")

    def __str__(self):
        return f"Paramètres : {self.company_name or 'non défini'}"

    def clean(self):
        """
        Empêche la création d'une deuxième instance (singleton).
        """
        if not self.pk and SiteSettings.objects.exists():
            raise ValidationError(
                _("Il existe déjà une instance des paramètres du site. "
                  "Modifiez l'instance existante au lieu d'en créer une nouvelle.")
            )

    def save(self, *args, **kwargs):
        self.full_clean()  # force la validation singleton
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        """
        Retourne l'instance existante si elle existe.
        """
        return cls.objects.first()


# Fin Informations générales sur l'entreprise
# Fin Informations générales sur l'entreprise


# Informations générales sur les produits
# Informations générales sur les produits


class Category(models.Model):
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)

    # Ajout pour sous-catégories
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='subcategories',
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200, unique=True)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.SET_NULL, null=True, blank=True)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    shot_description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    image = models.ImageField(upload_to='products/', blank=True)
    image_url = models.URLField(max_length=500, blank=True, null=True, help_text="URL externe de l'image source")
    stock = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def image_display_url(self):
        """Retourne l'URL de l'image : locale si disponible, sinon URL externe"""
        if self.image:
            return self.image.url
        elif self.image_url:
            return self.image_url
        return None


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)


# Fin Informations générales sur les produits
# Fin Informations générales sur les produits


# produit carousel
# produit carousel  


class ProductCarousel(models.Model):
    product = models.ForeignKey(Product, related_name='carousel_items', on_delete=models.CASCADE)
    comment_2 = models.CharField(max_length=255, blank=True, help_text="Deuxième commentaire marketing")
    comment_1 = models.CharField(max_length=255, blank=True, help_text="Premier commentaire marketing")
    is_active = models.BooleanField(default=True, help_text="Afficher ce produit dans le carousel")
    position = models.PositiveIntegerField(default=0, help_text="Ordre d'affichage dans le carousel")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position']
        verbose_name = "Carousel Product"
        verbose_name_plural = "Carousel Products"

    def __str__(self):
        return f"{self.product.name} (Carousel)"

    @property
    def price(self):
        """Accès direct au prix du produit"""
        return self.product.price

    @property
    def image(self):
        """
        Retourne l'image principale du produit
        Sinon la première image
        Sinon l'image par défaut du produit
        """
        primary_image = self.product.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.image.url

        first_image = self.product.images.first()
        if first_image:
            return first_image.image.url

        # Utilise image_display_url qui gère image ET image_url
        return self.product.image_display_url


# Fin produit carousel
# Fin produit carousel


# produit promotion
# produit promotion


class ProductPromotion(models.Model):
    product = models.OneToOneField(
        Product,
        related_name='promotion',
        on_delete=models.CASCADE
    )

    promo_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Prix promotionnel"
    )

    label = models.CharField(
        max_length=100,
        blank=True,
        help_text="Ex: Promo, -20%, Black Friday"
    )

    is_active = models.BooleanField(
        default=True,
        help_text="Promotion active ou non"
    )

    # ✅ NOUVEAU CHAMP
    is_featured = models.BooleanField(
        default=False,
        help_text="Mettre cette promotion en avant (homepage / hero)"
    )

    start_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date de début de la promotion"
    )

    end_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date de fin de la promotion"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Promotion product"
        verbose_name_plural = "Promotions products"

    def __str__(self):
        return f"Promo - {self.product.name}"

    @property
    def discount_percent(self):
        if self.product.price > 0:
            return round(
                ((self.product.price - self.promo_price) / self.product.price) * 100,
                2
            )
        return 0
