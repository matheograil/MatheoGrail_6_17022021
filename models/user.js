//Modèle pour la table des utilisateurs.
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    id: { type: String, required: false },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model('users', userSchema);