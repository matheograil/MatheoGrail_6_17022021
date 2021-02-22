const User = require('../models/user');

// Modules nécessaires.
const bcrypt = require('bcrypt');

// API : auth/signup.
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash,
        });
    user.save()
        .then(() => res.status(201).json({ message: 'Succès.' }))
        .catch(() => res.status(400).json({ message: 'Erreur lors de la requête SQL.' }));
    })
    .catch(() => res.status(500).json({ message: 'Erreur lors du hachage du mot de passe.' }));
};