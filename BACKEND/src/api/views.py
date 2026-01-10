from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import SiteSettings
from .serializers import SiteSettingsSerializer

# Create your views here.


# Informations générales sur l'entreprise
# Informations générales sur l'entreprise


class SiteSettingsViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        settings = SiteSettings.load()
        if not settings:
            return Response(
                {"detail": "Aucune configuration trouvée."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SiteSettingsSerializer(settings)
        return Response(serializer.data)

# Fin Informations générales sur l'entreprise
# Fin Informations générales sur l'entreprise
# Fin Informations générales sur l'entreprise