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


# Paramètres de page
# Paramètres de page


class ParametrePage(models.Model):
    """
    Paramètres de configuration pour les pages du site (singleton).
    """
    # Configuration section Nouveaux produits
    new_products_category_limit = models.PositiveIntegerField(
        default=3,
        help_text=_("Nombre de catégories à afficher dans la section Nouveaux produits")
    )
    new_products_per_category_limit = models.PositiveIntegerField(
        default=12,
        help_text=_("Nombre de produits récents à afficher par catégorie")
    )
    
    # Configuration section Commentaires
    commentaires_per_page = models.PositiveIntegerField(
        default=4,
        help_text=_("Nombre de commentaires à afficher initialement sur la page produit")
    )
    
    # Configuration section Boutique
    boutique_products_per_page = models.PositiveIntegerField(
        default=24,
        help_text=_("Nombre de produits à afficher par page dans la boutique")
    )

    # Horodatage
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Paramètres de page")
        verbose_name_plural = _("Paramètres de page")

    def __str__(self):
        return "Paramètres de page"

    def clean(self):
        """
        Empêche la création d'une deuxième instance (singleton).
        """
        if not self.pk and ParametrePage.objects.exists():
            raise ValidationError(
                _("Il existe déjà une instance des paramètres de page. "
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


# Fin Paramètres de page
# Fin Paramètres de page


# Ma Selection
# Ma Selection

class MaSelection(models.Model):
    """
    Modèle pour la section Ma Selection (singleton).
    Permet à l'utilisateur de définir manuellement les produits à afficher.
    """
    title = models.CharField(
        max_length=200,
        default="Ma Selection",
        help_text=_("Titre de la section Ma Selection")
    )
    products = models.ManyToManyField(
        'Product',
        related_name='ma_selections',
        blank=True,
        help_text=_("Sélectionnez les produits à afficher dans cette section")
    )
    is_active = models.BooleanField(
        default=True,
        help_text=_("Activez cette section pour l'afficher sur le site")
    )
    
    # Horodatage
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Ma Selection")
        verbose_name_plural = _("Ma Selection")

    def __str__(self):
        return f"Ma Selection - {self.title}"

    def clean(self):
        """
        Empêche la création d'une deuxième instance (singleton).
        """
        if not self.pk and MaSelection.objects.exists():
            raise ValidationError(
                _("Il existe déjà une instance de Ma Selection. "
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


# Fin Ma Selection
# Fin Ma Selection


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
    price = models.IntegerField(default=0)
    compare_at_price = models.IntegerField(blank=True, null=True)
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

    @property
    def average_rating(self):
        """Retourne la note moyenne des commentaires approuvés"""
        from django.db.models import Avg
        avg = self.commentaires.filter(is_approved=True).aggregate(Avg('note'))['note__avg']
        return round(avg, 1) if avg else 0.0

    @property
    def comment_count(self):
        """Retourne le nombre de commentaires approuvés"""
        return self.commentaires.filter(is_approved=True).count()


class Commentaire(models.Model):
    """
    Modèle pour les commentaires sur les produits.
    """
    RATING_CHOICES = [
        (1, '1 étoile'),
        (2, '2 étoiles'),
        (3, '3 étoiles'),
        (4, '4 étoiles'),
        (5, '5 étoiles'),
    ]
    
    product = models.ForeignKey(
        Product,
        related_name='commentaires',
        on_delete=models.CASCADE,
        verbose_name="Produit"
    )
    nom = models.CharField(max_length=100, verbose_name="Nom")
    email = models.EmailField(verbose_name="Email")
    commentaire = models.TextField(max_length=1000, verbose_name="Commentaire")
    note = models.IntegerField(
        choices=RATING_CHOICES,
        verbose_name="Note",
        help_text="Note de 1 à 5 étoiles"
    )
    save_email = models.BooleanField(
        default=False,
        verbose_name="Enregistrer l'email",
        help_text="Le client autorise l'enregistrement de son email"
    )
    is_approved = models.BooleanField(
        default=False,
        verbose_name="Approuvé",
        help_text="Le commentaire doit être approuvé avant d'être visible"
    )
    is_flagged = models.BooleanField(
        default=False,
        verbose_name="Signalé",
        help_text="Commentaire signalé comme inapproprié"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de modification")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Commentaire"
        verbose_name_plural = "Commentaires"
        indexes = [
            models.Index(fields=['product', 'is_approved']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.nom} - {self.product.name} ({self.note}/5)"
    
    def clean(self):
        """Validation personnalisée"""
        from django.core.exceptions import ValidationError
        
        # Valider la note
        if self.note < 1 or self.note > 5:
            raise ValidationError({'note': 'La note doit être entre 1 et 5.'})
        
        # Valider la longueur du commentaire
        if len(self.commentaire.strip()) < 10:
            raise ValidationError({'commentaire': 'Le commentaire doit contenir au moins 10 caractères.'})
        
        if len(self.commentaire) > 1000:
            raise ValidationError({'commentaire': 'Le commentaire ne peut pas dépasser 1000 caractères.'})


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

    promo_price = models.IntegerField(
        blank=True,
        null=True,
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
        if self.product.price > 0 and self.promo_price:
            return round(
                ((self.product.price - self.promo_price) / self.product.price) * 100,
                2
            )
        return 0



# produit flash
# produit flash


class ProductFlash(models.Model):
    title = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)

    # Dates communes pour les produits secondaires
    secondary_start_date = models.DateTimeField(null=True, blank=True)
    secondary_end_date = models.DateTimeField(null=True, blank=True)

    # Produits secondaires sélectionnés en masse
    secondary_products = models.ManyToManyField(
        'Product',
        blank=True,
        related_name='flash_secondary',
        help_text="Sélectionnez maximum 8 produits secondaires pour ce flash"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title or f"Flash #{self.id}"

    def clean(self):
        """Valide que le produit principal n'est pas dans les produits secondaires"""
        super().clean()
        
        # Vérifier seulement si l'instance existe déjà (a un ID)
        if self.pk:
            main_item = self.main_item
            if main_item and main_item.product:
                main_product = main_item.product
                if main_product in self.secondary_products.all():
                    raise ValidationError(
                        f"Le produit principal '{main_product.name}' ne peut pas être "
                        "dans la liste des produits secondaires."
                    )

    def save(self, *args, **kwargs):
        """Sauvegarde le modèle et retire le produit principal des produits secondaires"""
        # Sauvegarder d'abord pour avoir un ID si c'est une nouvelle instance
        super().save(*args, **kwargs)
        
        # Retirer automatiquement le produit principal des produits secondaires
        main_item = self.main_item
        if main_item and main_item.product:
            main_product = main_item.product
            if main_product in self.secondary_products.all():
                self.secondary_products.remove(main_product)

    @property
    def main_item(self):
        """Retourne le produit principal du flash"""
        return self.items.filter(is_main=True).first()

    @property
    def main_countdown(self):
        main = self.main_item
        if main:
            return (main.start_date, main.end_date)
        return (None, None)

    @property
    def secondary_countdown(self):
        return (self.secondary_start_date, self.secondary_end_date)


class FlashProductItem(models.Model):
    flash = models.ForeignKey(ProductFlash, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    is_main = models.BooleanField(default=False)
    # start/end pour le principal uniquement
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    compare_at_price = models.IntegerField(blank=True, null=True, help_text="Prix de comparaison (ancien prix)")


    class Meta:
        ordering = ['id']
        constraints = [
            models.UniqueConstraint(
                fields=['flash'],
                condition=models.Q(is_main=True),
                name='unique_main_product_per_flash'
            )
        ]

    def __str__(self):
        return f"{self.product.name} (Flash Item)"

    @property
    def countdown(self):
        """Retourne le compte à rebours de ce produit"""
        if self.is_main:
            return (self.start_date, self.end_date)
        # autres produits : compte à rebours commun du flash
        return self.flash.secondary_countdown


# Paiement PayPal & Commandes
# Paiement PayPal & Commandes


class PendingPayPalOrder(models.Model):
    """
    Commande PayPal en attente (créée côté serveur avant redirection utilisateur).
    Permet de lier l'order ID PayPal au panier et de valider la capture côté backend.
    """
    STATUS_PENDING = "pending"
    STATUS_CAPTURED = "captured"
    STATUS_EXPIRED = "expired"
    STATUS_CHOICES = [
        (STATUS_PENDING, "En attente"),
        (STATUS_CAPTURED, "Capturé"),
        (STATUS_EXPIRED, "Expiré"),
    ]

    paypal_order_id = models.CharField(_("ID commande PayPal"), max_length=255, unique=True, db_index=True)
    cart_snapshot = models.JSONField(
        _("Snapshot du panier"),
        help_text="Liste des items: [{id, name, price, quantity}]",
        default=list,
    )
    # Facturation (pour créer la Order à la capture)
    billing_snapshot = models.JSONField(
        _("Snapshot facturation"),
        help_text="{email, first_name, last_name, address, city, country, zip_code, phone}",
        default=dict,
        blank=True,
    )
    total_cfa = models.PositiveIntegerField(_("Total CFA"), default=0)
    amount_value = models.DecimalField(
        _("Montant envoyé à PayPal"),
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Montant dans la devise PayPal (ex: EUR)",
    )
    currency = models.CharField(_("Devise PayPal"), max_length=3, default="EUR")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Commande PayPal en attente")
        verbose_name_plural = _("Commandes PayPal en attente")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Pending PayPal {self.paypal_order_id} ({self.status})"


class PendingMTNMoMoOrder(models.Model):
    """
    Commande MTN Mobile Money en attente (créée côté serveur lors de la demande de paiement).
    Permet de suivre le statut du paiement MTN MoMo et de créer la commande finale.
    """
    STATUS_PENDING = "pending"
    STATUS_SUCCESSFUL = "successful"
    STATUS_FAILED = "failed"
    STATUS_CANCELLED = "cancelled"
    STATUS_EXPIRED = "expired"
    STATUS_CHOICES = [
        (STATUS_PENDING, "En attente"),
        (STATUS_SUCCESSFUL, "Réussi"),
        (STATUS_FAILED, "Échoué"),
        (STATUS_CANCELLED, "Annulé"),
        (STATUS_EXPIRED, "Expiré"),
    ]

    transaction_id = models.CharField(
        _("ID transaction MTN MoMo"), 
        max_length=255, 
        unique=True, 
        db_index=True
    )
    cart_snapshot = models.JSONField(
        _("Snapshot du panier"),
        help_text="Liste des items: [{id, name, price, quantity}]",
        default=list,
    )
    # Facturation (pour créer la Order à la confirmation)
    billing_snapshot = models.JSONField(
        _("Snapshot facturation"),
        help_text="{email, first_name, last_name, address, city, country, zip_code, phone}",
        default=dict,
        blank=True,
    )
    total_cfa = models.PositiveIntegerField(_("Total CFA"), default=0)
    amount = models.PositiveIntegerField(_("Montant XAF"), default=0)
    currency = models.CharField(_("Devise"), max_length=3, default="XAF")
    phone_number = models.CharField(
        _("Numéro de téléphone MTN"), 
        max_length=20,
        help_text="Numéro au format 237XXXXXXXXX"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True,
    )
    mtn_response = models.JSONField(
        _("Réponse MTN MoMo"),
        help_text="Réponse complète de l'API MTN MoMo",
        default=dict,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Commande MTN Mobile Money en attente")
        verbose_name_plural = _("Commandes MTN Mobile Money en attente")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Pending MTN MoMo {self.transaction_id} ({self.status})"


class PendingOrangeMoneyOrder(models.Model):
    """
    Commande Orange Money en attente (créée côté serveur lors de la demande de paiement).
    Permet de suivre le statut du paiement Orange Money et de créer la commande finale.
    """
    STATUS_PENDING = "pending"
    STATUS_SUCCESSFUL = "successful"
    STATUS_FAILED = "failed"
    STATUS_CANCELLED = "cancelled"
    STATUS_EXPIRED = "expired"
    STATUS_CHOICES = [
        (STATUS_PENDING, "En attente"),
        (STATUS_SUCCESSFUL, "Réussi"),
        (STATUS_FAILED, "Échoué"),
        (STATUS_CANCELLED, "Annulé"),
        (STATUS_EXPIRED, "Expiré"),
    ]

    transaction_id = models.CharField(
        _("ID transaction Orange Money"), 
        max_length=255, 
        unique=True, 
        db_index=True
    )
    cart_snapshot = models.JSONField(
        _("Snapshot du panier"),
        help_text="Liste des items: [{id, name, price, quantity}]",
        default=list,
    )
    # Facturation (pour créer la Order à la confirmation)
    billing_snapshot = models.JSONField(
        _("Snapshot facturation"),
        help_text="{email, first_name, last_name, address, city, country, zip_code, phone}",
        default=dict,
        blank=True,
    )
    total_cfa = models.PositiveIntegerField(_("Total CFA"), default=0)
    amount = models.PositiveIntegerField(_("Montant XAF"), default=0)
    currency = models.CharField(_("Devise"), max_length=3, default="XAF")
    phone_number = models.CharField(
        _("Numéro de téléphone Orange"), 
        max_length=20,
        help_text="Numéro au format 237XXXXXXXXX"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True,
    )
    orange_response = models.JSONField(
        _("Réponse Orange Money"),
        help_text="Réponse complète de l'API Orange Money",
        default=dict,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Commande Orange Money en attente")
        verbose_name_plural = _("Commandes Orange Money en attente")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Pending Orange Money {self.transaction_id} ({self.status})"


class Order(models.Model):
    """
    Commande client (créée après capture réussie du paiement PayPal).
    """
    STATUS_PAID = "paid"
    STATUS_PENDING = "pending"
    STATUS_REFUNDED = "refunded"
    STATUS_FAILED = "failed"
    STATUS_CHOICES = [
        (STATUS_PAID, "Payée"),
        (STATUS_PENDING, "En attente"),
        (STATUS_REFUNDED, "Remboursée"),
        (STATUS_FAILED, "Échouée"),
    ]

    PAYMENT_PAYPAL = "paypal"
    PAYMENT_BANK = "bank"
    PAYMENT_CHEQUE = "cheque"
    PAYMENT_MTN_MOMO = "mtn_momo"
    PAYMENT_ORANGE_MONEY = "orange_money"
    PAYMENT_CHOICES = [
        (PAYMENT_PAYPAL, "PayPal"),
        (PAYMENT_BANK, "Virement bancaire"),
        (PAYMENT_CHEQUE, "Chèque"),
        (PAYMENT_MTN_MOMO, "MTN Mobile Money"),
        (PAYMENT_ORANGE_MONEY, "Orange Money"),
    ]

    # Client
    email = models.EmailField(_("Email"))
    first_name = models.CharField(_("Prénom"), max_length=100)
    last_name = models.CharField(_("Nom"), max_length=100)
    address = models.CharField(_("Adresse"), max_length=255, blank=True)
    city = models.CharField(_("Ville"), max_length=100, blank=True)
    country = models.CharField(_("Pays"), max_length=100, blank=True)
    zip_code = models.CharField(_("Code postal"), max_length=20, blank=True)
    phone = models.CharField(_("Téléphone"), max_length=50, blank=True)

    total_cfa = models.PositiveIntegerField(_("Total CFA"), default=0)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True,
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES,
        default=PAYMENT_PAYPAL,
    )
    paypal_order_id = models.CharField(
        _("ID commande PayPal"),
        max_length=255,
        blank=True,
        null=True,
        db_index=True,
    )
    mtn_transaction_id = models.CharField(
        _("ID transaction MTN MoMo"),
        max_length=255,
        blank=True,
        null=True,
        db_index=True,
    )
    orange_transaction_id = models.CharField(
        _("ID transaction Orange Money"),
        max_length=255,
        blank=True,
        null=True,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Commande")
        verbose_name_plural = _("Commandes")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Commande #{self.id} - {self.email} ({self.total_cfa} CFA)"


class OrderItem(models.Model):
    """Ligne de commande (snapshot produit au moment de l'achat)."""
    order = models.ForeignKey(
        Order,
        related_name="items",
        on_delete=models.CASCADE,
        verbose_name=_("Commande"),
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_items",
        verbose_name=_("Produit"),
    )
    name = models.CharField(_("Nom produit"), max_length=255)
    price = models.PositiveIntegerField(_("Prix unitaire CFA"), default=0)
    quantity = models.PositiveIntegerField(_("Quantité"), default=1)

    class Meta:
        verbose_name = _("Ligne de commande")
        verbose_name_plural = _("Lignes de commande")

    def __str__(self):
        return f"{self.name} x{self.quantity}"
