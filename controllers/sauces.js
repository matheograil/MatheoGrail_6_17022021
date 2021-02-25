const Sauce = require('../models/sauce');

// Modules nécessaires.
const { Validator } = require('node-input-validator');
const sanitize = require('mongo-sanitize');

// GET : api/sauces.
exports.getAll = (req, res, next) => {
	// Récupération des données.
	Sauce.find({}).then((result) => {
		res.status(200).json(result);
	})
	.catch(() => res.status(500).json({ error: 'Erreur lors de la requête SQL permettant de récupérer les sauces.' }));
};

// GET : api/sauces/:id.
exports.getId = (req, res, next) => {
	const SauceIdValidator = new Validator(req.params, {
		id: 'required|regex:[a-zA-z0123456789]|maxLength:50'
	});
	// Vérification des données reçues.
	SauceIdValidator.check().then((matched) => {
		if (matched) {
			// La sauce existe-t-elle ?
			Sauce.findOne({ _id: sanitize(req.params.id) }).then(result => {
				if (!result) {
					res.status(400).json({ error: "La sauce indiquée n'existe pas." });
				} else {
					res.status(200).json(result);
				}
			})
			.catch(() => res.status(500).json({ error: "Erreur lors de la requête SQL permettant de récupérer la sauce." }));
		} else {
			res.status(400).json({ error: 'Les données envoyées ne sont pas valides.' });
		}
	})
	.catch(() => res.status(500).json({ error: 'Impossible de vérifier les données.' }));
};

// POST : api/sauces.
exports.post = (req, res, next) => {
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
			.catch(() => res.status(500).json({ error: "Erreur lors de la requête SQL permettant d'enregistrer la sauce." }));
		} else {
			res.status(400).json({ error: 'Les données envoyées ne sont pas valides.' });
		}
	})
	.catch(() => res.status(500).json({ error: 'Impossible de vérifier les données.' }));
};

// DELETE : api/sauces/:id.
exports.deleteId = (req, res, next) => {
	const SauceIdValidator = new Validator(req.params, {
		id: 'required|regex:[a-zA-z0123456789]|maxLength:50'
	});
	// Vérification des données reçues.
	SauceIdValidator.check().then((matched) => {
		if (matched) {
			// La sauce existe-t-elle ?
			Sauce.findOne({ _id: sanitize(req.params.id) }).then(result => {
				if (!result) {
					res.status(400).json({ error: "La sauce indiquée n'existe pas." });
				} else {
					// Suppresion de la sauce.
					Sauce.deleteOne({ _id: sanitize(req.params.id) }).then(() => {
						res.status(200).json({ message: 'La sauce a été supprimée.' })
					})
					.catch(() => res.status(500).json({ error: "Erreur lors de la requête SQL permettant de supprimer la sauce." }));
				}
			})
			.catch(() => res.status(500).json({ error: "Erreur lors de la requête SQL permettant de récupérer la sauce." }));
		} else {
			res.status(400).json({ error: 'Les données envoyées ne sont pas valides.' });
		}
	})
	.catch(() => res.status(500).json({ error: 'Impossible de vérifier les données.' }));
};