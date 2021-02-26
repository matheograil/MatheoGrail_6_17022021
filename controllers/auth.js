const User = require('../models/user');

// Modules nécessaires.
const bcrypt = require('bcrypt');
const { Validator } = require('node-input-validator');
const jsonwebtoken = require('jsonwebtoken');
const sanitize = require('mongo-sanitize');

// GET : api/auth/signup.
exports.signup = (req, res, next) => {
	const UserValidator = new Validator(req.body, {
		email: 'required|email|maxLength:50',
		password: 'required|string|lengthBetween:10,100'
		// TO DO : mettre une majuscule, miniscule...
	});
	// Vérification des données reçues.
	UserValidator.check().then((matched) => {
		if (matched) {
			// L'utilisateur existe-t-il ?
			User.findOne({ email: sanitize(req.body.email) }).then(result => {
				if (!result) {
					// Chiffrement du mot de passe.
					bcrypt.hash(req.body.password, 10).then(hash => {
						const user = new User({
							email: sanitize(req.body.email),
							password: hash
						});
						// Enregistrement dans la base de données.
						user.save()
						.then(() => res.status(200).json({ message: "L'utilisateur a été enregistré." }))
						.catch(() => res.status(500));
					})
					.catch(() => res.status(500));
				} else {
					res.status(400).json({ error: 'Cette adresse électronique est déjà utilisée.' });
				}
			})
			.catch(() => res.status(500));
		} else {
			res.status(400).json({ error: 'Les identifiants sont incorrects.' });
		}
	})
	.catch(() => res.status(500));
};

// POST : api/auth/login.
exports.login = (req, res, next) => {
	const UserValidator = new Validator(req.body, {
		email: 'required|email|maxLength:50',
		password: 'required|string|lengthBetween:10,100'
	});
	// Vérification des données reçues.
	UserValidator.check().then((matched) => {
		if (matched) {
			// L'utilisateur existe-t-il ?
			User.findOne({ email: sanitize(req.body.email) }).then(result => {
				if (!result) {
					res.status(400).json({ error: 'Les identifiants sont incorrects.' });
				} else {
					// Le mot de passe correspond-t-il ?
					bcrypt.compare(req.body.password, result.password).then(valid => {
		  				if (!valid) {
							res.status(400).json({ error: 'Les identifiants sont incorrects.' });
		  				} else {
							// Enregistrement du jeton d'accès.
							res.status(200).json({
								userId: result._id,
								token: jsonwebtoken.sign(
									{ userId: result._id },
									'RANDOM_TOKEN_SECRET',
									{ expiresIn: '12h' }
									
									//TO DO : dotenv
								)
							});
						}
					})
					.catch(() => res.status(500));
				}
			})
			.catch(() => res.status(500));
		} else {
			res.status(400).json({ error: 'Les identifiants sont incorrects.' });
		}
	})
	.catch(() => res.status(500));
};