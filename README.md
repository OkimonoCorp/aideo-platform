# Aideo

Plateforme web de mise en relation entre aidants de l'aide à la personne.

## Description

Aideo est une application permettant aux aidants de trouver et contacter des professionnels de l'aide à la personne. La plateforme propose :

- Un système d'inscription et d'authentification pour les aidants et les professionnels
- Une messagerie interne entre utilisateurs
- Un calendrier de gestion des taches
- Une carte interactive pour localiser les professionnels et les services des aidants
- Un systeme d'avantages et de fidelite
- Un espace partenaire pour les professionnels
- Un panneau d'administration

## Technologies

### Backend

- PHP 8.4
- Symfony 8
- API Platform
- Doctrine ORM
- PostgreSQL 16
- Authentification JWT (LexikJWTAuthenticationBundle)

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- Leaflet (cartographie)
- Schedule-X (calendrier)

### Tests

- PHPUnit (tests unitaires backend)
- Cypress (tests end-to-end)

## Prerequis

- Docker et Docker Compose
- Node.js 20+ (pour le developpement local sans Docker)
- PHP 8.4+ (pour le developpement local sans Docker)
- Composer

## Installation

### Avec Docker (recommande)

1. Cloner le depot :

```bash
git clone <url-du-depot>
cd aideo
```

2. Configurer les variables d'environnement :

```bash
export UID=$(id -u)
export GID=$(id -g)
```

3. Lancer les conteneurs :

```bash
docker compose up -d
```

4. Acceder a l'application :
   - Frontend : http://localhost:5173
   - API : http://localhost:8000

### Installation manuelle

#### Backend

```bash
cd backend/symfony
composer install
```

Configurer le fichier `.env.local` avec les informations de connexion a la base de donnees, puis :

```bash
php bin/console doctrine:migrations:migrate
php bin/console lexik:jwt:generate-keypair
php -S localhost:8000 -t public
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Structure du projet

```
aideo/
├── backend/
│   ├── postgres/          # Donnees PostgreSQL
│   └── symfony/           # API Symfony
│       ├── src/
│       │   ├── Controller/
│       │   ├── Entity/
│       │   ├── Repository/
│       │   └── Security/
│       ├── config/
│       ├── migrations/
│       └── Tests/
├── frontend/              # Application React
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── util/
│   └── public/
├── test/
│   └── Cypress/           # Tests E2E
└── docker-compose.yml
```

## Tests

### Tests backend

```bash
cd backend/symfony
php bin/phpunit
```

### Tests Cypress

```bash
docker compose run cypress npx cypress run
```

Ou en mode interactif :

```bash
docker compose run cypress npx cypress open
```

## API

L'API REST est documentee via son REAMDE dédié

Toutes les routes (sauf creation de compte et login) necessitent un token JWT dans le header :

```
Authorization: Bearer <token>
```

## Deploiement

Un fichier `docker-compose.yml` est fourni pour le deploiement. Pour un environnement de production, utiliser les configurations adaptees dans `backend/symfony/docker-compose.prod.yml`.