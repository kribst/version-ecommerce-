# Guide d'utilisation de Ma Selection

## Vue d'ensemble

La section "Ma Selection" est maintenant une rubrique indépendante dans l'interface admin Django. Elle permet à l'administrateur de sélectionner manuellement les produits à afficher dans cette section.

## Configuration dans l'admin Django

### 1. Accéder à Ma Selection

1. Connectez-vous à l'interface admin Django (`http://localhost:8000/admin`)
2. Dans le menu de gauche, vous verrez une nouvelle rubrique **"Ma Selection"**
3. Cliquez sur "Ma Selection"

### 2. Créer/Modifier Ma Selection

**Note importante** : Il ne peut y avoir qu'une seule instance de Ma Selection (singleton).

#### Si aucune instance n'existe :
1. Cliquez sur "Ajouter Ma Selection"
2. Remplissez les champs :
   - **Titre** : Le titre de la section (ex: "Ma Selection", "Nos Favoris", etc.)
   - **Activer** : Cochez cette case pour afficher la section sur le site
   - **Produits** : Sélectionnez les produits à afficher (vous pouvez en sélectionner plusieurs)

#### Si une instance existe déjà :
1. Cliquez sur "Ma Selection" dans la liste
2. Modifiez les champs selon vos besoins
3. Pour ajouter/retirer des produits :
   - Utilisez l'interface de sélection avec deux colonnes
   - Les produits disponibles sont à gauche
   - Les produits sélectionnés sont à droite
   - Utilisez les flèches pour déplacer les produits entre les deux colonnes

### 3. Activer/Désactiver la section

- **Activer** : Cochez la case "Activer" pour afficher la section sur le site
- **Désactiver** : Décochez la case "Activer" pour masquer la section (elle ne sera pas affichée même si des produits sont sélectionnés)

## Fonctionnalités

### Sélection manuelle des produits
- Vous pouvez sélectionner n'importe quels produits de votre catalogue
- L'ordre de sélection sera préservé dans l'affichage
- Seuls les produits actifs seront affichés sur le site (même si vous sélectionnez un produit inactif, il ne sera pas affiché)

### Titre personnalisable
- Le titre peut être modifié à tout moment
- Il apparaîtra en haut de la section sur le site

### Affichage conditionnel
- La section ne s'affiche que si :
  1. Une instance de Ma Selection existe
  2. La case "Activer" est cochée
  3. Au moins un produit actif est sélectionné

## API

L'API est accessible à l'adresse :
```
GET /api/ma-selection/
```

Réponse si active :
```json
{
  "title": "Ma Selection",
  "is_active": true,
  "count": 4,
  "results": [
    {
      "id": 1,
      "name": "Nom du produit",
      "image": "/media/products/image.jpg",
      "shot_description": "Description courte",
      "price": 50000
    },
    ...
  ]
}
```

Réponse si inactive ou inexistante :
```json
{
  "title": "Ma Selection",
  "is_active": false,
  "products": []
}
```

## Migration

Pour appliquer les changements à la base de données :

```bash
cd BACKEND\src
python manage.py migrate
```

## Redémarrage des serveurs

Après les modifications, redémarrez les serveurs :

1. **Serveur Django** :
```bash
cd BACKEND\src
python manage.py runserver
```

2. **Serveur Next.js** :
```bash
cd frontend\commerce
npm run dev
```

## Notes importantes

- Le champ `ma_selection_title` a été retiré de "Paramètres de page"
- Ma Selection est maintenant une rubrique complètement indépendante
- Vous pouvez créer une seule instance de Ma Selection (singleton)
- La suppression de l'instance est désactivée pour éviter les erreurs
