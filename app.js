const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Permet de manipuler les données reçues via POST.
app.use(bodyParser.json());

// Importation de la connexion à la base de données.
const databaseConnection = require('./databaseConnection.js')

// API : auth.
const registerRoutes = require('./routes/auth');
app.use('/api/auth', registerRoutes);

// API : sauces.
const saucesRoutes = require('./routes/sauces');
app.use('/api/sauces', saucesRoutes);

// Permet d'accéder aux images.
app.use('/images', express.static(path.join(__dirname, './images')));

module.exports = app;