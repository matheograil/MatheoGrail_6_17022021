const User = require('../models/user');

// Modules nécessaires.
const bcrypt = require('bcrypt');
const { Validator } = require('node-input-validator');

// API : auth/signup.
exports.signup = (req, res, next) => {
    const UserValidator = new Validator(req.body, {
        email: 'required|email|maxLength:50',
        password: 'required|minLength:10|maxLength:100'
    });
    UserValidator.check().then((matched) => {
        if (matched) {
            User.exists({ email: req.body.email}, function (err, doc) {
                if (err) {
                    res.status(500).json({ message: "Erreur lors de la requête SQL permettant permettant de savoir si l'utilisateur existe déjà." });
                } else {
                    if (doc == false) {
                        bcrypt.hash(req.body.password, 10)
                        .then(hash => {
                            const user = new User({
                                email: req.body.email,
                                password: hash,
                            });
                            user.save()
                            .then(() => res.status(201).json({ message: 'Succès.' }))
                            .catch(() => res.status(500).json({ message: "Erreur lors de la requête SQL permettant d'enregistrer l'utilisateur." }));
                        })
                        .catch(() => res.status(500).json({ message: 'Erreur lors du hachage du mot de passe.' }));
                    } else {
                        res.status(400).json({ message: "L'utilisateur existe déjà dans notre base de données." });
                    }
                }
            });
        } else {
            res.status(400).json({ message: 'Les données envoyées ne sont pas valides.' });
        }
    });
};