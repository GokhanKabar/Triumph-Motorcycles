# Système de Gestion Triumph Motorcycles

## 🏍️ Présentation du Projet

Le Système de Gestion Triumph Motorcycles est une application web complète conçue pour la gestion des concession de motos, incluant la gestion des utilisateurs, la gestion des motos, la gestion des essais, le suivi des maintenances et le contrôle des stocks.

## 🚀 Pile Technologique

### Backend
- **Langage**: TypeScript
- **Environnement d'exécution**: Node.js 21
- **Framework Web**: Express.js
- **ORM**: Sequelize
- **Base de données**: PostgreSQL
- **Authentification**: JWT (JSON Web Tokens)
- **Hachage de mot de passe**: Argon2

### Frontend
- **Framework**: React 18
- **Routage**: React Router
- **Stylisation**: Tailwind CSS
- **Outil de construction**: Vite
- **Client HTTP**: Axios

## 🌟 Fonctionnalités Principales

### 1. Gestion des Utilisateurs
- Authentification et autorisation de l'administrateur
- Gestion sécurisée des mots de passe
- Gestion des profils des utilisateurs

### 2. Gestion des Motos
- Suivi de l'inventaire des motos
- Gestion des statuts
- Informations détaillées sur les motos

### 3. Réservation d'Essais
- Planification et gestion des essais
- Suivi de l'expérience du pilote et des détails de permis

### 4. Suivi des Maintenances
- Planification des maintenances
- Suivi du type et du statut de maintenance
- Enregistrement des coûts et des remplacements de pièces

### 5. Gestion des Stocks
- Suivi des pièces en stock
- Création et gestion des pièces
- Intégration avec le système de maintenance

### 6. Gestion des Conducteurs
- Gestion des profils de conducteurs
- Suivi des permis
- Surveillance de la disponibilité et du statut

### 7. Gestion des Concessions
- Gestion des profils des concessionnaires

### 8. Gestion des Entreprises
- Gestion des profils des entreprises
- Assignation des motos aux entreprises

### 9. Gestion des incidents
- Gestion des incidents pour les utilisateurs qui veulent un test d'essai sur une moto


## 🏗️ Architecture

Le projet suit les principes de l'Architecture Propre / Architecture Hexagonale :

- **Couche Domaine**: Logique métier et entités principales
- **Couche Application**: Cas d'utilisation et logique spécifique à l'application
- **Couche Infrastructure**: Implémentations des dépôts, services et frameworks
- **Couche Interfaces**: Routes HTTP, contrôleurs et middleware

## 📦 Structure du Projet

```
src/
├── application/       # Cas d'utilisation et DTOs
├── domain/            # Modèles et logique du domaine
├── infrastructure/    # Détails des frameworks et implémentations
│   ├── frameworks/    # Configurations Express, React, PostgreSQL
│   ├── repositories/  # Implémentations d'accès à la base de données
│   └── services/      # Services d'infrastructure
└── interfaces/        # Routes HTTP, contrôleurs, middlewares
```

## 🔧 Installation et Configuration

### Prérequis
- Node.js 22
- PostgreSQL
- npm
- Variables d'Environnement
- Docker

### Étapes d'Installation
1. Cloner le dépôt
2. Installer les dépendances : `npm install` sur la racine et le dossier react
3. Configurer les variables d'environnement
4. Faire la commande `docker compose build` sur la racine
5. Lancer `docker compose up` sur la racine


## 🔐 Variables d'Environnement

Créer un fichier `.env` avec les variables suivantes :
- `DATABASE_URL`: Chaîne de connexion PostgreSQL
- `JWT_SECRET`: Clé secrète pour la génération de tokens JWT
- `PORT`: Port du serveur backend
- `DB_USER`
- `DB_HOST`
- `DB_NAME`
- `DB_PASSWORD`
- `DB_PORT`
- `NODE_ENV`
- `VITE_API_URL`

## 🤝 Contribution

- Gokhan KABAR
- Pedro DA SILVA SOUSA
- Mohammad GONS SAIB
