from django.contrib import admin
from django.utils.html import format_html
from django.shortcuts import render, redirect
from django.contrib import messages
from django.urls import path
from django.http import HttpResponse, JsonResponse
from .forms import CsvImportForm, ImageImportForm, CategoryCsvImportForm
import csv
import io
import requests
from requests.exceptions import RequestException
from urllib.parse import urlparse
from django.core.files.base import ContentFile
from django.utils.text import slugify
import os
from pathlib import Path
from django.conf import settings
from django.core.paginator import Paginator
from django.utils import timezone
from datetime import datetime
from urllib.parse import quote

from decimal import InvalidOperation, Decimal
from .models import SiteSettings, Category, Product, ProductImage, ProductCarousel, ProductPromotion, ParametrePage, Commentaire, Order, OrderItem, PendingPayPalOrder




# Personnaliser le titre de l'administration avec le nom de l'entreprise
try:
    site_settings = SiteSettings.load()
    if site_settings and site_settings.company_name:
        admin.site.site_header = f"{site_settings.company_name} Administration"
        admin.site.site_title = f"{site_settings.company_name} Admin"
    else:
        admin.site.site_header = "Django Administration"
        admin.site.site_title = "Django Admin"
except:
    # Si SiteSettings n'existe pas encore ou erreur, utiliser la valeur par défaut
    admin.site.site_header = "Django Administration"
    admin.site.site_title = "Django Admin"





# Informations générales sur l'entreprise
# Informations générales sur l'entreprise

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    # Affichage rapide dans la liste
    list_display = ("logo_thumbnail", "company_name", "phone", "email", "rc_number", "nif")
    list_display_links = ("company_name",)  # cliquer sur le nom pour éditer

    # Empêche l'ajout de plusieurs instances (singleton)
    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    # Empêche la suppression
    def has_delete_permission(self, request, obj=None):
        return False

    # Organisation en sections
    fieldsets = (
        ("Information générale", {
            "fields": ("company_name", "statut_juridique", "rc_number", "nif")
        }),
        ("Contacts", {
            "fields": ("phone", "support_phone", "whatsapp", "email", "support_email")
        }),
        ("Réseaux sociaux", {
            "fields": ("facebook_page", "instagram", "twitter", "linkedin", "youtube", "tiktok")
        }),
        ("Adresse & Horaires", {
            "fields": ("location", "opening_hours")
        }),
        ("Contenu", {
            "fields": ("about",)
        }),
        ("SEO", {
            "fields": ("meta_title", "meta_description", "meta_keywords")
        }),
        ("Branding", {
            "fields": ("logo", "logo_light", "logo_dark", "favicon", "logo_preview")
        }),
        ("Documents légaux", {
            "fields": ("cgv", "privacy_policy", "refund_policy", "shipping_policy")
        }),
        ("Horodatage", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    # Champs en lecture seule
    readonly_fields = ("created_at", "updated_at", "logo_preview")

    # Aperçu du logo dans la fiche d'édition
    def logo_preview(self, obj):
        if obj.logo:
            return format_html('<img src="{}" width="120" style="border-radius:6px;"/>', obj.logo.url)
        return "Aucun logo"

    logo_preview.short_description = "Prévisualisation du logo"

    # Aperçu du logo dans la liste
    def logo_thumbnail(self, obj):
        if obj.logo:
            return format_html('<img src="{}" width="50" style="border-radius:4px;"/>', obj.logo.url)
        return "—"

    logo_thumbnail.short_description = "Logo"

    # Recherche simple
    search_fields = ("company_name", "rc_number", "nif", "email")

    # Tri par défaut
    ordering = ("company_name",)


# FIN Informations générales sur l'entreprise
# FIN Informations générales sur l'entreprise


# Paramètres de page
# Paramètres de page


@admin.register(ParametrePage)
class ParametrePageAdmin(admin.ModelAdmin):
    # Affichage rapide dans la liste
    list_display = ("new_products_category_limit", "new_products_per_category_limit", "commentaires_per_page", "boutique_products_per_page", "updated_at")
    list_display_links = ("new_products_category_limit",)

    # Empêche l'ajout de plusieurs instances (singleton)
    def has_add_permission(self, request):
        return not ParametrePage.objects.exists()

    # Empêche la suppression
    def has_delete_permission(self, request, obj=None):
        return False

    # Organisation en sections
    fieldsets = (
        ("Section Nouveaux produits", {
            "fields": ("new_products_category_limit", "new_products_per_category_limit"),
            "description": "Contrôle du nombre de catégories et de produits affichés dans la section Nouveaux produits.",
        }),
        ("Section Commentaires", {
            "fields": ("commentaires_per_page",),
            "description": "Contrôle du nombre de commentaires affichés initialement sur la page produit.",
        }),
        ("Section Boutique", {
            "fields": ("boutique_products_per_page",),
            "description": "Contrôle du nombre de produits affichés par page dans la boutique.",
        }),
        ("Horodatage", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    # Champs en lecture seule
    readonly_fields = ("created_at", "updated_at")

    # Recherche simple
    search_fields = ()

    # Tri par défaut
    ordering = ("-updated_at",)


# FIN Paramètres de page
# FIN Paramètres de page


# Informations générales sur les produits
# Informations générales sur les produits




# ==================== CATEGORY ====================
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent', 'image_preview', 'created_at']
    list_filter = ['created_at', 'parent']
    search_fields = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'image_preview']
    change_list_template = "admin/category_change_list.html"

    fieldsets = (
        ('Informations principales', {
            'fields': ('name', 'slug', 'parent', 'description')
        }),
        ('Image', {
            'fields': ('image', 'image_preview')
        }),
        ('Dates', {
            'fields': ('created_at',)
        }),
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 50px;" />',
                obj.image.url
            )
        return "Aucune image"

    image_preview.short_description = "Aperçu"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('import-categories/', self.import_csv_view, name='category_import_csv'),
            path('import-images/', self.import_images_view, name='category_import_images'),
            path('list-images/', self.list_category_files_view, name='category_files_view'),
            path('delete-image/', self.delete_category_file_view, name='category_files_delete'),
        ]
        return custom_urls + urls

    def import_csv_view(self, request):
        """Import de catégories via CSV (nom, parent, sous-parent, image)."""
        if request.method == 'POST':
            form = CategoryCsvImportForm(request.POST, request.FILES)
            if form.is_valid():
                csv_file = request.FILES['csv_file']

                # Lecture du fichier CSV avec gestion d'encodage
                file_bytes = csv_file.read()
                try:
                    file_data = file_bytes.decode('utf-8-sig')
                except UnicodeDecodeError:
                    file_data = file_bytes.decode('latin-1')

                io_string = io.StringIO(file_data)
                reader = csv.DictReader(io_string)

                success_count = 0
                error_count = 0
                errors = []

                def clean_dict(row):
                    return {
                        (k or '').strip().lower(): (v.strip() if isinstance(v, str) else v)
                        for k, v in row.items()
                    }

                def get_value(data, keys):
                    for key in keys:
                        if key in data and data[key] is not None:
                            return data[key]
                    return ''

                for row_num, row in enumerate(reader, start=2):
                    cleaned_row = clean_dict(row)

                    name = get_value(cleaned_row, ['nom', 'name', 'categorie', 'catégorie', 'category'])
                    parent_name = get_value(cleaned_row, ['categorie parent', 'catégorie parent', 'parent', 'parent_category'])
                    sub_parent_name = get_value(cleaned_row, ['sous parent', 'sous_parent', 'subparent', 'sub_parent'])
                    image_url = get_value(cleaned_row, ['image', 'image_url', 'url'])

                    if not name:
                        errors.append(f"Ligne {row_num}: Le nom de la catégorie est requis")
                        error_count += 1
                        continue

                    try:
                        # Gérer la hiérarchie : parent puis sous-parent
                        parent_obj = None
                        if parent_name:
                            parent_obj, _ = Category.objects.get_or_create(
                                name=parent_name,
                                defaults={
                                    'slug': slugify(parent_name),
                                    'description': f'Catégorie parente importée automatiquement pour {parent_name}'
                                }
                            )

                        sub_parent_obj = None
                        if sub_parent_name:
                            sub_parent_obj, _ = Category.objects.get_or_create(
                                name=sub_parent_name,
                                defaults={
                                    'slug': slugify(sub_parent_name),
                                    'description': f'Sous-catégorie importée automatiquement pour {sub_parent_name}',
                                    'parent': parent_obj
                                }
                            )
                            # Si la sous-catégorie existe déjà mais sans parent, la rattacher
                            if parent_obj and sub_parent_obj.parent_id != parent_obj.id:
                                sub_parent_obj.parent = parent_obj
                                sub_parent_obj.save(update_fields=['parent'])

                        final_parent = sub_parent_obj or parent_obj

                        category, created = Category.objects.get_or_create(
                            name=name,
                            defaults={
                                'slug': slugify(name),
                                'description': f'Catégorie importée automatiquement pour {name}',
                                'parent': final_parent
                            }
                        )

                        # Mettre à jour le parent si la catégorie existait déjà
                        if final_parent and category.parent_id != final_parent.id:
                            category.parent = final_parent
                            category.save(update_fields=['parent'])

                        # Télécharger et associer l'image si fournie
                        if image_url:
                            try:
                                response = requests.get(image_url, timeout=10)
                                response.raise_for_status()

                                extension = Path(urlparse(image_url).path).suffix.lower()
                                valid_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'}
                                if extension not in valid_extensions:
                                    extension = '.jpg'

                                filename = f"{slugify(name)}{extension}"
                                category.image.save(filename, ContentFile(response.content), save=False)
                                category.save(update_fields=['image'])
                            except RequestException as e:
                                errors.append(f"Ligne {row_num}: Image non téléchargée ({str(e)})")

                        success_count += 1
                    except Exception as e:
                        errors.append(f"Ligne {row_num}: Erreur - {str(e)}")
                        error_count += 1

                if success_count:
                    messages.success(request, f'{success_count} catégorie(s) importée(s) avec succès.')

                if errors:
                    error_msg = f'{error_count} erreur(s):<ul>'
                    for error in errors[:10]:
                        error_msg += f'<li>{error}</li>'
                    if len(errors) > 10:
                        error_msg += f'<li>... et {len(errors) - 10} autre(s)</li>'
                    error_msg += '</ul>'
                    messages.error(request, format_html(error_msg))

                return redirect('admin:api_category_changelist')
        else:
            form = CategoryCsvImportForm()

        context = {
            'form': form,
            'opts': self.model._meta,
            'has_view_permission': self.has_view_permission(request),
        }
        return render(request, 'admin/import_category_csv.html', context)

    def import_images_view(self, request):
        """Vue pour uploader des images depuis l'ordinateur et les mapper aux catégories"""
        if request.method == 'POST':
            form = ImageImportForm(request.POST, request.FILES)

            # Récupérer les fichiers depuis le formulaire validé ou directement depuis request.FILES
            if form.is_valid():
                uploaded_files = form.cleaned_data.get('images', [])
                # S'assurer que c'est une liste
                if not isinstance(uploaded_files, list):
                    uploaded_files = [uploaded_files] if uploaded_files else []
            else:
                # Si le formulaire n'est pas valide mais qu'il y a des fichiers, les récupérer directement
                uploaded_files = request.FILES.getlist('images') if 'images' in request.FILES else []

            if not uploaded_files:
                messages.error(request, "Aucune image sélectionnée. Veuillez sélectionner au moins une image.")
            else:
                # Créer un dictionnaire de mapping : nom_fichier_sans_extension -> fichier
                files_map = {}
                for uploaded_file in uploaded_files:
                    # Extraire le nom sans extension pour le mapping
                    filename_without_ext = uploaded_file.name.rsplit('.', 1)[
                        0] if '.' in uploaded_file.name else uploaded_file.name
                    files_map[filename_without_ext] = uploaded_file

                # Récupérer toutes les catégories
                categories = Category.objects.all()

                success_count = 0
                error_count = 0
                errors = []
                unmatched_images = []

                # Parcourir les catégories et mapper les images par nom
                for category in categories:
                    # Utiliser le nom de la catégorie (slugifié) pour le matching
                    category_name_slug = slugify(category.name)
                    
                    # Chercher le fichier correspondant
                    matched_file = None
                    
                    # Essayer avec le nom exact (slugifié)
                    if category_name_slug in files_map:
                        matched_file = files_map[category_name_slug]
                    else:
                        # Essayer aussi avec le nom original (sans slug)
                        category_name_lower = category.name.lower().strip()
                        for filename_key, file_obj in files_map.items():
                            # Comparaison flexible : ignorer les différences de casse et espaces
                            if filename_key.lower().strip() == category_name_lower:
                                matched_file = file_obj
                                break
                            # Aussi essayer avec le nom du fichier uploadé complet
                            if file_obj.name.rsplit('.', 1)[
                                0].lower().strip() == category_name_lower:
                                matched_file = file_obj
                                break

                    if matched_file:
                        try:
                            # Générer un nom de fichier unique pour éviter les collisions
                            original_name = matched_file.name
                            name_part = slugify(category.name)
                            # Préserver l'extension originale
                            if '.' in original_name:
                                ext = original_name.rsplit('.', 1)[1].lower()
                                # Valider l'extension
                                valid_extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg']
                                if ext not in valid_extensions:
                                    ext = 'jpg'
                                filename = f'{name_part}_{category.id}.{ext}'
                            else:
                                filename = f'{name_part}_{category.id}.jpg'

                            # Sauvegarder l'image
                            category.image.save(
                                filename,
                                matched_file,
                                save=True
                            )
                            success_count += 1
                        except Exception as e:
                            errors.append(f"Catégorie '{category.name}': Erreur lors de l'enregistrement - {str(e)}")
                            error_count += 1
                    else:
                        # Image non trouvée pour cette catégorie
                        unmatched_images.append(f"Catégorie '{category.name}'")

                # Vérifier les images uploadées qui n'ont pas été utilisées
                used_files = set()
                for category in Category.objects.all():
                    if category.image:
                        used_files.add(category.image.name.split('/')[-1])

                unused_images = []
                for uploaded_file in uploaded_files:
                    if uploaded_file.name not in used_files:
                        unused_images.append(uploaded_file.name)

                # Afficher les messages
                if success_count > 0:
                    messages.success(
                        request,
                        f'{success_count} image(s) uploadée(s) et associée(s) avec succès.'
                    )

                if unmatched_images:
                    error_msg = f'{len(unmatched_images)} catégorie(s) sans image correspondante:<ul>'
                    for unmatched in unmatched_images[:10]:
                        error_msg += f'<li>{unmatched}</li>'
                    if len(unmatched_images) > 10:
                        error_msg += f'<li>... et {len(unmatched_images) - 10} autre(s)</li>'
                    error_msg += '</ul>'
                    messages.warning(request, format_html(error_msg))

                if unused_images:
                    unused_msg = f'{len(unused_images)} image(s) uploadée(s) non utilisée(s):<ul>'
                    for unused in unused_images[:5]:
                        unused_msg += f'<li>{unused}</li>'
                    if len(unused_images) > 5:
                        unused_msg += f'<li>... et {len(unused_images) - 5} autre(s)</li>'
                    unused_msg += '</ul><p>Vérifiez que les noms des fichiers correspondent aux noms des catégories.</p>'
                    messages.info(request, format_html(unused_msg))

                if errors:
                    error_msg = f'{len(errors)} erreur(s):<ul>'
                    for error in errors[:10]:
                        error_msg += f'<li>{error}</li>'
                    if len(errors) > 10:
                        error_msg += f'<li>... et {len(errors) - 10} autre(s)</li>'
                    error_msg += '</ul>'
                    messages.error(request, format_html(error_msg))

                return redirect('admin:api_category_changelist')
        else:
            form = ImageImportForm()

        # Compter les catégories pour les statistiques
        categories_without_images = Category.objects.filter(image__isnull=True) | Category.objects.filter(image='')
        categories_with_images = Category.objects.exclude(image__isnull=True).exclude(image='')

        # Lister les noms de catégories sans images
        category_names = [c.name for c in categories_without_images[:20]]

        context = {
            'form': form,
            'opts': self.model._meta,
            'has_view_permission': self.has_view_permission(request),
            'categories_total': Category.objects.count(),
            'categories_without_images': categories_without_images.count(),
            'category_names': category_names,
        }
        return render(request, 'admin/import_category_images.html', context)

    def list_category_files_view(self, request):
        """Vue pour afficher toutes les images du dossier media/categories/"""
        # Chemin du dossier categories
        categories_dir = settings.MEDIA_ROOT / 'categories'

        # Créer le dossier s'il n'existe pas
        categories_dir.mkdir(parents=True, exist_ok=True)

        # Lister tous les fichiers image
        image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'}
        files_data = []

        if categories_dir.exists():
            for file_path in categories_dir.iterdir():
                if file_path.is_file() and file_path.suffix.lower() in image_extensions:
                    # Obtenir les informations du fichier
                    stat = file_path.stat()

                    # Date de modification du fichier
                    modified_time = datetime.fromtimestamp(stat.st_mtime, tz=timezone.get_current_timezone())

                    # Taille du fichier
                    size_bytes = stat.st_size
                    size_mb = round(size_bytes / (1024 * 1024), 2)

                    # Nom du fichier
                    filename = file_path.name

                    # URL du fichier
                    relative_path = f'categories/{filename}'
                    file_url = f"{settings.MEDIA_URL}{relative_path}"
                    # URL encodée pour l'affichage dans le navigateur
                    encoded_filename = quote(filename, safe='')
                    full_url = f"{settings.MEDIA_URL}categories/{encoded_filename}"

                    files_data.append({
                        'name': filename,
                        'url': file_url,
                        'full_url': full_url,
                        'size_bytes': size_bytes,
                        'size_mb': size_mb,
                        'modified_date': modified_time,
                        'created_date': datetime.fromtimestamp(stat.st_ctime, tz=timezone.get_current_timezone()),
                    })

        # Trier par date de modification (plus récent en premier)
        files_data.sort(key=lambda x: x['modified_date'], reverse=True)

        # Pagination
        paginator = Paginator(files_data, 24)  # 24 images par page
        page_number = request.GET.get('page', 1)
        page_obj = paginator.get_page(page_number)

        context = {
            **self.admin_site.each_context(request),
            'title': 'Images importées - Catégories',
            'opts': self.model._meta,
            'has_view_permission': self.has_view_permission(request, None),
            'files': page_obj,
            'total_files': len(files_data),
            'has_change_permission': self.has_change_permission(request, None),
            'has_delete_permission': self.has_delete_permission(request, None),
        }

        return render(request, 'admin/category_files_list.html', context)

    def delete_category_file_view(self, request):
        """Vue pour supprimer une image de catégorie"""
        if not request.method == 'POST':
            messages.error(request, "Méthode non autorisée.")
            return redirect('admin:category_files_view')

        if not self.has_delete_permission(request, None):
            messages.error(request, "Vous n'avez pas la permission de supprimer des fichiers.")
            return redirect('admin:category_files_view')

        file_name = request.POST.get('file_name')
        if not file_name:
            messages.error(request, "Nom de fichier manquant.")
            return redirect('admin:category_files_view')

        # Sécuriser le nom du fichier (empêcher les paths relatifs)
        file_name = os.path.basename(file_name)

        # Chemin complet du fichier
        file_path = settings.MEDIA_ROOT / 'categories' / file_name

        # Vérifier que le fichier existe et est dans le bon dossier
        if file_path.exists() and file_path.parent == settings.MEDIA_ROOT / 'categories':
            try:
                # Vérifier si l'image est utilisée par une catégorie
                categories_using_image = Category.objects.filter(
                    image__icontains=file_name
                )

                if categories_using_image.exists():
                    # Supprimer la référence dans les catégories
                    for category in categories_using_image:
                        if category.image and file_name in category.image.name:
                            category.image.delete(save=False)
                            category.image = None
                            category.save()

                # Supprimer le fichier
                file_path.unlink()
                messages.success(request, f"L'image '{file_name}' a été supprimée avec succès.")
            except Exception as e:
                messages.error(request, f"Erreur lors de la suppression: {str(e)}")
        else:
            messages.error(request, "Fichier introuvable ou chemin invalide.")

        return redirect('admin:category_files_view')


# ==================== PRODUCT IMAGE (Inline) ====================
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'alt_text', 'is_primary']
    readonly_fields = []


# ==================== PRODUCT ====================

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'price', 'stock', 'is_active', 'image_preview', 'created_at'
    ]
    list_filter = ['is_active', 'category', 'created_at']
    search_fields = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at', 'image_preview', 'image_url_display']
    inlines = [ProductImageInline]
    list_per_page = 20  # ← Ajoutez cette ligne
    change_list_template = "admin/product_change_list.html"

    fieldsets = (
        ('Informations principales', {
            'fields': ('name', 'slug', 'category', 'description', 'shot_description')
        }),
        ('Prix et Stock', {
            'fields': ('price', 'compare_at_price', 'stock', 'is_active')
        }),
        ('Image principale', {
            'fields': ('image', 'image_url', 'image_preview', 'image_url_display')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def image_preview(self, obj):
        """Affiche l'image : locale si disponible, sinon URL externe"""
        image_url = obj.image_display_url
        if image_url:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 50px;" />',
                image_url
            )
        return "Aucune image"

    image_preview.short_description = "Aperçu"

    def image_url_display(self, obj):
        """Affiche l'URL externe de l'image"""
        if obj.image_url:
            return format_html(
                '<a href="{}" target="_blank">{}</a>',
                obj.image_url, obj.image_url
            )
        return "Aucune URL"

    image_url_display.short_description = "URL source de l'image"

    def _get_unique_slug(self, name):
        """Génère un slug unique pour une catégorie."""
        base_slug = slugify(name)
        slug = base_slug
        counter = 1
        while Category.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    def get_queryset(self, request):
        """Override pour nettoyer les valeurs Decimal invalides lors de la récupération"""
        qs = super().get_queryset(request)
        # Nettoyer les produits avec des valeurs Decimal invalides en arrière-plan
        try:
            products_to_update = []
            for product in qs[:100]:  # Limiter pour éviter de surcharger
                needs_update = False
                # Vérifier et corriger le prix
                try:
                    if product.price is not None:
                        Decimal(str(product.price))
                except (InvalidOperation, ValueError, TypeError):
                    product.price = Decimal('0.00')
                    needs_update = True

                # Vérifier et corriger compare_at_price
                try:
                    if product.compare_at_price is not None:
                        Decimal(str(product.compare_at_price))
                except (InvalidOperation, ValueError, TypeError):
                    product.compare_at_price = None
                    needs_update = True

                if needs_update:
                    products_to_update.append(product)

            # Mettre à jour les produits qui ont besoin de correction
            if products_to_update:
                from django.db import transaction
                with transaction.atomic():
                    for product in products_to_update:
                        Product.objects.filter(pk=product.pk).update(
                            price=product.price,
                            compare_at_price=product.compare_at_price
                        )
        except Exception:
            # En cas d'erreur lors du nettoyage, continuer quand même
            pass

        return qs

    actions = ['make_active', 'make_inactive']

    def make_active(self, request, queryset):
        queryset.update(is_active=True)

    make_active.short_description = "Activer les produits sélectionnés"

    def make_inactive(self, request, queryset):
        queryset.update(is_active=False)

    make_inactive.short_description = "Désactiver les produits sélectionnés"

    # ============ NOUVEAU : Import CSV ============
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('import-csv/', self.import_csv_view, name='product_import_csv'),
            path('import-images/', self.import_images_view, name='product_import_images'),
            path('list-images/', self.list_product_files_view, name='product_files_view'),
            path('delete-image/', self.delete_product_file_view, name='product_files_delete'),
        ]
        return custom_urls + urls

    def import_csv_view(self, request):
        """Import de produits via CSV (headers flexibles, catégorie + hiérarchie optionnelle, image URL optionnelle)."""
        if request.method == 'POST':
            form = CsvImportForm(request.POST, request.FILES)
            if form.is_valid():
                csv_file = request.FILES['csv_file']

                # Lecture du fichier CSV avec gestion d'encodage (évite le double read())
                try:
                    file_bytes = csv_file.read()
                    file_data = file_bytes.decode('utf-8-sig')  # utf-8-sig gère le BOM
                except UnicodeDecodeError:
                    file_data = file_bytes.decode('latin-1')

                io_string = io.StringIO(file_data)
                reader = csv.DictReader(io_string)

                created_count = 0
                updated_count = 0
                errors = []

                def clean_dict(row):
                    return {
                        (k or '').strip().lower(): (v.strip() if isinstance(v, str) else v)
                        for k, v in row.items()
                    }

                def get_value(data, keys):
                    for key in keys:
                        if key in data and data[key] is not None:
                            return data[key]
                    return ''

                def parse_bool(val, default=True):
                    if val is None:
                        return default
                    s = str(val).strip().lower()
                    if s == '':
                        return default
                    if s in {'1', 'true', 'yes', 'y', 'oui', 'vrai', 'on', 'actif', 'active'}:
                        return True
                    if s in {'0', 'false', 'no', 'n', 'non', 'faux', 'off', 'inactif', 'inactive'}:
                        return False
                    return default

                def parse_int(val, default=0):
                    if val is None:
                        return default
                    s = str(val).strip()
                    if s == '':
                        return default
                    try:
                        return int(float(s.replace(' ', '').replace(',', '.')))
                    except Exception:
                        return default

                def parse_decimal(val, default=None):
                    if val is None:
                        return default
                    s = str(val).strip()
                    if s == '':
                        return default
                    try:
                        s = s.replace(' ', '').replace(',', '.')
                        d = Decimal(str(float(s))).quantize(Decimal('0.01'))
                        if d < 0 or d > Decimal('99999999.99'):
                            return default
                        return d
                    except Exception:
                        return default

                def maybe_download_category_image(category_obj, image_url_value, *, label_for_errors):
                    """Télécharge et associe une image à une catégorie si URL http(s) fournie."""
                    if not category_obj or not image_url_value:
                        return
                    if not isinstance(image_url_value, str):
                        return
                    image_url_value = image_url_value.strip()
                    if not image_url_value.startswith(('http://', 'https://')):
                        return
                    try:
                        response = requests.get(image_url_value, timeout=10)
                        response.raise_for_status()

                        extension = Path(urlparse(image_url_value).path).suffix.lower()
                        valid_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'}
                        if extension not in valid_extensions:
                            extension = '.jpg'

                        filename = f"{slugify(category_obj.name)}{extension}"
                        category_obj.image.save(filename, ContentFile(response.content), save=False)
                        category_obj.save(update_fields=['image'])
                    except RequestException as e:
                        errors.append(f"{label_for_errors}: Image de catégorie non téléchargée ({str(e)})")

                for row_num, row in enumerate(reader, start=2):  # start=2 car ligne 1 = header
                    try:
                        cleaned_row = clean_dict(row)

                        # Récupérer les données
                        name = get_value(cleaned_row, ['noms', 'nom', 'name', 'produit', 'product', 'designation', 'désignation'])
                        category_name = get_value(cleaned_row, ['catégories', 'categories', 'catégorie', 'categorie', 'category'])
                        parent_name = get_value(cleaned_row, ['categorie parent', 'catégorie parent', 'parent', 'parent_category'])
                        sub_parent_name = get_value(cleaned_row, ['sous parent', 'sous_parent', 'subparent', 'sub_parent'])
                        parent_image_url = get_value(cleaned_row, [
                            'image parent', 'image catégorie parent', 'image categorie parent',
                            'parent image', 'parent_image', 'parent_image_url',
                            'image_parent', 'image_parent_url',
                            'parent url', 'parent_url',
                        ])
                        short_description = get_value(cleaned_row, ['description courte', 'short description', 'short_description', 'shot_description', 'résumé', 'resume'])
                        description = get_value(cleaned_row, ['description', 'desc', 'details', 'détails'])
                        price_str = get_value(cleaned_row, ['prix', 'price', 'montant', 'prx'])
                        compare_at_str = get_value(cleaned_row, ['compare_at_price', 'compare at price', 'ancien prix', 'prix barré', 'old_price'])
                        stock_str = get_value(cleaned_row, ['stock', 'quantite', 'quantité', 'qty', 'quantity'])
                        is_active_str = get_value(cleaned_row, ['is_active', 'active', 'actif', 'status', 'etat', 'état'])
                        image_url = get_value(cleaned_row, ['images', 'image', 'image_url', 'url', 'photo'])

                        # Validation des champs obligatoires
                        if not name:
                            errors.append(f"Ligne {row_num}: Le nom du produit est requis")
                            continue

                        # Gérer la catégorie
                        category = None
                        
                        # Parser le format "Parent>Enfant" si présent dans category_name
                        if category_name and '>' in category_name:
                            parts = [p.strip() for p in category_name.split('>') if p.strip()]
                            if len(parts) == 2:
                                # Format: "Ordinateur>Ecrans" -> parent="Ordinateur", category="Ecrans"
                                if not parent_name:
                                    parent_name = parts[0]
                                category_name = parts[1]
                            elif len(parts) == 3:
                                # Format: "Parent>Sous-parent>Enfant"
                                if not parent_name:
                                    parent_name = parts[0]
                                if not sub_parent_name:
                                    sub_parent_name = parts[1]
                                category_name = parts[2]
                        
                        if category_name or parent_name or sub_parent_name:
                            # Hiérarchie (facultatif) pour créer/associer une catégorie
                            parent_obj = None
                            if parent_name:
                                try:
                                    parent_obj, _ = Category.objects.get_or_create(
                                        name=parent_name,
                                        defaults={
                                            'slug': self._get_unique_slug(parent_name),
                                            'description': f'Catégorie parente importée automatiquement pour {parent_name}'
                                        }
                                    )
                                except Exception as e:
                                    # Si erreur unique (race condition), essayer de récupérer la catégorie existante
                                    try:
                                        parent_obj = Category.objects.get(name=parent_name)
                                    except Category.DoesNotExist:
                                        errors.append(f"Ligne {row_num}: Erreur lors de la création de la catégorie parent '{parent_name}': {str(e)}")
                                        continue
                                
                                # Optionnel: image de la catégorie parent via CSV (seulement si pas déjà définie)
                                if parent_image_url and not parent_obj.image:
                                    maybe_download_category_image(
                                        parent_obj,
                                        parent_image_url,
                                        label_for_errors=f"Ligne {row_num}"
                                    )

                            sub_parent_obj = None
                            if sub_parent_name:
                                try:
                                    sub_parent_obj, _ = Category.objects.get_or_create(
                                        name=sub_parent_name,
                                        defaults={
                                            'slug': self._get_unique_slug(sub_parent_name),
                                            'description': f'Sous-catégorie importée automatiquement pour {sub_parent_name}',
                                            'parent': parent_obj
                                        }
                                    )
                                except Exception as e:
                                    # Si erreur unique (race condition), essayer de récupérer la catégorie existante
                                    try:
                                        sub_parent_obj = Category.objects.get(name=sub_parent_name)
                                    except Category.DoesNotExist:
                                        errors.append(f"Ligne {row_num}: Erreur lors de la création de la sous-catégorie '{sub_parent_name}': {str(e)}")
                                        continue
                                
                                # Mettre à jour le parent si nécessaire
                                if parent_obj and sub_parent_obj.parent_id != parent_obj.id:
                                    sub_parent_obj.parent = parent_obj
                                    sub_parent_obj.save(update_fields=['parent'])

                            final_parent = sub_parent_obj or parent_obj

                            if category_name:
                                try:
                                    category, _ = Category.objects.get_or_create(
                                        name=category_name,
                                        defaults={
                                            'slug': self._get_unique_slug(category_name),
                                            'description': f'Catégorie importée automatiquement pour {category_name}',
                                            'parent': final_parent
                                        }
                                    )
                                except Exception as e:
                                    # Si erreur unique (race condition), essayer de récupérer la catégorie existante
                                    try:
                                        category = Category.objects.get(name=category_name)
                                    except Category.DoesNotExist:
                                        errors.append(f"Ligne {row_num}: Erreur lors de la création de la catégorie '{category_name}': {str(e)}")
                                        continue
                                
                                # Mettre à jour le parent si nécessaire
                                if final_parent and category.parent_id != final_parent.id:
                                    category.parent = final_parent
                                    category.save(update_fields=['parent'])

                        price = parse_decimal(price_str, default=Decimal('0.00'))
                        compare_at_price = parse_decimal(compare_at_str, default=None)
                        stock = parse_int(stock_str, default=0)
                        is_active = parse_bool(is_active_str, default=True)

                        # Créer ou mettre à jour (pas d'erreur si le produit existe déjà)
                        product, created = Product.objects.get_or_create(
                            name=name,
                            defaults={
                                'category': category,
                                'slug': slugify(name),
                                'description': description,
                                'shot_description': short_description,
                                'price': price,
                                'compare_at_price': compare_at_price,
                                'stock': stock,
                                'is_active': is_active,
                                'image_url': image_url if image_url else None,
                            }
                        )

                        if created:
                            created_count += 1
                        else:
                            update_fields = []
                            # Mettre à jour seulement si valeur fournie
                            if category is not None and product.category_id != getattr(category, 'id', None):
                                product.category = category
                                update_fields.append('category')
                            if description != '' and description != (product.description or ''):
                                product.description = description
                                update_fields.append('description')
                            if short_description != '' and short_description != (product.shot_description or ''):
                                product.shot_description = short_description
                                update_fields.append('shot_description')
                            if price is not None and product.price != price:
                                product.price = price
                                update_fields.append('price')
                            # compare_at_price peut être None -> on ne l'écrase que si la colonne est présente
                            if compare_at_str != '':
                                if product.compare_at_price != compare_at_price:
                                    product.compare_at_price = compare_at_price
                                    update_fields.append('compare_at_price')
                            if stock_str != '' and product.stock != stock:
                                product.stock = stock
                                update_fields.append('stock')
                            if is_active_str != '' and product.is_active != is_active:
                                product.is_active = is_active
                                update_fields.append('is_active')
                            if image_url != '' and (product.image_url or '') != image_url:
                                product.image_url = image_url
                                update_fields.append('image_url')

                            # Conserver un slug cohérent si absent
                            if not product.slug:
                                product.slug = slugify(name)
                                update_fields.append('slug')

                            if update_fields:
                                product.save(update_fields=update_fields)
                                updated_count += 1

                        # Optionnel: si image_url est une vraie URL, on peut télécharger l'image principale directement
                        if image_url and isinstance(image_url, str) and image_url.startswith(('http://', 'https://')):
                            try:
                                response = requests.get(image_url, timeout=10)
                                response.raise_for_status()

                                extension = Path(urlparse(image_url).path).suffix.lower()
                                valid_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'}
                                if extension not in valid_extensions:
                                    extension = '.jpg'

                                filename = f"{slugify(name)}{extension}"
                                product.image.save(filename, ContentFile(response.content), save=False)
                                product.save(update_fields=['image'])
                            except RequestException as e:
                                errors.append(f"Ligne {row_num}: Image non téléchargée ({str(e)})")

                    except Exception as e:
                        errors.append(f"Ligne {row_num}: Erreur - {str(e)}")
                        continue

                # Afficher les messages
                if created_count or updated_count:
                    parts = []
                    if created_count:
                        parts.append(f"{created_count} créé(s)")
                    if updated_count:
                        parts.append(f"{updated_count} mis à jour")
                    messages.success(request, f"Import terminé : {', '.join(parts)}.")

                if errors:
                    error_msg = f'{len(errors)} erreur(s) rencontrée(s):<ul>'
                    for error in errors[:10]:  # Limiter à 10 erreurs
                        error_msg += f'<li>{error}</li>'
                    if len(errors) > 10:
                        error_msg += f'<li>... et {len(errors) - 10} autre(s) erreur(s)</li>'
                    error_msg += '</ul>'
                    messages.error(request, format_html(error_msg))

                return redirect('admin:api_product_changelist')
        else:
            form = CsvImportForm()

        context = {
            'form': form,
            'opts': self.model._meta,
            'has_view_permission': self.has_view_permission(request),
        }
        return render(request, 'admin/import_csv.html', context)

    def import_images_view(self, request):
        """Vue pour uploader des images depuis l'ordinateur et les mapper aux produits"""
        if request.method == 'POST':
            form = ImageImportForm(request.POST, request.FILES)

            # Récupérer les fichiers depuis le formulaire validé ou directement depuis request.FILES
            if form.is_valid():
                uploaded_files = form.cleaned_data.get('images', [])
                # S'assurer que c'est une liste
                if not isinstance(uploaded_files, list):
                    uploaded_files = [uploaded_files] if uploaded_files else []
            else:
                # Si le formulaire n'est pas valide mais qu'il y a des fichiers, les récupérer directement
                uploaded_files = request.FILES.getlist('images') if 'images' in request.FILES else []

            if not uploaded_files:
                messages.error(request, "Aucune image sélectionnée. Veuillez sélectionner au moins une image.")
            else:

                # Créer un dictionnaire de mapping : nom_fichier_sans_extension -> fichier
                # Exemple: "FG40F" -> <fichier uploadé>
                files_map = {}
                for uploaded_file in uploaded_files:
                    # Extraire le nom sans extension pour le mapping
                    filename_without_ext = uploaded_file.name.rsplit('.', 1)[
                        0] if '.' in uploaded_file.name else uploaded_file.name
                    files_map[filename_without_ext] = uploaded_file

                # Récupérer les produits qui ont une valeur dans image_url (qui est en fait l'identifiant/nom de l'image)
                products = Product.objects.filter(image_url__isnull=False).exclude(image_url='')

                success_count = 0
                error_count = 0
                errors = []
                unmatched_images = []

                # Parcourir les produits et mapper les images
                for product in products:
                    if not product.image_url:
                        continue

                    # Extraire l'identifiant de l'image (peut être un nom de fichier ou une URL)
                    # Si c'est une URL, extraire le nom du fichier
                    image_identifier = product.image_url.strip()

                    # Si c'est une URL, extraire le nom du fichier
                    if image_identifier.startswith('http://') or image_identifier.startswith('https://'):
                        parsed_url = urlparse(image_identifier)
                        image_identifier = parsed_url.path.split('/')[-1]

                    # Enlever l'extension pour le matching
                    image_identifier_without_ext = image_identifier.rsplit('.', 1)[
                        0] if '.' in image_identifier else image_identifier

                    # Chercher le fichier correspondant (avec ou sans extension)
                    matched_file = None

                    # Essayer avec le nom exact (sans extension)
                    if image_identifier_without_ext in files_map:
                        matched_file = files_map[image_identifier_without_ext]
                    else:
                        # Essayer aussi avec le nom complet (au cas où il n'y a pas d'extension dans le CSV)
                        for filename_key, file_obj in files_map.items():
                            # Comparaison flexible : ignorer les différences de casse et espaces
                            if filename_key.lower().strip() == image_identifier_without_ext.lower().strip():
                                matched_file = file_obj
                                break
                            # Aussi essayer avec le nom du fichier uploadé complet
                            if file_obj.name.rsplit('.', 1)[
                                0].lower().strip() == image_identifier_without_ext.lower().strip():
                                matched_file = file_obj
                                break

                    if matched_file:
                        try:
                            # Générer un nom de fichier unique pour éviter les collisions
                            original_name = matched_file.name
                            name_part = slugify(product.name)
                            # Préserver l'extension originale
                            if '.' in original_name:
                                ext = original_name.rsplit('.', 1)[1].lower()
                                # Valider l'extension
                                valid_extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg']
                                if ext not in valid_extensions:
                                    ext = 'jpg'
                                filename = f'{name_part}_{product.id}.{ext}'
                            else:
                                filename = f'{name_part}_{product.id}.jpg'

                            # Sauvegarder l'image
                            product.image.save(
                                filename,
                                matched_file,
                                save=True
                            )
                            success_count += 1
                        except Exception as e:
                            errors.append(f"Produit '{product.name}': Erreur lors de l'enregistrement - {str(e)}")
                            error_count += 1
                    else:
                        # Image non trouvée pour ce produit
                        unmatched_images.append(f"Produit '{product.name}' (identifiant: {image_identifier})")
                        error_count += 1

                # Vérifier les images uploadées qui n'ont pas été utilisées
                used_files = set()
                for product in Product.objects.filter(image_url__isnull=False).exclude(image_url=''):
                    if product.image:
                        used_files.add(product.image.name.split('/')[-1])

                unused_images = []
                for uploaded_file in uploaded_files:
                    if uploaded_file.name not in used_files:
                        unused_images.append(uploaded_file.name)

                # Afficher les messages
                if success_count > 0:
                    messages.success(
                        request,
                        f'{success_count} image(s) uploadée(s) et associée(s) avec succès.'
                    )

                if unmatched_images:
                    error_msg = f'{len(unmatched_images)} produit(s) sans image correspondante:<ul>'
                    for unmatched in unmatched_images[:10]:
                        error_msg += f'<li>{unmatched}</li>'
                    if len(unmatched_images) > 10:
                        error_msg += f'<li>... et {len(unmatched_images) - 10} autre(s)</li>'
                    error_msg += '</ul>'
                    messages.warning(request, format_html(error_msg))

                if unused_images:
                    unused_msg = f'{len(unused_images)} image(s) uploadée(s) non utilisée(s):<ul>'
                    for unused in unused_images[:5]:
                        unused_msg += f'<li>{unused}</li>'
                    if len(unused_images) > 5:
                        unused_msg += f'<li>... et {len(unused_images) - 5} autre(s)</li>'
                    unused_msg += '</ul><p>Vérifiez que les noms des fichiers correspondent aux identifiants dans la colonne IMAGES de votre CSV.</p>'
                    messages.info(request, format_html(unused_msg))

                if errors:
                    error_msg = f'{len(errors)} erreur(s):<ul>'
                    for error in errors[:10]:
                        error_msg += f'<li>{error}</li>'
                    if len(errors) > 10:
                        error_msg += f'<li>... et {len(errors) - 10} autre(s)</li>'
                    error_msg += '</ul>'
                    messages.error(request, format_html(error_msg))

                return redirect('admin:api_product_changelist')
        else:
            form = ImageImportForm()

        # Compter les produits pour les statistiques
        products_with_urls = Product.objects.filter(image_url__isnull=False).exclude(image_url='')
        products_without_images = [p for p in products_with_urls if not p.image]

        # Lister les identifiants d'images attendus
        expected_image_ids = [p.image_url for p in products_without_images if p.image_url]

        context = {
            'form': form,
            'opts': self.model._meta,
            'has_view_permission': self.has_view_permission(request),
            'products_with_urls': len(products_with_urls),
            'products_without_images': len(products_without_images),
            'expected_image_ids': expected_image_ids[:20],  # Limiter à 20 pour l'affichage
        }
        return render(request, 'admin/import_images.html', context)

    def list_product_files_view(self, request):
        """Vue pour afficher toutes les images du dossier media/products/"""
        # Chemin du dossier products
        products_dir = settings.MEDIA_ROOT / 'products'

        # Créer le dossier s'il n'existe pas
        products_dir.mkdir(parents=True, exist_ok=True)

        # Lister tous les fichiers image
        image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'}
        files_data = []

        if products_dir.exists():
            for file_path in products_dir.iterdir():
                if file_path.is_file() and file_path.suffix.lower() in image_extensions:
                    # Obtenir les informations du fichier
                    stat = file_path.stat()

                    # Date de modification du fichier
                    modified_time = datetime.fromtimestamp(stat.st_mtime, tz=timezone.get_current_timezone())

                    # Taille du fichier
                    size_bytes = stat.st_size
                    size_mb = round(size_bytes / (1024 * 1024), 2)

                    # Nom du fichier
                    filename = file_path.name

                    # URL du fichier
                    relative_path = f'products/{filename}'
                    file_url = f"{settings.MEDIA_URL}{relative_path}"
                    # URL encodée pour l'affichage dans le navigateur
                    encoded_filename = quote(filename, safe='')
                    full_url = f"{settings.MEDIA_URL}products/{encoded_filename}"

                    files_data.append({
                        'name': filename,
                        'url': file_url,
                        'full_url': full_url,
                        'size_bytes': size_bytes,
                        'size_mb': size_mb,
                        'modified_date': modified_time,
                        'created_date': datetime.fromtimestamp(stat.st_ctime, tz=timezone.get_current_timezone()),
                    })

        # Trier par date de modification (plus récent en premier)
        files_data.sort(key=lambda x: x['modified_date'], reverse=True)

        # Pagination
        paginator = Paginator(files_data, 24)  # 24 images par page
        page_number = request.GET.get('page', 1)
        page_obj = paginator.get_page(page_number)

        context = {
            **self.admin_site.each_context(request),
            'title': 'Images importées - Produits',
            'opts': self.model._meta,
            'has_view_permission': self.has_view_permission(request, None),
            'files': page_obj,
            'total_files': len(files_data),
            'has_change_permission': self.has_change_permission(request, None),
            'has_delete_permission': self.has_delete_permission(request, None),
        }

        return render(request, 'admin/product_files_list.html', context)

    def delete_product_file_view(self, request):
        """Vue pour supprimer une image"""
        if not request.method == 'POST':
            messages.error(request, "Méthode non autorisée.")
            return redirect('admin:product_files_view')

        if not self.has_delete_permission(request, None):
            messages.error(request, "Vous n'avez pas la permission de supprimer des fichiers.")
            return redirect('admin:product_files_view')

        file_name = request.POST.get('file_name')
        if not file_name:
            messages.error(request, "Nom de fichier manquant.")
            return redirect('admin:product_files_view')

        # Sécuriser le nom du fichier (empêcher les paths relatifs)
        file_name = os.path.basename(file_name)

        # Chemin complet du fichier
        file_path = settings.MEDIA_ROOT / 'products' / file_name

        # Vérifier que le fichier existe et est dans le bon dossier
        if file_path.exists() and file_path.parent == settings.MEDIA_ROOT / 'products':
            try:
                # Vérifier si l'image est utilisée par un produit
                products_using_image = Product.objects.filter(
                    image__icontains=file_name
                )

                if products_using_image.exists():
                    # Supprimer la référence dans les produits
                    for product in products_using_image:
                        if product.image and file_name in product.image.name:
                            product.image.delete(save=False)
                            product.image = None
                            product.save()

                # Supprimer le fichier
                file_path.unlink()
                messages.success(request, f"L'image '{file_name}' a été supprimée avec succès.")
            except Exception as e:
                messages.error(request, f"Erreur lors de la suppression: {str(e)}")
        else:
            messages.error(request, "Fichier introuvable ou chemin invalide.")

        return redirect('admin:product_files_view')

    def changelist_view(self, request, extra_context=None):
        """Override pour gérer les erreurs InvalidOperation"""
        extra_context = extra_context or {}
        extra_context['show_import_button'] = True

        try:
            return super().changelist_view(request, extra_context=extra_context)
        except InvalidOperation as e:
            # Si une erreur InvalidOperation se produit, nettoyer les données et réessayer
            from django.db import transaction, connection

            try:
                with transaction.atomic():
                    # Utiliser SQL brut pour éviter de charger les objets avec des valeurs Decimal invalides
                    cursor = connection.cursor()
                    fixed_count = 0

                    # Utiliser SQL brut pour éviter de charger les objets avec des valeurs Decimal invalides
                    # Récupérer les IDs des produits sans charger les champs Decimal problématiques
                    try:
                        cursor.execute("SELECT id FROM api_product")
                        product_ids = [row[0] for row in cursor.fetchall()]

                        # Pour chaque produit, essayer de mettre à jour avec des valeurs par défaut
                        # On utilise ORM update qui évite de charger l'objet complet
                        for product_id in product_ids:
                            try:
                                # Utiliser ORM update qui devrait éviter de charger l'objet
                                Product.objects.filter(pk=product_id).update(
                                    price=Decimal('0.00')
                                )
                                # Mettre compare_at_price à NULL pour éviter les problèmes
                                Product.objects.filter(pk=product_id).update(
                                    compare_at_price=None
                                )
                                fixed_count += 1
                            except Exception:
                                # Si ORM échoue, essayer avec SQL brut
                                try:
                                    cursor.execute(
                                        "UPDATE api_product SET price = '0.00', compare_at_price = NULL WHERE id = ?",
                                        [product_id]
                                    )
                                    fixed_count += 1
                                except Exception:
                                    pass
                    except Exception:
                        # Si tout échoue, afficher un message mais ne pas bloquer
                        pass

                    if fixed_count > 0:
                        messages.info(
                            request,
                            f'{fixed_count} produit(s) avec des valeurs de prix invalides ont été corrigés automatiquement.'
                        )

                # Réessayer après le nettoyage
                return super().changelist_view(request, extra_context=extra_context)
            except Exception as cleanup_error:
                # Si le nettoyage échoue aussi, afficher un message d'erreur
                messages.error(
                    request,
                    f'Erreur lors du nettoyage des données : {str(cleanup_error)}. '
                    'Veuillez exécuter cette requête SQL manuellement pour corriger : '
                    'UPDATE api_product SET price = 0.00, compare_at_price = NULL;'
                )
                # Rediriger vers la liste des produits sans afficher la liste
                return redirect('admin:api_product_changelist')


# FIn Informations générales sur les produits
# FIN Informations générales sur les produits


# Produit carousel
# Produit carousel


# ==================== PRODUCT CAROUSEL ====================

@admin.register(ProductCarousel)
class ProductCarouselAdmin(admin.ModelAdmin):
    list_display = [
        'product',
        'product_price',
        'image_preview',
        'comment_1',
        'comment_2',
        'position',
        'is_active'
    ]

    list_filter = ['is_active']
    search_fields = ['product__name', 'comment_1', 'comment_2']
    list_editable = ['position', 'is_active']
    ordering = ['position']

    readonly_fields = ['image_preview', 'product_price']

    fieldsets = (
        ('Produit', {
            'fields': ('product', 'product_price')
        }),
        ('Contenu marketing', {
            'fields': ('comment_1', 'comment_2')
        }),
        ('Affichage', {
            'fields': ('position', 'is_active')
        }),
        ('Aperçu', {
            'fields': ('image_preview',)
        }),
    )

    # 💰 Prix du produit (lecture seule)
    def product_price(self, obj):
        return obj.product.price

    product_price.short_description = "Prix"

    # 🖼️ Image du produit (preview)
    def image_preview(self, obj):
        image_url = obj.image  # utilise la property du model
        if image_url:
            return format_html(
                '<img src="{}" style="height:50px;width:auto;border-radius:4px;" />',
                image_url
            )
        return "Aucune image"

    image_preview.short_description = "Image"


# Produit promotion
# Produit promotion


@admin.register(ProductPromotion)
class ProductPromotionAdmin(admin.ModelAdmin):
    list_display = (
        'product',
        'product_image',
        'original_price',
        'promo_price',
        'discount_percent_display',
        'label',
        'is_active',
        'is_featured',
        'start_date',
        'end_date',
    )

    list_filter = (
        'is_active',
        'is_featured',
        'start_date',
        'end_date',
    )

    search_fields = (
        'product__name',
        'label',
    )

    ordering = ('-created_at',)

    readonly_fields = (
        'original_price',
        'discount_percent_display',
        'created_at',
        'product_image_preview',
    )

    fieldsets = (
        ('Produit', {
            'fields': ('product', 'product_image_preview')
        }),
        ('Prix', {
            'fields': ('original_price', 'promo_price', 'discount_percent_display')
        }),
        ('Promotion', {
            'fields': ('label', 'is_active', 'is_featured')
        }),
        ('Période de validité', {
            'fields': ('start_date', 'end_date')
        }),
        ('Informations système', {
            'fields': ('created_at',)
        }),
    )

    class Media:
        js = ("admin/product_promo.js",)

    # 🔹 IMAGE DANS LA LISTE
    def product_image(self, obj):
        image = self._get_product_image(obj)
        if image:
            return format_html(
                '<img src="{}" style="height:50px;width:auto;border-radius:4px;" />',
                image
            )
        return "—"

    product_image.short_description = "Image"

    # 🔹 IMAGE DANS LE FORMULAIRE
    def product_image_preview(self, obj):
        image = self._get_product_image(obj)
        if image:
            return format_html(
                '<img src="{}" style="max-height:200px;border-radius:8px;" />',
                image
            )
        return "Aucune image"

    product_image_preview.short_description = "Aperçu du produit"

    # 🔹 PRIX ORIGINAL
    def original_price(self, obj):
        return obj.product.price

    original_price.short_description = "Prix original"

    # 🔹 RÉDUCTION
    def discount_percent_display(self, obj):
        return f"{obj.discount_percent} %"

    discount_percent_display.short_description = "Réduction"

    # 🔹 LOGIQUE IMAGE (réutilisable)
    def _get_product_image(self, obj):
        primary = obj.product.images.filter(is_primary=True).first()
        if primary:
            return primary.image.url

        first = obj.product.images.first()
        if first:
            return first.image.url

        # Utilise image_display_url qui gère image ET image_url
        return obj.product.image_display_url

    # 🔹 PRÉ-REMPLIR promo_price
    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)

        product_id = request.GET.get('product')
        if product_id:
            try:
                product = Product.objects.get(pk=product_id)
                initial['promo_price'] = product.price
            except Product.DoesNotExist:
                pass

        return initial

    # 🔹 SÉCURITÉ À L'ENREGISTREMENT
    def save_model(self, request, obj, form, change):
        if not obj.promo_price:
            obj.promo_price = obj.product.price
        super().save_model(request, obj, form, change)

    # 🔹 ENDPOINT INTERNE POUR OBTENIR LE PRIX PRODUIT (AJAX)
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "product-price/<int:pk>/",
                self.admin_site.admin_view(self.product_price_view),
                name="product-price",
            ),
        ]
        return custom_urls + urls

    def product_price_view(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            return JsonResponse({"price": float(product.price)})
        except Product.DoesNotExist:
            return JsonResponse({"price": None}, status=404)



# produit flash
# produit flash


from django.contrib import admin
from django import forms
from django.core.exceptions import ValidationError
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import reverse
from django.contrib import messages
from django.template.response import TemplateResponse
from django.utils.html import format_html
from .models import ProductFlash, FlashProductItem, Product

class FlashProductItemInline(admin.StackedInline):
    model = FlashProductItem
    extra = 0  # Pas d'ajout supplémentaire par défaut
    max_num = 1  # Maximum un seul produit principal
    can_delete = True
    autocomplete_fields = ['product']
    fields = ('product', 'is_main', 'compare_at_price', 'start_date', 'end_date', 'countdown_display')
    readonly_fields = ('is_main', 'countdown_display')  # is_main en readonly puisqu'il n'y a qu'un seul produit principal
    ordering = ('id',)
    verbose_name = "Produit principal"
    verbose_name_plural = "Produit principal"
    
    def get_formset(self, request, obj=None, **kwargs):
        """Personnalise le formset pour forcer is_main=True"""
        formset = super().get_formset(request, obj, **kwargs)
        
        # Sauvegarder la méthode save originale
        original_save = formset.save
        
        def save_with_forced_main(self, commit=True):
            """Force is_main=True lors de la sauvegarde"""
            instances = original_save(self, commit=False)
            for instance in instances:
                instance.is_main = True
            if commit:
                self.save_m2m()
                for instance in instances:
                    instance.save()
            return instances
        
        formset.save = save_with_forced_main
        
        # Forcer is_main=True dans les formulaires
        original_init = formset.__init__
        
        def new_init(self, *args, **kwargs):
            original_init(self, *args, **kwargs)
            # Forcer is_main=True pour tous les formulaires
            for form in self.forms:
                if 'is_main' in form.fields:
                    form.fields['is_main'].initial = True
                    form.fields['is_main'].widget.attrs['readonly'] = True
        
        formset.__init__ = new_init
        return formset

    def clean(self):
        super().clean()
        main_product = None

        for form in self.forms:
            if not hasattr(form, "cleaned_data"):
                continue
            if form.cleaned_data.get("DELETE", False):
                continue

            product = form.cleaned_data.get("product")
            # Forcer is_main=True puisqu'il n'y a qu'un seul produit principal
            form.cleaned_data['is_main'] = True
            
            if product:
                main_product = product

        # Vérifier que le produit principal n'est pas dans les produits secondaires
        if main_product:
            # Utiliser parent_instance si disponible (pour les inlines)
            parent = getattr(self, 'parent_instance', None) or getattr(self, 'instance', None)
            if parent and parent.pk:
                if main_product in parent.secondary_products.all():
                    raise ValidationError(
                        f"Le produit principal '{main_product.name}' ne peut pas être "
                        "dans la liste des produits secondaires. Il sera automatiquement retiré."
                    )

    def countdown_display(self, obj):
        start, end = obj.countdown
        if start and end:
            return f"{start} → {end}"
        return "-"
    countdown_display.short_description = "Compte à rebours"


class ProductFlashAdminForm(forms.ModelForm):
    """Formulaire personnalisé pour valider ProductFlash"""
    
    class Meta:
        model = ProductFlash
        fields = '__all__'
    
    def clean(self):
        cleaned_data = super().clean()
        secondary_products = cleaned_data.get('secondary_products')
        
        # Limiter à 8 produits secondaires maximum
        if secondary_products and secondary_products.count() > 8:
            raise ValidationError({
                'secondary_products': ValidationError(
                    "Vous ne pouvez sélectionner que 8 produits secondaires maximum."
                )
            })
        
        # Vérifier si un produit principal existe
        if self.instance and self.instance.pk:
            main_item = self.instance.main_item
            if main_item and main_item.product:
                main_product = main_item.product
                # Vérifier dans les données du formulaire
                if secondary_products and main_product in secondary_products:
                    raise ValidationError({
                        'secondary_products': ValidationError(
                            f"Le produit principal '{main_product.name}' ne peut pas être "
                            "dans la liste des produits secondaires."
                        )
                    })
        
        return cleaned_data


@admin.register(ProductFlash)
class ProductFlashAdmin(admin.ModelAdmin):
    form = ProductFlashAdminForm
    list_display = ("title", "promo_price", "is_active", "created_at", "updated_at", "secondary_countdown")
    list_filter = ("is_active", "created_at")
    search_fields = ("title",)
    ordering = ("-created_at",)
    inlines = [FlashProductItemInline]
    change_form_template = "admin/api/productflash/change_form.html"

    # Multi-sélection pour les produits secondaires
    filter_horizontal = ('secondary_products',)
    
    # Tous les champs sur une seule ligne
    fields = (
        'title',
        'main_product_display',
        'main_start_date_display',
        'main_end_date_display',
        'secondary_start_date',
        'secondary_end_date',
        'secondary_products',
        'is_active'
    )
    
    readonly_fields = (
        'main_product_display', 
        'main_start_date_display', 
        'main_end_date_display'
    )
    
    def main_product_display(self, obj):
        """Affiche le nom du produit principal"""
        if obj.pk:
            main_item = obj.main_item
            if main_item and main_item.product:
                return main_item.product.name
        return "Aucun produit principal défini"
    main_product_display.short_description = "Produit principal"
    
    def main_start_date_display(self, obj):
        """Affiche la date de début du produit principal"""
        if obj.pk:
            main_item = obj.main_item
            if main_item and main_item.start_date:
                return main_item.start_date.strftime("%d/%m/%Y %H:%M")
        return "Non définie"
    main_start_date_display.short_description = "Date de début (produit principal)"
    
    def main_end_date_display(self, obj):
        """Affiche la date de fin du produit principal"""
        if obj.pk:
            main_item = obj.main_item
            if main_item and main_item.end_date:
                return main_item.end_date.strftime("%d/%m/%Y %H:%M")
        return "Non définie"
    main_end_date_display.short_description = "Date de fin (produit principal)"

    def promo_price(self, obj):
        """Affiche le prix promotionnel du produit principal"""
        if obj.pk:
            main_item = obj.main_item
            if main_item:
                # Si promo_price existe sur FlashProductItem, l'utiliser
                if hasattr(main_item, 'promo_price') and main_item.promo_price:
                    return f"{main_item.promo_price:,} CFA".replace(',', ' ')
                # Sinon, utiliser le prix du produit
                if main_item.product and main_item.product.price:
                    return f"{main_item.product.price:,} CFA".replace(',', ' ')
        return "—"
    promo_price.short_description = "Prix promo"

    def has_add_permission(self, request):
        """Empêche l'ajout d'un nouvel enregistrement s'il en existe déjà un"""
        # Vérifier s'il existe déjà un enregistrement
        if ProductFlash.objects.exists():
            return False
        return super().has_add_permission(request)
    
    def changelist_view(self, request, extra_context=None):
        """Redirige vers l'enregistrement unique s'il existe"""
        # Si un seul enregistrement existe, rediriger vers sa page d'édition
        count = ProductFlash.objects.count()
        if count == 1:
            obj = ProductFlash.objects.first()
            return HttpResponseRedirect(
                reverse('admin:api_productflash_change', args=[obj.pk])
            )
        elif count > 1:
            # Si plusieurs enregistrements existent (ne devrait pas arriver), 
            # on peut afficher un message ou rediriger vers le premier
            messages.warning(
                request,
                "Plusieurs enregistrements existent. Seul le premier sera utilisé."
            )
            obj = ProductFlash.objects.first()
            return HttpResponseRedirect(
                reverse('admin:api_productflash_change', args=[obj.pk])
            )
        return super().changelist_view(request, extra_context)
    
    def add_view(self, request, form_url='', extra_context=None):
        """Redirige vers l'enregistrement existant si on essaie d'en créer un nouveau"""
        if ProductFlash.objects.exists():
            obj = ProductFlash.objects.first()
            messages.warning(
                request,
                "Un enregistrement existe déjà. Vous êtes redirigé vers celui-ci."
            )
            return HttpResponseRedirect(
                reverse('admin:api_productflash_change', args=[obj.pk])
            )
        return super().add_view(request, form_url, extra_context)

    def save_model(self, request, obj, form, change):
        """Sauvegarde le modèle et retire automatiquement le produit principal des produits secondaires"""
        # Sauvegarder d'abord pour avoir accès aux relations
        super().save_model(request, obj, form, change)
        
        # Retirer automatiquement le produit principal des produits secondaires
        main_item = obj.main_item
        if main_item and main_item.product:
            main_product = main_item.product
            if main_product in obj.secondary_products.all():
                obj.secondary_products.remove(main_product)
                # Sauvegarder à nouveau pour persister le changement
                super().save_model(request, obj, form, change)
    
    def save_related(self, request, form, formsets, change):
        """Sauvegarde les relations et retire le produit principal des produits secondaires"""
        super().save_related(request, form, formsets, change)
        
        # Après avoir sauvegardé les inlines, vérifier à nouveau
        obj = form.instance
        main_item = obj.main_item
        if main_item and main_item.product:
            main_product = main_item.product
            if main_product in obj.secondary_products.all():
                obj.secondary_products.remove(main_product)
    
    def change_view(self, request, object_id, form_url='', extra_context=None):
        """Affiche les informations dans un tableau après l'enregistrement"""
        extra_context = extra_context or {}
        
        # Récupérer l'objet
        obj = self.get_object(request, object_id)
        if obj:
            # Préparer les données pour l'affichage en tableau
            main_item = obj.main_item
            main_product_name = "Aucun produit principal défini"
            main_start_date = "Non définie"
            main_end_date = "Non définie"
            
            if main_item and main_item.product:
                main_product_name = main_item.product.name
                if main_item.start_date:
                    main_start_date = main_item.start_date.strftime("%d/%m/%Y %H:%M")
                if main_item.end_date:
                    main_end_date = main_item.end_date.strftime("%d/%m/%Y %H:%M")
            
            secondary_start_date = "Non définie"
            secondary_end_date = "Non définie"
            if obj.secondary_start_date:
                secondary_start_date = obj.secondary_start_date.strftime("%d/%m/%Y %H:%M")
            if obj.secondary_end_date:
                secondary_end_date = obj.secondary_end_date.strftime("%d/%m/%Y %H:%M")
            
            secondary_products_list = list(obj.secondary_products.all())
            secondary_products_names = ", ".join([p.name for p in secondary_products_list]) if secondary_products_list else "Aucun produit secondaire"
            
            # Toujours afficher le tableau
            extra_context['show_table'] = True
            extra_context['table_data'] = {
                'title': obj.title or "Non défini",
                'main_product': main_product_name,
                'main_start_date': main_start_date,
                'main_end_date': main_end_date,
                'secondary_start_date': secondary_start_date,
                'secondary_end_date': secondary_end_date,
                'secondary_products': secondary_products_names,
                'is_active': "✓ Actif" if obj.is_active else "✗ Inactif",
            }
        
        return super().change_view(request, object_id, form_url, extra_context)


# Commentaires
# Commentaires

@admin.register(Commentaire)
class CommentaireAdmin(admin.ModelAdmin):
    list_display = [
        'nom', 'commentaire', 'email', 'product', 'note',
    ]
    list_filter = ['is_approved', 'is_flagged', 'note', 'created_at', 'product']
    search_fields = ['nom', 'email', 'commentaire', 'product__name']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 20
    
    fieldsets = (
        ('Informations du commentaire', {
            'fields': ('product', 'nom', 'email', 'commentaire', 'note', 'save_email')
        }),
        ('Modération', {
            'fields': ('is_approved', 'is_flagged')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    actions = ['approve_commentaires', 'reject_commentaires', 'flag_commentaires']
    
    def approve_commentaires(self, request, queryset):
        """Approuver les commentaires sélectionnés"""
        updated = queryset.update(is_approved=True, is_flagged=False)
        self.message_user(request, f'{updated} commentaire(s) approuvé(s).')
    approve_commentaires.short_description = "Approuver les commentaires sélectionnés"
    
    def reject_commentaires(self, request, queryset):
        """Rejeter les commentaires sélectionnés"""
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'{updated} commentaire(s) rejeté(s).')
    reject_commentaires.short_description = "Rejeter les commentaires sélectionnés"
    
    def     flag_commentaires(self, request, queryset):
        """Signaler les commentaires sélectionnés"""
        updated = queryset.update(is_flagged=True, is_approved=False)
        self.message_user(request, f'{updated} commentaire(s) signalé(s).')
    flag_commentaires.short_description = "Signaler les commentaires sélectionnés"


# Commandes & PayPal
# Commandes & PayPal

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("name", "price", "quantity")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "first_name", "last_name", "total_cfa", "status", "payment_method", "created_at")
    list_filter = ("status", "payment_method", "created_at")
    search_fields = ("email", "first_name", "last_name", "paypal_order_id", "address", "city", "country", "phone")
    readonly_fields = ("created_at", "updated_at", "paypal_order_id")
    inlines = [OrderItemInline]
    ordering = ("-created_at",)
    fieldsets = (
        ("Adresse de facturation", {
            "fields": ("first_name", "last_name", "email", "address", "city", "country", "zip_code", "phone"),
            "description": "Coordonnées du client (identiques au formulaire Checkout).",
        }),
        ("Commande", {
            "fields": ("total_cfa", "status", "payment_method", "paypal_order_id"),
        }),
        ("Dates", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )


@admin.register(PendingPayPalOrder)
class PendingPayPalOrderAdmin(admin.ModelAdmin):
    list_display = ("paypal_order_id", "total_cfa", "currency", "status", "created_at")
    list_filter = ("status", "currency")
    search_fields = ("paypal_order_id",)
    readonly_fields = ("paypal_order_id", "cart_snapshot", "billing_snapshot", "total_cfa", "amount_value", "currency", "created_at")
    ordering = ("-created_at",)
    fieldsets = (
        ("Commande PayPal", {
            "fields": ("paypal_order_id", "status", "total_cfa", "amount_value", "currency"),
        }),
        ("Adresse de facturation (snapshot)", {
            "fields": ("billing_snapshot",),
            "description": "Données envoyées depuis le formulaire Checkout (prénom, nom, email, adresse, ville, pays, code postal, téléphone).",
        }),
        ("Panier (snapshot)", {
            "fields": ("cart_snapshot",),
        }),
        ("Dates", {
            "fields": ("created_at",),
        }),
    )