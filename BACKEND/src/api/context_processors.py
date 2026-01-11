from .models import SiteSettings


def site_settings(request):
    """
    Context processor qui ajoute les paramètres du site à tous les templates
    """
    try:
        settings = SiteSettings.load()
        return {
            'site_settings': settings
        }
    except:
        return {
            'site_settings': None
        }
