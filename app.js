const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());

// Auth.
const registerRoutes = require('./routes/auth');
app.use('/api/auth', registerRoutes);

module.exports = app;

// Connexion à la base de données.
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://openclassrooms:<password>@cluster0.ttoun.mongodb.net/openclassrooms?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connexion à la base de données réussie !'))
.catch(() => console.log('Connexion à la base de données échouée !'));