const User = require('../models/user');

// Modules nécessaires.
const bcrypt = require('bcrypt');
const { Validator } = require('node-input-validator');
const jsonwebtoken = require('jsonwebtoken');
const sanitize = require('mongo-sanitize');

// GET : api/auth/signup.
exports.register = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const UserValidator = new Validator({ email: email, password: password }, {
        email: 'required|email|maxLength:50',
        password: 'required|string|lengthBetween:10,100'
    });
    // Vérification des données reçues.
    UserValidator.check().then(matched => {
        if (!matched) {
            return res.status(400).json({ error: 'Les identifiants sont incorrects.' });
        }
        // L'utilisateur existe-t-il ?
        User.findOne({ email: sanitize(email) }).then(user => {
            if (user) {
                return res.status(400).json({ error: 'Cette adresse électronique est déjà utilisée.' });
            }
            // Chiffrement du mot de passe.
            bcrypt.hash(password, 10).then(hash => {
                const user = new User({
                    email: sanitize(email),
                    password: sanitize(hash)
                });
                // Enregistrement dans la base de données.
                user.save()
                .then(() => res.status(200).json({ message: "L'utilisateur a été enregistré." }))
                .catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
            }).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
        }).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
    }).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
};

// POST : api/auth/login.
exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const UserValidator = new Validator({ email: email, password: password }, {
        email: 'required|email|maxLength:50',
        password: 'required|string|lengthBetween:10,100'
    });
    // Vérification des données reçues.
    UserValidator.check().then(matched => {
        if (!matched) {
            return res.status(400).json({ error: 'Les identifiants sont incorrects.' });
        }
        // L'utilisateur existe-t-il ?
        User.findOne({ email: sanitize(email) }).then(user => {
            if (!user) {
                return res.status(400).json({ error: 'Les identifiants sont incorrects.' });
            }
            // Le mot de passe correspond-t-il ?
            bcrypt.compare(password, user.password).then(valid => {
                if (!valid) {
                    return res.status(400).json({ error: 'Les identifiants sont incorrects.' });
                }
                // Enregistrement du jeton d'accès.
                res.status(200).json({
                    userId: user._id,
                    token: jsonwebtoken.sign(
                        { userId: user._id },
                        process.env.JWT_TOKEN,
                        { expiresIn: '12h' }
                    )
                });
            }).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
        }).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
    }).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
};