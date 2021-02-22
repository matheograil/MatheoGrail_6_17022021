const User = require('../models/user');

// Modules nécessaires.
const bcrypt = require('bcrypt');
const { Validator } = require('node-input-validator');
const jsonwebtoken = require('jsonwebtoken');

// API : auth/signup.
exports.signup = (req, res, next) => {
	const UserValidator = new Validator(req.body, {
		email: 'required|email|maxLength:50',
		password: 'required|minLength:10|maxLength:100'
	});
	UserValidator.check().then((matched) => {
		if (matched) {
			User.findOne({ email: req.body.email })
			.then(user => {
				if (!user) {
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
					return res.status(401).json({ message: "L'utilisateur existe déjà dans notre base de données." });
				}
			})
			.catch(error => res.status(500).json({ message: "Erreur lors de la requête SQL permettant de savoir si l'utilisateur existe déjà." }));
		} else {
			return res.status(401).json({ message: 'Les données envoyées ne sont pas valides.' });
		}
	});
};

// API : auth/login.
exports.login = (req, res, next) => {
	const UserValidator = new Validator(req.body, {
		email: 'required|email|maxLength:50',
		password: 'required|minLength:10|maxLength:100'
	});
	UserValidator.check().then((matched) => {
		if (matched) {
			User.findOne({ email: req.body.email })
			.then(user => {
				if (!user) {
					return res.status(401).json({ message: "Cet utilisateur n'existe pas dans notre base de données." });
				} else {
					bcrypt.compare(req.body.password, user.password)
        			.then(valid => {
          				if (!valid) {
            				return res.status(401).json({ error: 'Le mot de passe est incorrect.' });
          				}
          				res.status(200).json({
            				userId: user._id,
            				token: jwt.sign(
								{ userId: user._id },
								'RANDOM_TOKEN_SECRET',
								{ expiresIn: '24h' }				  
							)
          				});
        			})
        			.catch(error => res.status(500).json({ message: "Impossible de vérifier le mot de passe." }));
				}
			})
			.catch(error => res.status(500).json({ message: "Erreur lors de la requête SQL permettant de savoir si l'utilisateur existe déjà." }));
		} else {
			return res.status(401).json({ message: 'Les données envoyées ne sont pas valides.' });
		}
	});
};