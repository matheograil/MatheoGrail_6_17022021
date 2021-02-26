// Framework Express.
const express = require('express');
const app = express();

// Permet de manipuler les données reçues via POST.
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// TO DO : header....

// Importation de la configuration.
require('dotenv').config()

// Connexion à la base de données.
const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connexion à la base de données réussie.'))
.catch(() => console.log('Connexion à la base de données échouée.'));

// Les différentes routes.
const registerRoutes = require('./routes/auth');
app.use('/api/auth', registerRoutes);
const saucesRoutes = require('./routes/sauces');
app.use('/api/sauces', saucesRoutes);

// Permet d'accéder aux images statiques.
const path = require('path');
app.use('/images', express.static(path.join(__dirname, './images')));

module.exports = app;