# API Aideo - Documentation

Cette documentation décrit toutes les routes disponibles dans l'API Aideo.

---

## Authentification

Toutes les routes (sauf `/api/creer_compte` et `/api/login`) nécessitent un token JWT dans le header :

```
Authorization: Bearer <token>
```

---

## Gestion des Comptes

### Créer un compte

**POST** `/api/creer_compte`

Permet de créer un compte aidant ou professionnel.

**Données à envoyer :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `type` | string | Oui | "aidant" ou "professionnel" |
| `email` | string | Oui | Adresse email |
| `nom` | string | Oui | Nom de famille (aidant) ou nom de l'entreprise (pro) |
| `password` | string | Oui | Mot de passe |
| `prenom` | string | Oui (aidant) | Prénom de l'aidant |
| `telephone` | string | Oui (aidant) / Optionnel (pro) | Numéro de téléphone |
| `adresse` | string | Oui (aidant) | Adresse postale |
| `nomContact` | string | Oui (pro) | Nom du contact dans l'entreprise |
| `adresses` | array[string] | Oui (pro) | Liste des adresses de l'entreprise |

**Réponse succès (aidant) :** `200`
```json
{
  "status": "Compte créé avec succès"
}
```

**Réponse succès (professionnel) :** `201`
```json
{
  "status": "Compte pro créé avec succès"
}
```

**Réponse erreur :** `400`
```json
{
  "error": "Données incomplètes"
}
```

**Exemple (Aidant) :**
```json
{
  "type": "aidant",
  "email": "jean.dupont@email.com",
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "0612345678",
  "adresse": "12 rue de Paris, 75001 Paris",
  "password": "motdepasse123"
}
```

**Exemple (Professionnel) :**
```json
{
  "type": "professionnel",
  "email": "contact@entreprise.fr",
  "nom": "Entreprise ABC",
  "nomContact": "Martin Paul",
  "telephone": "0123456789",
  "password": "motdepasse123",
  "adresses": ["10 avenue des Champs, 75008 Paris", "5 rue du Commerce, 69001 Lyon"]
}
```

---

### Supprimer un compte

**POST** `/api/supprimer_compte`

Supprime le compte de l'utilisateur connecté après vérification du mot de passe.

**Headers :** `Authorization: Bearer <token>`

**Données à envoyer :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `password` | string | Oui | Mot de passe actuel pour confirmation |

**Réponse succès :** `200`
```json
{
  "status": "Compte supprimé avec succès"
}
```

**Réponses erreur :**
- `400` : `{"error": "Données incomplètes"}`
- `401` : `{"error": "Utilisateur non identifié (Token manquant ou invalide)"}`
- `403` : `{"error": "Mot de passe incorrect"}`

**Exemple :**
```json
{
  "password": "motdepasse123"
}
```

---

### Modifier le mot de passe

**POST** `/api/password_modif`

Modifie le mot de passe de l'utilisateur connecté.

**Headers :** `Authorization: Bearer <token>`

**Données à envoyer :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `old_password` | string | Oui | Mot de passe actuel |
| `new_password` | string | Oui | Nouveau mot de passe |

**Réponse succès :** `200`
```json
{
  "status": "Mot de passe modifié avec succès"
}
```

**Réponses erreur :**
- `400` : `{"error": "Données incomplètes"}`
- `401` : `{"error": "Utilisateur non identifié (Token manquant ou invalide)"}`
- `403` : `{"error": "Mot de passe actuel incorrect"}`

**Exemple :**
```json
{
  "old_password": "ancienMotDePasse",
  "new_password": "nouveauMotDePasse"
}
```

---

## Profil

### Récupérer son profil

**GET** `/api/profile`

Retourne les informations du profil de l'utilisateur connecté.

**Headers :** `Authorization: Bearer <token>`

**Données à envoyer :** Aucune

**Réponse succès (Aidant) :** `200`

| Champ | Type | Toujours présent | Description |
|-------|------|------------------|-------------|
| `email` | string | Oui | Adresse email |
| `nom` | string | Oui | Nom de famille |
| `telephone` | string | Oui | Numéro de téléphone |
| `type` | string | Oui | Type de compte ("aidant", "professionnel", "admin") |
| `prenom` | string | Oui | Prénom |
| `points` | int | Oui | Points accumulés |
| `pseudo` | string | Optionnel | Pseudo de l'aidant |
| `adresse` | string | Oui | Adresse postale |

```json
{
  "email": "jean.dupont@email.com",
  "nom": "Dupont",
  "telephone": "0612345678",
  "type": "aidant",
  "prenom": "Jean",
  "points": 150,
  "pseudo": "jdupont",
  "adresse": "12 rue de Paris"
}
```

**Réponse succès (Professionnel) :** `200`

| Champ | Type | Toujours présent | Description |
|-------|------|------------------|-------------|
| `email` | string | Oui | Adresse email |
| `nom` | string | Oui | Nom de l'entreprise |
| `telephone` | string | Optionnel | Numéro de téléphone |
| `type` | string | Oui | Type de compte ("professionnel") |
| `nomContact` | string | Oui | Nom du contact |
| `descriptionEntr` | string | Optionnel | Description de l'entreprise |
| `adresses` | array | Oui | Liste des adresses |

```json
{
  "email": "contact@entreprise.fr",
  "nom": "Entreprise ABC",
  "telephone": "0123456789",
  "type": "professionnel",
  "nomContact": "Martin Paul",
  "descriptionEntr": "Description de l'entreprise",
  "adresses": [
    {"id": 1, "adresse": "10 avenue des Champs, 75008 Paris"},
    {"id": 2, "adresse": "5 rue du Commerce, 69001 Lyon"}
  ]
}
```

---

### Modifier son profil

**PUT** `/api/profile`

Met à jour les informations du profil.

**Headers :** `Authorization: Bearer <token>`

**Données à envoyer :**

| Champ | Type | Requis | Applicable à | Description |
|-------|------|--------|--------------|-------------|
| `email` | string | Non | Tous | Nouvelle adresse email |
| `nom` | string | Non | Tous | Nouveau nom |
| `telephone` | string | Non | Tous | Nouveau téléphone |
| `prenom` | string | Non | Aidant | Nouveau prénom |
| `pseudo` | string | Non | Aidant | Nouveau pseudo |
| `adresse` | string | Non | Aidant | Nouvelle adresse |
| `nomContact` | string | Non | Professionnel | Nouveau nom de contact |
| `descriptionEntr` | string | Non | Professionnel | Nouvelle description |

**Réponse succès :** `204` (pas de contenu)

**Exemple :**
```json
{
  "email": "nouveau.email@example.com",
  "nom": "Dupont",
  "telephone": "0698765432",
  "pseudo": "nouveauPseudo"
}
```

---

### Photo de profil

**POST** `/api/profile/photo_profil`

Charge ou remplace la photo de profil de l'utilisateur connecté.

**Headers :** `Authorization: Bearer <token>`

**Form-data :**
- `photo` (fichier image)

**Contraintes :**
- Types autorisés : `image/jpeg`, `image/png`, `image/webp`
- Taille max : 2 Mo

**Réponses :**
- `200` : `{"status": "Photo mise à jour"}`
- `400` : `{"error": "Fichier manquant"}`
- `413` : `{"error": "Fichier trop volumineux"}`
- `415` : `{"error": "Type de fichier interdit"}`

**GET** `/api/profile/photo_profil`

Récupère la photo de profil de l'utilisateur connecté.

**Headers :** `Authorization: Bearer <token>`

**Réponses :**
- `200` : contenu binaire de l'image (header `Content-Type` adapté)
- `404` : aucune photo définie

**GET** `/api/profile/photo_profil/{id}`

Récupère la photo de profil publique d'un utilisateur.

**Paramètres URL :**
- `id` : int, ID de l'utilisateur

**Réponses :**
- `200` : contenu binaire de l'image (header `Content-Type` adapté)
- `404` : utilisateur ou photo non trouvée

---

### Ajouter une adresse (Professionnel)

**POST** `/api/profile/adresses`

Ajoute une nouvelle adresse au compte professionnel.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Professionnel

**Données à envoyer :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `adresse` | string | Oui | Adresse à ajouter |

**Réponse succès :** `204` (pas de contenu)

**Exemple :**
```json
{
  "adresse": "25 boulevard Voltaire, 75011 Paris"
}
```

---

### Supprimer une adresse (Professionnel)

**DELETE** `/api/profile/adresses/{id}`

Supprime une adresse du compte professionnel.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Professionnel

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID de l'adresse à supprimer |

**Données à envoyer :** Aucune

**Réponse succès :** `204` (pas de contenu)

**Réponse erreur :** `403` si l'adresse n'appartient pas au professionnel

---

### Récupérer le type d'utilisateur

**GET** `/api/profile/type`

Retourne le type de l'utilisateur connecté.

**Headers :** `Authorization: Bearer <token>`

**Données à envoyer :** Aucune

**Réponse succès :** `200`

| Champ | Type | Description |
|-------|------|-------------|
| `type` | string | "admin", "professionnel" ou "aidant" |

```json
{
  "type": "aidant"
}
```

**Réponse erreur :** `500`
```json
{
  "error": "Type d'utilisateur inconnu"
}
```

---

## Tâches

### Lister ses tâches

**GET** `/api/taches`

Retourne la liste des tâches de l'aidant connecté, triées par date croissante.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Données à envoyer :** Aucune

**Réponse succès :** `200`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | int | Identifiant de la tâche |
| `nom` | string | Nom de la tâche |
| `description` | string | Description |
| `date` | string | Date au format "YYYY-MM-DD HH:MM:SS" |
| `duree` | int | Durée en minutes |
| `faite` | bool | Statut de complétion |

```json
[
  {
    "id": 1,
    "nom": "Courses",
    "description": "Faire les courses pour Mme Martin",
    "date": "2025-01-20 10:00:00",
    "duree": 60,
    "faite": false
  }
]
```

---

### Détail d'une tâche

**GET** `/api/taches/{id}`

Retourne les détails d'une tâche spécifique.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID de la tâche |

**Données à envoyer :** Aucune

**Réponse succès :** `200`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | int | Identifiant |
| `nom` | string | Nom |
| `description` | string | Description |
| `date` | string | Date "YYYY-MM-DD HH:MM:SS" |
| `duree` | int | Durée en minutes |
| `faite` | bool | Statut |
| `aidantAffecte` | int/null | ID de l'aidant affecté |

```json
{
  "id": 1,
  "nom": "Courses",
  "description": "Faire les courses pour Mme Martin",
  "date": "2025-01-20 10:00:00",
  "duree": 60,
  "faite": false,
  "aidantAffecte": 1
}
```

**Réponses erreur :**
- `403` : `{"error": "Accès interdit"}`
- `404` : `{"error": "Tâche non trouvée"}`

---

### Créer une tâche

**POST** `/api/taches`

Crée une nouvelle tâche personnelle.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Données à envoyer :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `nom` | string | Oui | Nom de la tâche |
| `description` | string | Oui | Description |
| `date` | string | Oui | Date au format "YYYY-MM-DD HH:MM:SS" |
| `duree` | int | Oui | Durée en minutes |

**Réponse succès :** `200`
```json
{
  "message": "Tache créée avec succès"
}
```

**Exemple :**
```json
{
  "nom": "Rendez-vous médecin",
  "description": "Accompagner M. Durand chez le médecin",
  "date": "2025-01-25 14:30:00",
  "duree": 90
}
```

---

### Modifier une tâche

**PUT** `/api/taches/{id}`

Modifie une tâche existante.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID de la tâche |

**Données à envoyer :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `nom` | string | Non | Nouveau nom |
| `description` | string | Non | Nouvelle description |
| `date` | string | Non | Nouvelle date |
| `duree` | int | Non | Nouvelle durée |

**Réponse succès :** `200`
```json
{
  "message": "Tâche modifiée avec succès"
}
```

**Réponse erreur :** `403`
```json
{
  "error": "Vous n'avez pas le droit de modifier cette tâche"
}
```

**Exemple :**
```json
{
  "nom": "Nouveau nom de tâche",
  "description": "Nouvelle description",
  "date": "2025-01-26 15:00:00",
  "duree": 120
}
```

---

### Supprimer une tâche

**DELETE** `/api/taches/{id}`

Supprime une tâche.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID de la tâche |

**Données à envoyer :** Aucune

**Réponse succès :** `200`
```json
{
  "message": "Tâche supprimée avec succès"
}
```

**Réponse erreur :** `403`
```json
{
  "error": "Vous n'avez pas le droit de modifier cette tâche"
}
```

---

### Valider une tâche

**PATCH** `/api/taches/statut/{id}`

Bascule l'état d'une tâche (faite/non faite).

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID de la tâche |

**Données à envoyer :** Aucune

**Réponse succès :** `200`
```json
{
  "message": "Tâche validée",
  "faite": true
}
```

ou

```json
{
  "message": "Tâche dévalidée",
  "faite": false
}
```

**Réponse erreur :** `403`
```json
{
  "error": "Vous n'avez pas le droit de modifier cette tâche"
}
```

---

### Tâches d'un groupe

**POST** `/api/taches/taches_dun_groupe`

Récupère toutes les tâches des membres d'un groupe.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Données à envoyer :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `id_groupe` | int | Oui | ID du groupe |

**Réponse succès :** `200`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | int | ID de la tâche |
| `nom` | string | Nom |
| `description` | string | Description |
| `date_limite` | string | Date au format "DD/MM/YYYY HH:MM" |
| `duree` | int | Durée en minutes |
| `faite` | bool | Statut |
| `aidant_nom` | string/null | Nom de l'aidant |
| `aidant_prenom` | string/null | Prénom de l'aidant |

```json
[
  {
    "id": 1,
    "nom": "Courses",
    "description": "Faire les courses",
    "date_limite": "20/01/2025 10:00",
    "duree": 60,
    "faite": false,
    "aidant_nom": "Dupont",
    "aidant_prenom": "Jean"
  }
]
```

**Réponses erreur :**
- `400` : `{"error": "L'ID du groupe est manquant"}`
- `401` : `{"error": "Non authentifié"}`
- `403` : `{"error": "Accès interdit à ce groupe"}`
- `404` : `{"error": "Groupe introuvable"}`

**Exemple :**
```json
{
  "id_groupe": 1
}
```

---

### Tâches des autres membres du groupe

**POST** `/api/taches/taches_autres_membres`

Récupère les tâches des autres membres du groupe (exclut l'utilisateur connecté).

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Données à envoyer :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `id_groupe` | int | Oui | ID du groupe |

**Réponse succès :** `200`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | int | ID de la tâche |
| `nom` | string | Nom |
| `description` | string | Description |
| `date_limite` | string | Date "DD/MM/YYYY HH:MM" |
| `duree` | int | Durée |
| `faite` | bool | Statut |
| `assigne_a` | object | Informations sur l'aidant |
| `assigne_a.id` | int | ID de l'aidant |
| `assigne_a.nom` | string | Nom |
| `assigne_a.prenom` | string | Prénom |

```json
[
  {
    "id": 2,
    "nom": "Accompagnement",
    "description": "Accompagner au parc",
    "date_limite": "21/01/2025 14:00",
    "duree": 90,
    "faite": false,
    "assigne_a": {
      "id": 3,
      "nom": "Martin",
      "prenom": "Sophie"
    }
  }
]
```

**Réponses erreur :**
- `400` : `{"error": "L'ID du groupe est manquant"}`
- `401` : `{"error": "Non authentifié"}`
- `403` : `{"error": "Accès interdit à ce groupe"}`
- `404` : `{"error": "Groupe introuvable"}`

**Exemple :**
```json
{
  "id_groupe": 1
}
```

---

## Avantages

### Lister tous les avantages

**GET** `/api/avantages`

Retourne la liste de tous les avantages (approuvés ou non).

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant ou Professionnel

**Données à envoyer :** Aucune

**Réponse succès :** `200`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | int | ID de l'avantage |
| `nom` | string | Nom |
| `description` | string | Description |
| `points` | int | Coût en points |
| `approuve` | bool | Statut d'approbation |

```json
[
  {
    "id": 1,
    "nom": "Réduction café",
    "description": "-20% sur les boissons chaudes",
    "points": 50,
    "approuve": true
  }
]
```

---

### Lister les avantages approuvés

**GET** `/api/avantages/approuves`

Retourne uniquement les avantages approuvés.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Données à envoyer :** Aucune

**Réponse succès :** `200`

Même format que `/api/avantages` mais uniquement les avantages avec `approuve: true`.

---

### Détail d'un avantage

**GET** `/api/avantages/{id}`

Retourne les détails d'un avantage spécifique.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant ou Professionnel

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID de l'avantage |

**Données à envoyer :** Aucune

**Réponse succès :** `200`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | int | ID |
| `nom` | string | Nom |
| `description` | string | Description |
| `prix` | int | Coût en points |
| `lienQR` | string | Lien du QR code |
| `approuve` | bool | Statut d'approbation |
| `proprietaire` | object | Info du professionnel |
| `proprietaire.id` | int | ID du professionnel |
| `proprietaire.nom` | string | Nom du professionnel |

```json
{
  "id": 1,
  "nom": "Réduction café",
  "description": "-20% sur les boissons chaudes",
  "prix": 50,
  "lienQR": "https://exemple.com/qr/123",
  "approuve": true,
  "proprietaire": {
    "id": 5,
    "nom": "Café du Centre"
  }
}
```

**Réponse erreur :** `403`
```json
{
  "error": "Accès refusé. Cet avantage n'est pas encore approuvé."
}
```

---

### Créer un avantage (Professionnel)

**POST** `/api/avantages`

Crée un nouvel avantage (en attente de validation admin).

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Professionnel

**Données à envoyer :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `nom` | string | Oui | Nom de l'avantage |
| `description` | string | Oui | Description |
| `prix` | int | Oui | Coût en points |
| `lienQR` | string | Non | Lien du QR code |

**Réponse succès :** `201`
```json
{
  "message": "Avantage créé avec succès. Il est en attente de validation.",
  "id": 1
}
```

**Réponse erreur :** `403`
```json
{
  "error": "Seul un compte Professionnel peut créer un avantage."
}
```

**Exemple :**
```json
{
  "nom": "Menu découverte",
  "description": "Menu complet à prix réduit",
  "prix": 100,
  "lienQR": "https://exemple.com/qr/menu123"
}
```

---

### Modifier un avantage (Professionnel)

**PUT** `/api/avantages/{id}`

Modifie un avantage existant (repasse en attente de validation).

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Professionnel (propriétaire)

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID de l'avantage |

**Données à envoyer :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `nom` | string | Non | Nouveau nom |
| `description` | string | Non | Nouvelle description |
| `prix` | int | Non | Nouveau prix |
| `lienQR` | string | Non | Nouveau lien QR |

**Réponse succès :** `200`
```json
{
  "message": "Avantage modifié avec succès. Il est en attente de validation.",
  "id": 1
}
```

**Réponse erreur :** `403`
```json
{
  "error": "Vous ne pouvez pas modifier l'avantage d'un autre professionnel."
}
```

**Exemple :**
```json
{
  "nom": "Nouveau nom",
  "description": "Nouvelle description",
  "prix": 120
}
```

---

### Supprimer un avantage (Professionnel)

**DELETE** `/api/avantages/{id}`

Supprime un avantage appartenant au professionnel.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Professionnel (propriétaire)

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID de l'avantage |

**Données à envoyer :** Aucune

**Réponse succès :** `200`
```json
{
  "message": "Avantage supprimé avec succès"
}
```

**Réponse erreur :** `403`
```json
{
  "error": "Vous ne pouvez pas supprimer l'avantage d'un autre professionnel."
}
```

---

### Réclamer un avantage (Aidant)

**GET** `/api/avantages/reclamer/{id}`

L'aidant échange ses points contre un avantage.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID de l'avantage |

**Données à envoyer :** Aucune

**Réponse succès :** `200`
```json
{
  "message": "Avantage réclamé avec succès !"
}
```

**Réponses erreur :** `403`
- `{"error": "Seul un compte Aidant peut réclamer un avantage."}`
- `{"error": "Cet avantage n'est pas approuvé et ne peut pas être réclamé."}`
- `{"error": "Vous n'avez pas assez de points pour réclamer cet avantage."}`

---

### Mes avantages réclamés (Aidant)

**GET** `/api/avantages/mes-avantages`

Liste les avantages obtenus par l'aidant.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Données à envoyer :** Aucune

**Réponse succès :** `200`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | int | ID de l'avantage |
| `nom` | string | Nom |
| `description` | string | Description |
| `lienQR` | string | Lien du QR code |
| `prix` | int | Prix payé en points |

```json
[
  {
    "id": 1,
    "nom": "Réduction café",
    "description": "-20% sur les boissons chaudes",
    "lienQR": "https://exemple.com/qr/123",
    "prix": 50
  }
]
```

---

### Approuver un avantage (Admin)

**POST** `/api/avantages/approuver/{id}`

L'administrateur approuve un avantage.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Admin

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID de l'avantage |

**Données à envoyer :** Aucune

**Réponse succès :** `200`
```json
{
  "message": "Avantage approuvé avec succès"
}
```

---

### Refuser un avantage (Admin)

**POST** `/api/avantages/refuser/{id}`

L'administrateur refuse un avantage.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Admin

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID de l'avantage |

**Données à envoyer :** Aucune

**Réponse succès :** `200`
```json
{
  "message": "Avantage refusé avec succès"
}
```

---

### Révoquer un avantage (Professionnel)

**POST** `/api/avantages/revoquer/{id}`

Retire un avantage à un aidant après utilisation.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Professionnel (propriétaire)

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID de l'avantage |

**Données à envoyer :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `aidantId` | int | Oui | ID de l'aidant |

**Réponse succès :** `200`
```json
{
  "message": "Avantage révoqué avec succès pour l'aidant."
}
```

**Réponses erreur :**
- `400` : `{"error": "ID de l'aidant manquant."}`
- `400` : `{"error": "Cet utilisateur ne possède pas cet avantage (ou l'a déjà utilisé)."}`
- `403` : `{"error": "Vous ne pouvez pas gérer les avantages d'un autre professionnel."}`
- `404` : `{"error": "Aidant non trouvé."}`

**Exemple :**
```json
{
  "aidantId": 42
}
```

---

## Services

### Créer un service

**POST** `/api/services`

Crée une proposition de service (aide offerte ou demandée).

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Données à envoyer :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `nom` | string | Oui | Nom du service |
| `description` | string | Oui | Description |
| `date` | string | Oui | Date "YYYY-MM-DD HH:MM:SS" |
| `duree` | int | Oui | Durée en minutes |
| `maxDemandeurs` | int | Oui | Nombre max de candidats |
| `latitude` | float | Oui | Latitude GPS |
| `longitude` | float | Oui | Longitude GPS |
| `type` | string | Oui | "proposition" ou "demande" |

**Réponse succès :** `201`
```json
{
  "id": 1
}
```

**Exemple :**
```json
{
  "nom": "Aide au jardinage",
  "description": "Tonte de pelouse et taille des haies",
  "date": "2025-02-01 09:00:00",
  "duree": 120,
  "maxDemandeurs": 3,
  "latitude": 48.8566,
  "longitude": 2.3522,
  "type": "proposition"
}
```

---

### Récupérer un service

**GET** `/api/services/{id}`

Retourne les détails d'un service.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID du service |

**Données à envoyer :** Aucune

**Réponse succès :** `200`

| Champ | Type | Description |
|-------|------|-------------|
| `service.id` | int | ID du service |
| `service.maxDemandeurs` | int | Max candidats |
| `service.latitude` | float | Latitude |
| `service.longitude` | float | Longitude |
| `service.totalCandidats` | int | Nombre de candidats actuels |
| `service.type` | string | Type de service |
| `service.aidant.id` | int | ID du créateur |
| `service.tache` | object | Tâche associée |

```json
{
  "service": {
    "id": 1,
    "maxDemandeurs": 3,
    "latitude": 48.8566,
    "longitude": 2.3522,
    "totalCandidats": 1,
    "type": "proposition",
    "aidant": {
      "id": 1
    },
    "tache": {
      "id": 1,
      "nom": "Aide au jardinage",
      "description": "Tonte de pelouse",
      "date": "2025-02-01 09:00:00",
      "heureDebut": null,
      "duree": 120,
      "faite": false,
      "aidantAffecte": 1
    }
  }
}
```

**Réponse erreur :** `404` si service non trouvé

---

### Rechercher des services sur la carte

**POST** `/api/services/map`

Recherche les services disponibles dans un rayon donné, en séparant ceux créés par l'utilisateur connecté et ceux des autres.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Données à envoyer :**

| Champ       | Type   | Requis | Description                          |
|-------------|--------|--------|--------------------------------------|
| `latitude`  | float  | Oui    | Latitude du point de recherche       |
| `longitude` | float  | Oui    | Longitude du point de recherche      |
| `rayon`     | int    | Oui    | Rayon de recherche en mètres         |

**Réponse succès :** `200`

La réponse contient deux listes : `userServices` (services créés par l'utilisateur) et `otherServices` (services créés par d'autres utilisateurs). Chaque élément contient les champs suivants :

| Champ              | Type   | Description                          |
|--------------------|--------|--------------------------------------|
| `id`               | int    | ID du service                        |
| `idTache`          | int    | ID de la tâche associée au service   |
| `nom`              | string | Nom du service                       |
| `distance`         | int    | Distance en mètres                   |
| `totalCandidat`    | int    | Nombre de candidats                  |
| `maxDemandeurs`    | int    | Nombre maximum de candidats          |
| `description`      | string | Description du service               |
| `longitude`        | float  | Longitude du service                 |
| `latitude`         | float  | Latitude du service                  |
| `type`             | string | Type de service ("proposition" ou "demande") |
| `idCreateur`       | int    | ID du créateur du service            |
| `estInscrit`       | bool   | Indique si l'utilisateur connecté est inscrit au service |

**Exemple de réponse :**
```json
{
  "userServices": [
    {
      "id": 1,
      "idTache": 10,
      "nom": "Aide au jardinage",
      "distance": 1250,
      "totalCandidat": 1,
      "maxDemandeurs": 3,
      "description": "Tonte de pelouse",
      "longitude": 2.3522,
      "latitude": 48.8566,
      "type": "proposition",
      "idCreateur": 5,
      "estInscrit": false
    }
  ],
  "otherServices": [
    {
      "id": 2,
      "idTache": 11,
      "nom": "Courses",
      "distance": 3000,
      "totalCandidat": 2,
      "maxDemandeurs": 5,
      "description": "Faire les courses pour une personne âgée",
      "longitude": 2.3600,
      "latitude": 48.8600,
      "type": "demande",
      "idCreateur": 8,
      "estInscrit": true
    }
  ]
}
```

**Exemple de requête :**
```json
{
  "latitude": 48.8566,
  "longitude": 2.3522,
  "rayon": 5000
}
```

---

### Supprimer un service

**DELETE** `/api/services/{id}`

Supprime un service créé par l'aidant.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant (créateur)

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID du service |

**Données à envoyer :** Aucune

**Réponse succès :** `204` (pas de contenu)

**Réponse erreur :** `403` si non propriétaire

---

### S'inscrire à un service

**POST** `/api/services/inscription/{id}`

L'aidant s'inscrit comme candidat à un service.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID du service |

**Données à envoyer :** Aucune

**Comportement :**
- Vérifie que le service est encore disponible (tâche non faite).
- Vérifie que le service admet des inscriptions.
- Empêche le créateur du service de s'inscrire comme candidat (le créateur ne peut pas être candidat pour son propre service).
- Empêche les doublons et la surcharge.

**Réponse succès :** `200`
```json
{
  "message": "Inscription réussie"
}
```

**Réponses erreur :** `400`
- `{"error": "Service indisponible"}`
- `{"error": "Inscription impossible sur ce type de service"}`
- `{"error": "Déjà inscrit"}`
- `{"error": "Nombre maximum de candidats atteint"}`
- `{"error": "Vous ne pouvez pas vous inscrire à votre propre service"}`

---

### Se désinscrire d'un service

**DELETE** `/api/services/desinscription/{id}`

L'aidant annule sa candidature à un service.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Aidant

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID du service |

**Données à envoyer :** Aucune

**Réponse succès :** `200`
```json
{
  "message": "Désinscription effectuée"
}
```

**Réponses erreur :** `400`
- `{"error": "Ce service n'est pas une proposition"}`
- `{"error": "Vous n'êtes pas inscrit à ce service"}`

---

## Messages

### Envoyer un message

**POST** `/api/messages`

Envoie un message à un autre utilisateur.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Utilisateur authentifié

**Données à envoyer :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `destinataireId` | int | Oui | ID du destinataire |
| `texte` | string | Oui | Contenu du message |

**Réponse succès :** `201`
```json
{
  "id": 1
}
```

**Réponses erreur :**
- `400` : `{"error": "Champs manquants"}`
- `400` : `{"error": "Immpossible de s'auto envoyer un message"}`
- `404` : `{"error": "Destinataire introuvable"}`

**Exemple :**
```json
{
  "destinataireId": 5,
  "texte": "Bonjour, êtes-vous disponible demain ?"
}
```

---

### Supprimer un message

**DELETE** `/api/messages/{id}`

Supprime un message envoyé par l'utilisateur.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Utilisateur authentifié (auteur)

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | int | ID du message |

**Données à envoyer :** Aucune

**Réponse succès :** `204` (pas de contenu)

**Réponse erreur :** `403` si non auteur du message

---

### Récupérer une conversation

**GET** `/api/messages/conversation/{otherId}`

Récupère tous les messages échangés avec un autre utilisateur.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Utilisateur authentifié

**Paramètres URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `otherId` | int | ID de l'autre utilisateur |

**Données à envoyer :** Aucune

**Réponse succès :** `200`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | int | ID du message |
| `date` | string | Date ISO 8601 |
| `texte` | string | Contenu |
| `auteur` | int | ID de l'auteur |
| `destinataire` | int | ID du destinataire |

```json
[
  {
    "id": 1,
    "date": "2025-01-15T10:30:00+00:00",
    "texte": "Bonjour !",
    "auteur": 1,
    "destinataire": 5
  },
  {
    "id": 2,
    "date": "2025-01-15T10:35:00+00:00",
    "texte": "Salut, comment ça va ?",
    "auteur": 5,
    "destinataire": 1
  }
]
```

**Réponse erreur :** `404`
```json
{
  "error": "Utilisateur introuvable"
}
```

---

### Lister les conversations

**GET** `/api/messages/conversations`

Retourne la liste des conversations avec le dernier message de chacune.

**Headers :** `Authorization: Bearer <token>`

**Rôle requis :** Utilisateur authentifié

**Données à envoyer :** Aucune

**Réponse succès :** `200`

| Champ | Type | Description |
|-------|------|-------------|
| `utilisateur` | object | Info de l'autre utilisateur |
| `utilisateur.id` | int | ID |
| `utilisateur.nom` | string | Nom |
| `dernierMessage` | object | Dernier message |
| `dernierMessage.id` | int | ID du message |
| `dernierMessage.texte` | string | Contenu |
| `dernierMessage.date` | string | Date ISO 8601 |
| `dernierMessage.envoyeParMoi` | bool | true si envoyé par l'utilisateur connecté |

```json
[
  {
    "utilisateur": {
      "id": 5,
      "nom": "Martin"
    },
    "dernierMessage": {
      "id": 10,
      "texte": "À demain !",
      "date": "2025-01-15T18:00:00+00:00",
      "envoyeParMoi": false
    }
  }
]
```

---

## Codes de réponse HTTP

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Ressource créée |
| 204 | Succès sans contenu |
| 400 | Requête invalide (données manquantes ou incorrectes) |
| 401 | Non authentifié (token manquant ou invalide) |
| 403 | Accès interdit (droits insuffisants) |
| 404 | Ressource non trouvée |
