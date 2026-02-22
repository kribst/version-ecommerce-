# Déploiement en production

## Carousel – suppression d'arrière-plan automatique

La suppression du fond des images du carousel est **activée par défaut**.

### Variables d'environnement

| Variable | Valeur | Description |
|----------|--------|-------------|
| `CAROUSEL_REMOVE_BACKGROUND` | `true` (défaut) | Activer la suppression du fond des images carousel |
| | `false` | Désactiver (retour aux images originales) |

Exemple dans `.env` :

```
CAROUSEL_REMOVE_BACKGROUND=true
```

### Pre-warm du cache (recommandé au déploiement)

Pour éviter des temps de réponse lents au premier accès des utilisateurs, pré-traiter les images après le déploiement :

```bash
python manage.py prewarm_carousel_nobg
```

Cette commande traite toutes les images des produits actifs du carousel et les enregistre dans `media/carousel_nobg/`.

### Exigences

- `rembg` et `Pillow` dans `requirements.txt`
- Environ 2–5 s de traitement par image au premier passage (puis mis en cache)
- Le modèle rembg (~176 Mo) est téléchargé automatiquement au premier usage
