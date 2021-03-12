# OpenClassrooms - Sixième projet
Construisez une API sécurisée pour une application d'avis gastronomiques.

[![CodeQL](https://github.com/matheograil/MatheoGrail_6_17022021/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/matheograil/MatheoGrail_6_17022021/actions/workflows/codeql-analysis.yml)

- Nom et Prénom : Grail Mathéo
- Projet : #06
- Date de début : 17/02/2021

## Configuration

⚠️ La technologie utilisée pour la base de données est **NoSQL**.

* Plusieurs paramètres sont à modifier dans le fichier `.env` pour le bon fonctionnement de l'application :

| Nom  | Description |
| --- | --- |
| **JWT_TOKEN**  | Clé de chiffrement utilisée pour les sessions |
| **DB_HOST** | Adresse IP/nom de domaine de la base de données |
| **DB_USER** | Utilisateur de la base de données |
| **DB_DATABASE** | Nom de la base de données |
| **DB_PASSWORD** | Mot de passe de la base de données |

* Ce projet nécessite également la mise en place du _front-end_ : https://github.com/OpenClassrooms-Student-Center/dwj-projet6.git, ainsi que de l'installation de _Node.js_ et _NPM (avec nodemon)_.

## Démarrage

Dans le dossier de l'application, faire les commandes suivantes :

* `npm install`
* `nodemon start`

Si tout s'est bien passé, un message dans la console devrait apparaître :
> Connexion à la base de données réussie.
