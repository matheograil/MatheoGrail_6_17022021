// Framework Express.
const express = require('express');
const app = express();

// Permet de manipuler les données reçues via POST.
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Importation de la connexion à la base de données.
const databaseConnection = require('./databaseConnection.js')

// Les différentes routes.
const registerRoutes = require('./routes/auth');
app.use('/api/auth', registerRoutes);
const saucesRoutes = require('./routes/sauces');
app.use('/api/sauces', saucesRoutes);

// Permet d'accéder aux images statiques.
const path = require('path');
app.use('/images', express.static(path.join(__dirname, './images')));

module.exports = app;