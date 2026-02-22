# Instructions pour voir les changements

## Problème
Les modifications ne sont pas visibles car les serveurs doivent être redémarrés.

## Solution

### 1. Redémarrer le serveur Django (Backend)

1. Arrêtez le serveur Django s'il est en cours d'exécution (Ctrl+C)
2. Redémarrez-le :
```bash
cd BACKEND\src
python manage.py runserver
```

### 2. Redémarrer le serveur Next.js (Frontend)

1. Arrêtez le serveur Next.js s'il est en cours d'exécution (Ctrl+C)
2. Redémarrez-le :
```bash
cd frontend\commerce
npm run dev
```

### 3. Vider le cache du navigateur

- Appuyez sur `Ctrl + Shift + R` (Windows/Linux) ou `Cmd + Shift + R` (Mac) pour forcer le rechargement
- Ou ouvrez les outils de développement (F12) et faites un clic droit sur le bouton de rechargement → "Vider le cache et effectuer une actualisation forcée"

### 4. Vérifier dans l'admin Django

1. Allez sur http://localhost:8000/admin (ou votre URL d'admin)
2. Connectez-vous
3. Allez dans "Paramètres de page"
4. Vous devriez voir le champ "Ma Selection title" dans la section "Section Ma Selection"

### 5. Vérifier l'API

Testez l'API directement :
```
http://localhost:9000/api/simple-products/?limit=4
```

Vous devriez voir une réponse avec :
- `title`: "Ma Selection" (ou la valeur que vous avez définie)
- `results`: tableau de produits avec `id`, `name`, `image`, `shot_description`, `price`

### 6. Vérifier le frontend

1. Allez sur votre page d'accueil
2. La section "Ma Selection" devrait apparaître après "CategoryShop"
3. Elle devrait avoir :
   - Un fond rouge avec des points
   - Le titre "Ma Selection" en blanc
   - 4 cartes de produits avec le logo "bon" rouge

## Si ça ne fonctionne toujours pas

1. Vérifiez la console du navigateur (F12) pour les erreurs
2. Vérifiez les logs du serveur Django pour les erreurs
3. Vérifiez les logs du serveur Next.js pour les erreurs
4. Assurez-vous que `NEXT_PUBLIC_API_URL` est correctement configuré dans votre fichier `.env.local`
