"""
Commande de pre-warm du cache des images carousel sans arrière-plan.
À exécuter après le déploiement en production pour éviter les premiers appels lents.

Usage:
  python manage.py prewarm_carousel_nobg
"""
from django.core.management.base import BaseCommand
from django.conf import settings

from api.models import ProductCarousel
from api.services.background_removal import get_carousel_image_no_background


class Command(BaseCommand):
    help = "Pré-traite les images des produits carousel (suppression du fond) pour le cache"

    def add_arguments(self, parser):
        parser.add_argument(
            "--active-only",
            action="store_true",
            default=True,
            help="Ne traiter que les produits carousel actifs (défaut: True)",
        )

    def handle(self, *args, **options):
        if not getattr(settings, "CAROUSEL_REMOVE_BACKGROUND", True):
            self.stdout.write(
                self.style.WARNING(
                    "CAROUSEL_REMOVE_BACKGROUND est désactivé. Rien à faire."
                )
            )
            return

        queryset = ProductCarousel.objects.select_related("product")
        if options.get("active_only", True):
            queryset = queryset.filter(is_active=True)

        total = queryset.count()
        if total == 0:
            self.stdout.write("Aucun produit carousel à traiter.")
            return

        self.stdout.write(f"Pré-traitement de {total} produit(s) carousel...")

        ok = 0
        skipped = 0
        errors = 0

        for carousel in queryset:
            image_field = None
            primary = carousel.product.images.filter(is_primary=True).first()
            if primary and primary.image:
                image_field = primary.image
            else:
                first = carousel.product.images.first()
                if first and first.image:
                    image_field = first.image
            if not image_field and carousel.product.image:
                image_field = carousel.product.image

            if not image_field:
                skipped += 1
                continue

            try:
                url = get_carousel_image_no_background(image_field)
                if url and "carousel_nobg" in str(url):
                    ok += 1
                    self.stdout.write(f"  OK: {carousel.product.name}")
                else:
                    skipped += 1
            except Exception as e:
                errors += 1
                self.stdout.write(
                    self.style.ERROR(f"  Erreur {carousel.product.name}: {e}")
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Terminé: {ok} traité(s), {skipped} ignoré(s), {errors} erreur(s)"
            )
        )
