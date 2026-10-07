# WarehouseManagement

 Application mobile de gestion de stock pour un entrepot fictif.

## Fonctionnalités

-   Consulter la liste des produits disponibles.
-   Ajouter ou supprimer des produits.
-   Modifier les données des produits existants.
-   Rechercher des produits spécifiques.
-   Interface utilisateur fluide,affichage des produits en liste ou en cartes.

## Stack Technique

-   **Frontend :** React Native (Expo), TypeScript, React Navigation
-   **Backend :** Node.js, Express
-  **Gestion d'états** : useState

## Installation

### 1. Base de données

Le projet utilise une base de données **MySQL** (via WampServer, XAMPP ou Docker).

1.  Créez une base de données nommée `dbwarehouse`.
2.  Importez le fichier `dbwarehouse.sql` (situé dans le dossier racine ) pour créer automatiquement les tables nécessaires.
3.  Modifiez le fichier `.env` (ou le créer si nécessaire)pour définir les variables de connexion à la base de données :
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME

### 2. Lancement des serveurs

Ouvrez votre terminal et exécutez les commandes suivantes à la racine du projet :

> git clone
> [https://github.com/ysaidmohamed/WarehouseManagement.git](https://github.com/ysaidmohamed/WarehouseManagement.git)
> 
> 
> npm install
> 
> npx expo start

Lancez le backend avec la commande suivante à la racine du projet :

>node backend/index.js

### 3 . Choix techniques

### React Native et Expo

L'interface est dévelopée avec React Native et Expo afin de couvrir tous les supports d'appareils mobiles Android et iOS.Les zones de texte et de données s'adaptent à la taille de chaque appareil.

### TypeScript et JavaScript

TypeScript est utilisé pour les différentes pages de l'application afin de pouvoir suivre des erreurs que JavaScript n'identifierait pas.
Le backend reste sur JavaScript.

### React Navigation

Pour une petite application utilisant une navigation en pile,React Navigation est idéal pour gérer l'affichage rapide et simple de fenêtres secondaires.

### Backend

Le serveur utilise Node.js et Express indépendament de l'interface.Des requêtes sont utilisées pour demander les données que l'on souhaite sans accéder directement à la base de données.

MySQL est utilisé ici pour une base de données contenant 2 uniques tables avec la clé catégorie référencée dans la table produit.Le système de concepteur intuitif permet la réalisation rapide de la relation nécessaire entre clé référencée et clé étrangère.Le backend transmet les résultats au format JSON.

### Gestion des états

useState est utilisé pour gérer l'état temporaire des formulaires et les listes afin de sauvegarder des données que l'on souhaite réutiliser dans la page sans forcément persister en base de données (liste des produits,requête dans la barre de recherche,liste des catégories,messages d'erreurs,sauvegardes).

### Composants réutisables 

2 composants sont réutilisés ici : le composant du formulaire utilisé pour l'ajout et la modification d'un produit ainsi que le composant de la modification de quantité d'un produit utilisé dans 2 formulaires.


### 4. Captures d'écran

Page d'accueil (affichage liste) :

<img width="161" height="359" alt="c1" src="https://github.com/user-attachments/assets/aa297f7c-cf32-4156-b09c-e8f840e3b34c" />

Page d'accueil (affichage cartes) :

<img width="157" height="347" alt="c2" src="https://github.com/user-attachments/assets/fcbc6a66-9101-4e7d-a1e7-37f81f394918" />

Ajout d'un produit :

<img width="153" height="347" alt="c3" src="https://github.com/user-attachments/assets/820348e4-33d0-4b69-9465-20f5e1653707" />

Modification d'un produit :

<img width="154" height="344" alt="c4" src="https://github.com/user-attachments/assets/5e9cf04c-0800-4845-abbc-fe6e97694c92" />








