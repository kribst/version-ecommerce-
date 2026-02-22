"""
Service de suppression d'arrière-plan des images du carousel.
Utilise rembg pour retirer le fond sans modifier l'image originale.
Les images traitées sont mises en cache dans media/carousel_nobg/.
Configuration production : CAROUSEL_REMOVE_BACKGROUND=true (défaut).
"""
import hashlib
import io
import logging
from pathlib import Path

from django.conf import settings

logger = logging.getLogger(__name__)


def get_carousel_image_no_background(image_field):
    """
    Retourne l'URL de l'image sans arrière-plan pour le carousel.
    L'image originale n'est jamais modifiée.
    
    :param image_field: Django ImageField (ex: product.image, ProductImage.image)
    :return: URL relative (ex: /media/carousel_nobg/xxx.png) ou None si échec
    """
    if not image_field:
        return None

    # Option de désactivation (ex: CAROUSEL_REMOVE_BACKGROUND=False dans settings)
    if not getattr(settings, 'CAROUSEL_REMOVE_BACKGROUND', True):
        return image_field.url
    
    try:
        source_path = Path(image_field.path)
    except (ValueError, OSError):
        # image_url ou chemin invalide
        return image_field.url if hasattr(image_field, 'url') else None
    
    if not source_path.exists():
        return image_field.url
    
    # Dossier de cache pour les images sans fond
    cache_dir = Path(settings.MEDIA_ROOT) / 'carousel_nobg'
    cache_dir.mkdir(parents=True, exist_ok=True)
    
    # Clé de cache : hash du chemin + mtime pour détecter les changements
    mtime = source_path.stat().st_mtime
    cache_key = hashlib.sha256(f"{source_path}{mtime}".encode()).hexdigest()[:16]
    output_filename = f"{cache_key}.png"
    output_path = cache_dir / output_filename
    
    # Si déjà traité, retourner l'URL
    if output_path.exists():
        return f"{settings.MEDIA_URL}carousel_nobg/{output_filename}"
    
    # Traiter et sauvegarder
    try:
        _remove_background_and_save(source_path, output_path)
        return f"{settings.MEDIA_URL}carousel_nobg/{output_filename}"
    except Exception as e:
        logger.warning(
            "Suppression de fond échouée pour %s: %s. Utilisation de l'image originale.",
            source_path,
            e,
        )
        return image_field.url


def _remove_background_and_save(input_path, output_path):
    """
# Import io pour BytesIO
import io
    Supprime l'arrière-plan de l'image source et sauvegarde en PNG.
    """
    from rembg import remove
    from PIL import Image
    
    with open(input_path, 'rb') as f:
        input_data = f.read()
    
    output_data = remove(input_data)
    
    # Sauvegarder en PNG pour la transparence
    img = Image.open(io.BytesIO(output_data))
    img.save(output_path, 'PNG')


