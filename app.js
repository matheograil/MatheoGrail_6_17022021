const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//Permet de manipuler les données reçues via POST.
app.use(bodyParser.json());

// API : auth.
const registerRoutes = require('./routes/auth');
app.use('/api/auth', registerRoutes);

// Importation de la connexion à la base de données.
const db = require('./databaseConnection.js')

module.exports = app;