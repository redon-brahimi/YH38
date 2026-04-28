# EspaceCall - Système de Gestion de Réparations

Une plateforme complète de gestion des réparations de téléphones et ordinateurs, avec suivi en temps réel et interface accessible.

## Description

EspaceCall est une application web full-stack conçue pour gérer efficacement les réparations de téléphones et ordinateurs. La plateforme permet aux clients de créer des tickets de réparation, suivre leur statut en temps réel, et prendre rendez-vous pour les dépôts et récupérations.

## Fonctionnalités Implémentées

### ✅ Phase 1: Environment & Database Setup (Terminée)
- **Connexion Docker**: Configuration complète avec PostgreSQL, API Node.js et frontend React
- **Modèles de Base de Données**: Tables pour Clients, Réparations et Rendez-vous
- **API REST**: Endpoints pour créer et suivre les tickets de réparation

### ✅ Phase 2: Accessible Frontend Framework (Terminée)
- **Configuration Tailwind**: Police de base 18px, palette de couleurs avec ratio 4.5:1
- **Navigation & Layout**: Barre de navigation fixe et footer avec langage simple (A2-B1)
- **Bibliothèque de Composants**: Boutons et inputs réutilisables (44x44px minimum, focus visible)

### 🚧 Phase 3: Core Features (En cours)
- **Système de Réservation**: Module de choix de créneaux date/heure
- **Suivi Temps Réel**: Interface pour suivre le statut des réparations
- **Logique de Formulaire**: Breadcrumbs et messages d'erreur clairs

## Pile Technologique

### Backend
- **Node.js** (v22.21.1)
- **Express.js** - Framework web
- **PostgreSQL** - Base de données
- **JWT** - Authentification

### Frontend
- **Node.js** (v22.21.1)
- **Vite** - Outil de build et serveur de développement
- **React/Vue** - Framework frontend (à configurer selon les besoins)

### DevOps
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration multi-conteneurs

## Base de Données

Le schéma complet de la base de données se trouve dans le dossier `sql/` :

- **`sql/schema.sql`** - Schéma complet avec tables, index, vues et fonctions
- **`sql/README.md`** - Documentation détaillée du schéma

### Tables Principales
- **clients** - Informations clients (nom, email, téléphone)
- **repairs** - Tickets de réparation avec statut et priorité
- **appointments** - Rendez-vous programmés

## Structure du Projet

```
.
├── be/                     # Application backend
│   └── src/
│       ├── models/         # Modèles de base de données
│       └── routes/         # Routes API
├── fe/                     # Application frontend
│   └── src/
│       ├── components/     # Composants UI réutilisables
│       └── views/          # Vues de pages
├── src/                    # Application principale (si applicable)
│   ├── config/             # Fichiers de configuration
│   ├── controllers/        # Contrôleurs de routes
│   ├── middleware/         # Middleware personnalisé
│   ├── models/             # Modèles de données
│   ├── routes/             # Routes d'application
│   ├── styles/             # Feuilles de style
│   ├── utils/              # Fonctions utilitaires
│   └── views/              # Modèles de vues
│       ├── components/     # Composants UI
│       ├── layouts/        # Modèles de mise en page
│       └── pages/          # Modèles de pages
├── public/                 # Ressources statiques
│   └── assets/
│       └── icons/          # Fichiers d'icônes
├── docker/                 # Fichiers liés à Docker
├── tests/                  # Fichiers de tests
├── docker-compose.yml      # Configuration Docker Compose
├── Dockerfile              # Définition d'image Docker
├── package.json            # Dépendances et scripts Node.js
├── tailwind.config.js      # Configuration Tailwind CSS
└── README.md               # Documentation du projet
```

## Prérequis

Avant d'exécuter cette application, assurez-vous d'avoir installé :

- **Docker** (v20.10 ou plus récent)
- **Docker Compose** (v2.0 ou plus récent)
- **Node.js** (v18 ou plus récent) - pour le développement local
- **npm** ou **yarn** - gestionnaire de paquets

## Installation

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/redon-brahimi/Portfolio.git
   cd Portfolio
   ```

2. **Configurer le backend :**
   ```bash
   cd be
   npm install
   ```

3. **Configurer le frontend :**
   ```bash
   cd ../fe
   npm install
   ```

## Exécution de l'Application

### Utilisation de Docker Compose (Recommandé)

1. **Démarrer tous les services :**
   ```bash
   docker-compose up
   ```

   Ou exécuter en mode détaché :
   ```bash
   docker-compose up -d
   ```

2. **Accéder à l'application :**
   - Frontend : http://localhost:5173
   - API Backend : http://localhost:4000
   - PostgreSQL : localhost:5432

3. **Arrêter les services :**
   ```bash
   docker-compose down
   ```

### Développement Local

1. **Démarrer la base de données :**
   ```bash
   docker-compose up postgres
   ```

2. **Démarrer le backend :**
   ```bash
   cd be
   npm start
   ```

3. **Démarrer le frontend :**
   ```bash
   cd fe
   npm run dev
   ```

## Variables d'Environnement

L'application utilise les variables d'environnement suivantes (configurées dans docker-compose.yml) :

### Backend
- `PORT` : Port du serveur (4000)
- `PGHOST` : Hôte PostgreSQL (postgres)
- `PGPORT` : Port PostgreSQL (5432)
- `PGUSER` : Utilisateur de base de données (espace_user)
- `PGPASSWORD` : Mot de passe de base de données (toto)
- `PGDATABASE` : Nom de base de données (espace_local)
- `DATABASE_URL` : Chaîne de connexion complète à la base de données
- `ALLOWED_ORIGINS` : Origines autorisées CORS
- `JWT_SECRET` : Secret de signature JWT

### Frontend
- `VITE_API_BASE_URL` : URL de base de l'API backend

## Documentation API

### URL de Base
```
http://localhost:4000/api
```

### Authentification
L'API utilise des tokens JWT pour l'authentification. Incluez le token dans l'en-tête Authorization :
```
Authorization: Bearer <votre-token-jwt>
```

### Points de Terminaison

#### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/logout` - Déconnexion utilisateur

#### [Ajoutez vos points de terminaison API spécifiques ici]

## Développement

### Ajouter de Nouvelles Fonctionnalités

1. **Modifications backend :**
   - Ajouter des routes dans `be/src/routes/`
   - Ajouter des modèles dans `be/src/models/`
   - Mettre à jour les contrôleurs si nécessaire

2. **Modifications frontend :**
   - Ajouter des composants dans `fe/src/components/`
   - Ajouter des vues dans `fe/src/views/`
   - Mettre à jour le routage si nécessaire

### Exécuter les Tests

```bash
# Exécuter les tests backend
cd be
npm test

# Exécuter les tests frontend
cd fe
npm test
```

### Build pour la Production

```bash
# Build backend
cd be
npm run build

# Build frontend
cd fe
npm run build
```

## Déploiement

### Utilisation de Docker

1. **Construire les images :**
   ```bash
   docker-compose build
   ```

2. **Déployer :**
   ```bash
   docker-compose up -d
   ```

### Configuration d'Environnement

Pour le déploiement en production, mettez à jour les variables d'environnement dans `docker-compose.yml` ou utilisez un fichier `.env`.

## Contribution

1. Forker le dépôt
2. Créer une branche de fonctionnalité (`git checkout -b feature/fonctionnalite-incroyable`)
3. Commiter vos changements (`git commit -m 'Ajouter une fonctionnalité incroyable'`)
4. Pousser vers la branche (`git push origin feature/fonctionnalite-incroyable`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Support

Si vous avez des questions ou besoin d'aide, veuillez ouvrir une issue sur GitHub ou contacter l'équipe de développement.

---

**Note :** Ce README est un modèle. Mettez à jour les espaces réservés avec des informations spécifiques sur les fonctionnalités de votre application, les points de terminaison API, et toute instruction d'installation supplémentaire.