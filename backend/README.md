# MogaAlert - Backend

Plateforme citoyenne de signalement et de priorisation des problèmes urbains à Essaouira.

## Description

MogaAlert est une application web permettant aux citoyens de signaler des problèmes urbains (éclairage défaillant, déchets, dégradations, etc.), de les localiser sur une carte, de voter pour prioriser les interventions et de suivre leur résolution par les services municipaux.

## Technologies utilisées

- **Backend**: Node.js, Express.js
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: JWT (JSON Web Tokens)
- **Frontend** (à venir): React.js, Leaflet, Tailwind CSS

## Fonctionnalités

### Côté citoyen
- Inscription / Connexion
- Création d'un signalement avec photo, description, catégorie et géolocalisation
- Suivi des signalements (statut: attente, en cours, résolu)
- Vote citoyen pour prioriser les interventions
- Notifications lors des changements de statut
- Statistiques globales sur les signalements

### Côté administration
- Dashboard avec liste des signalements et filtres
- Gestion des signalements et changement de statut
- Attribution des signalements aux services techniques
- Archivage des signalements résolus
- Reporting et statistiques

## Installation

1. Cloner le dépôt:
```bash
git clone https://github.com/votre-nom/essaouira-fix.git
cd essaouira-fix
```

2. Installer les dépendances:
```bash
npm install
```

3. Configurer les variables d'environnement:
- Dupliquer le fichier `.env.example` en `.env`
- Remplir les informations nécessaires

4. Lancer le serveur de développement:
```bash
npm run dev
```

## Importation des données de test

Pour charger des données de test dans la base de données:
```bash
npm run data:import
```

Pour supprimer toutes les données:
```bash
npm run data:destroy
```

## Routes de l'API

### Authentification
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `GET /api/v1/auth/logout` - Déconnexion
- `GET /api/v1/auth/me` - Obtenir l'utilisateur actuel
- `PUT /api/v1/auth/updatedetails` - Mettre à jour les informations
- `PUT /api/v1/auth/updatepassword` - Mettre à jour le mot de passe
- `POST /api/v1/auth/forgotpassword` - Mot de passe oublié
- `PUT /api/v1/auth/resetpassword/:resettoken` - Réinitialiser le mot de passe

### Signalements
- `GET /api/v1/signalements` - Obtenir tous les signalements
- `GET /api/v1/signalements/:id` - Obtenir un signalement spécifique
- `POST /api/v1/signalements` - Créer un signalement
- `PUT /api/v1/signalements/:id` - Mettre à jour un signalement
- `DELETE /api/v1/signalements/:id` - Supprimer un signalement
- `PUT /api/v1/signalements/:id/photo` - Télécharger une photo
- `GET /api/v1/signalements/rayon/:lat/:lng/:distance` - Obtenir les signalements à proximité
- `POST /api/v1/signalements/:id/vote` - Voter pour un signalement
- `DELETE /api/v1/signalements/:id/vote` - Retirer son vote
- `GET /api/v1/signalements/stats` - Obtenir les statistiques des signalements

### Catégories
- `GET /api/v1/categories` - Obtenir toutes les catégories
- `GET /api/v1/categories/:id` - Obtenir une catégorie spécifique
- `POST /api/v1/categories` - Créer une catégorie (admin)
- `PUT /api/v1/categories/:id` - Mettre à jour une catégorie (admin)
- `DELETE /api/v1/categories/:id` - Supprimer une catégorie (admin)

### Services
- `GET /api/v1/services` - Obtenir tous les services
- `GET /api/v1/services/:id` - Obtenir un service spécifique
- `POST /api/v1/services` - Créer un service (admin)
- `PUT /api/v1/services/:id` - Mettre à jour un service (admin)
- `DELETE /api/v1/services/:id` - Supprimer un service (admin)
- `PUT /api/v1/services/:id/techniciens/:technicienId` - Assigner un technicien (admin)
- `DELETE /api/v1/services/:id/techniciens/:technicienId` - Retirer un technicien (admin)

### Notifications
- `GET /api/v1/notifications` - Obtenir ses notifications
- `GET /api/v1/notifications/:id` - Obtenir une notification spécifique
- `POST /api/v1/notifications` - Créer une notification (admin)
- `PUT /api/v1/notifications/:id/read` - Marquer comme lue
- `PUT /api/v1/notifications/read-all` - Marquer toutes comme lues
- `DELETE /api/v1/notifications/:id` - Supprimer une notification

### Archivages
- `GET /api/v1/archivages` - Obtenir tous les archivages (admin)
- `GET /api/v1/archivages/:id` - Obtenir un archivage spécifique (admin)
- `POST /api/v1/archivages` - Créer un archivage (admin)
- `PUT /api/v1/archivages/:id` - Mettre à jour un archivage (admin)
- `DELETE /api/v1/archivages/:id` - Supprimer un archivage (admin)
- `GET /api/v1/archivages/signalements` - Obtenir les signalements archivés (admin)

## Contributeurs

- [Votre Nom]

## Licence

Ce projet est sous licence MIT.