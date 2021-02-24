const User = require('../models/user');

// Modules nécessaires.
const bcrypt = require('bcrypt');
const { Validator } = require('node-input-validator');
const jsonwebtoken = require('jsonwebtoken');

// API : auth/signup.
exports.signup = (req, res) => {
	const UserValidator = new Validator(req.body, {
		email: 'required|email|maxLength:50',
		password: 'required|minLength:10|maxLength:100'
	});
	UserValidator.check().then((matched) => {
		if (matched) {
			User.findOne({ email: req.body.email }).then(result => {
				if (!result) {
					bcrypt.hash(req.body.password, 10).then(hash => {
						const user = new User({
							email: req.body.email,
							password: hash,
						});
						user.save()
						.then(() => res.status(200).json({ success: true, message: 'Succès.' }))
						.catch(() => res.status(500).json({ success: false, message: "Erreur lors de la requête SQL permettant d'enregistrer l'utilisateur." }));
					})
					.catch(() => res.status(500).json({ success: false, message: 'Erreur lors du hachage du mot de passe.' }));
				} else {
					res.status(400).json({ success: false, message: "L'utilisateur existe déjà dans notre base de données." });
				}
			})
			.catch(() => res.status(500).json({ success: false, message: "Erreur lors de la requête SQL permettant de savoir si l'utilisateur existe déjà." }));
		} else {
			res.status(400).json({ success: false, message: 'Les données envoyées ne sont pas valides.' });
		}
	})
	.catch(() => res.status(500).json({ success: false, message: 'Impossible de vérifier les données.' }));
};

// API : auth/login.
exports.login = (req, res) => {
	const UserValidator = new Validator(req.body, {
		email: 'required|email|maxLength:50',
		password: 'required|minLength:10|maxLength:100'
	});
	UserValidator.check().then((matched) => {
		if (matched) {
			User.findOne({ email: req.body.email }).then(result => {
				if (!result) {
					res.status(400).json({ success: false, message: "Cet utilisateur n'existe pas dans notre base de données." });
				} else {
					bcrypt.compare(req.body.password, result.password).then(valid => {
		  				if (!valid) {
							res.status(400).json({ success: false, message: 'Le mot de passe est incorrect.' });
		  				} else {
							res.status(200).json({
								success: true,
								userId: result._id,
								token: jsonwebtoken.sign(
									{ userId: result._id },
									'RANDOM_TOKEN_SECRET',
									{ expiresIn: '24h' }				  
								)
							});
						}
					})
					.catch(() => res.status(500).json({ success: false, message: "Impossible de vérifier le mot de passe." }));
				}
			})
			.catch(() => res.status(500).json({ success: false, message: "Erreur lors de la requête SQL permettant de savoir si l'utilisateur existe déjà." }));
		} else {
			res.status(400).json({ success: false, message: 'Les données envoyées ne sont pas valides.' });
		}
	})
	.catch(() => res.status(500).json({ success: false, message: 'Impossible de vérifier les données.' }));
};