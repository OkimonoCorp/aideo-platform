# 🤝 AidéO — Plateforme de mise en relation pour l'aide à la personne

<p align="center">
  <img src="https://img.shields.io/badge/Symfony_8-000000?style=for-the-badge&logo=symfony&logoColor=white" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>

Aideo est une application permettant aux aidants de trouver et contacter des professionnels de l'aide à la personne. 

## ✨ Fonctionnalités

La plateforme propose :
* 🔐 Un système d'inscription et d'authentification pour les aidants et les professionnels
* 💬 Une messagerie interne entre utilisateurs
* 📅 Un calendrier de gestion des tâches
* 🗺️ Une carte interactive pour localiser les professionnels et les services des aidants
* 🎁 Un système d'avantages et de fidélité
* 🤝 Un espace partenaire pour les professionnels
* ⚙️ Un panneau d'administration

---

## 🛠️ Technologies

### Backend
* **Core :** PHP 8.4, Symfony 8
* **API & BDD :** API Platform, Doctrine ORM, PostgreSQL 16
* **Sécurité :** Authentification JWT (LexikJWTAuthenticationBundle)

### Frontend
* **Core :** React 19, Vite, React Router
* **Style & UI :** Tailwind CSS
* **Outils :** Axios, Leaflet (cartographie), Schedule-X (calendrier)

### Tests
* **Backend :** PHPUnit (tests unitaires)
* **Frontend/E2E :** Cypress

---

## ⚙️ Prérequis

* Docker et Docker Compose
* Node.js 20+ *(pour le développement local sans Docker)*
* PHP 8.4+ *(pour le développement local sans Docker)*
* Composer

---

## 🚀 Installation

### Avec Docker (Recommandé)

1. Cloner le dépôt :
   ```bash
   git clone <url-du-depot>
   cd aideo```

2. Configurer les variables d'environnement :
```bash
export UID=$(id -u)
export GID=$(id -g)
```


3. Lancer les conteneurs :
```bash
docker compose up -d

```


4. Accéder à l'application :
* **Frontend :** http://localhost:5173
* **API :** http://localhost:8000



### Installation manuelle

**Backend**

```bash
cd backend/symfony
composer install

```

Configurer le fichier `.env.local` avec les informations de connexion à la base de données, puis :

```bash
php bin/console doctrine:migrations:migrate
php bin/console lexik:jwt:generate-keypair
php -S localhost:8000 -t public

```

**Frontend**

```bash
cd frontend
npm install
npm run dev

```

---

## 📂 Structure du projet

```text
aideo/
├── backend/
│   ├── postgres/          # Données PostgreSQL
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

---

## 🧪 Tests

**Tests backend (PHPUnit)**

```bash
cd backend/symfony
php bin/phpunit

```

**Tests Cypress (E2E)**

```bash
docker compose run cypress npx cypress run

```

*Ou en mode interactif :*

```bash
docker compose run cypress npx cypress open

```

---

## 🔌 API

L'API REST est documentée via son README dédié.

Toutes les routes *(sauf création de compte et login)* nécessitent un token JWT dans le header :

```http
Authorization: Bearer <token>

```

---

## 🚢 Déploiement

Un fichier `docker-compose.yml` est fourni pour le déploiement. Pour un environnement de production, utiliser les configurations adaptées dans `backend/symfony/docker-compose.prod.yml`.
