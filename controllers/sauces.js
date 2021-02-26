const Sauce = require('../models/sauce');

// Modules nécessaires.
const { Validator } = require('node-input-validator');
const sanitize = require('mongo-sanitize');
const fs = require('fs');
const jsonwebtoken = require('jsonwebtoken');

// GET : api/sauces.
exports.getSauces = (req, res, next) => {
	// Récupération des données.
	Sauce.find({}).then((sauces) => {
		res.status(200).json(sauces);
	})
	.catch(() => res.status(500));
};

// GET : api/sauces/:id.
exports.getSauce = (req, res, next) => {
	const SauceIdValidator = new Validator(req.params, {
		id: 'required|regex:[a-zA-z0123456789]|maxLength:50'
	});
	// Vérification des données reçues.
	SauceIdValidator.check().then((matched) => {
		if (matched) {
			// La sauce existe-t-elle ?
			Sauce.findOne({ _id: sanitize(req.params.id) }).then(sauce => {
				if (!sauce) {
					res.status(400).json({ error: "La sauce indiquée n'existe pas." });
				} else {
					res.status(200).json(sauce);
				}
			})
			.catch(() => res.status(500));
		} else {
			res.status(400).json({ error: 'Les données envoyées sont incorrectes.' });
		}
	})
	.catch(() => res.status(500));
};

// POST : api/sauces.
exports.postSauce = (req, res, next) => {
	//
	// TO DO : Refaire le système d'upload d'image (car même si une erreur se produit, l'image est quand même uploadé).
	//

	const sentData = JSON.parse(req.body.sauce);
	const SauceValidator = new Validator(sentData, {
		userId: 'required|regex:[a-zA-z0123456789]|maxLength:50',
		name: 'required|string|maxLength:50',
		manufacturer: 'required|string|maxLength:50',
		description: 'required|string|maxLength:500',
		mainPepper: 'required|string|maxLength:250',
		heat: 'required|integer|between:1,10'
	});
	// Vérification des données reçues.
	SauceValidator.check().then((matched) => {
		if (matched) {
			const sauce = new Sauce({
				userId: sanitize(sentData.userId),
				name: sanitize(sentData.name),
				manufacturer: sanitize(sentData.manufacturer),
				description: sanitize(sentData.description),
				mainPepper: sanitize(sentData.mainPepper),
				imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
				heat: sanitize(sentData.heat),
				likes: 0,
				dislikes: 0,
				usersLiked: {},
				usersDisliked: {}
			});
			// Enregistrement dans la base de données.
			sauce.save()
			.then(() => res.status(200).json({ message: 'La sauce a été enregistrée.' }))
			.catch(() => res.status(500));
		} else {
			res.status(400).json({ error: 'Les données envoyées sont incorrectes.' });
		}
	})
	.catch(() => res.status(500));
};

// DELETE : api/sauces/:id.
exports.deleteSauce = (req, res, next) => {
	const SauceIdValidator = new Validator(req.params, {
		id: 'required|regex:[a-zA-z0123456789]|maxLength:50'
	});
	// Vérification des données reçues.
	SauceIdValidator.check().then((matched) => {
		if (matched) {
			// La sauce existe-t-elle ?
			const token = req.headers.authorization.split(' ')[1];
			const decodedToken = jsonwebtoken.verify(token, process.env.JWT_TOKEN);
			const userId = decodedToken.userId;
			Sauce.findOne({ _id: sanitize(req.params.id), userId: userId}).then(sauce => {
				if (!sauce) {
					res.status(400).json({ error: "La sauce indiquée n'existe pas, ou alors elle ne vous appartient pas." });
				} else {
					// Suppresion de la sauce.
					Sauce.deleteOne({ _id: sanitize(req.params.id) }).then(() => {
						// Suppresion de l'image.
						const filename = sauce.imageUrl.split('/images/')[1];
						fs.unlink(`images/${filename}`, (err) => {
							if (err) {
								res.status(500);
							} else {
								res.status(200).json({ message: 'La sauce a été supprimée.' });
							}
						})
					})
					.catch(() => res.status(500));
				}
			})
			.catch(() => res.status(500));
		} else {
			res.status(400).json({ error: 'Les données envoyées sont incorrectes.' });
		}
	})
	.catch(() => res.status(500));
};