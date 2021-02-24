const Sauce = require('../models/sauce');

// Modules nécessaires.
const { Validator } = require('node-input-validator');

// API : sauces.
exports.getAll = (req, res) => {
	Sauce.find({}).then((result) => {
		res.status(200).json(result);
	})
	.catch(() => res.status(500).json({ success: false, message: 'Erreur lors de la requête SQL permettant de récupérer les sauces.' }));
}

// API : sauces/:id.
exports.getId = (req, res) => {
	const SauceIdValidator = new Validator(req.params, {
		id: 'required|regex:[a-zA-z0123456789]|maxLength:50',
	});
	SauceIdValidator.check().then((matched) => {
		if (matched) {
			Sauce.findOne({ _id: req.params.id }).then(result => {
				if (!result) {
					res.status(400).json({ success: false, message: "La sauce indiquée n'existe pas." });
				} else {
					res.status(200).json(result);
				}
			})
			.catch(() => res.status(500).json({ success: false, message: "Erreur lors de la requête SQL permettant de récupérer la sauce." }));
		} else {
			res.status(400).json({ success: false, message: 'Les données envoyées ne sont pas valides.' });
		}
	})
	.catch(() => res.status(500).json({ success: false, message: 'Impossible de vérifier les données.' }));
}

// API : sauces.
exports.post = (req, res) => {
	const sentData = JSON.parse(req.body.sauce);
	const SauceValidator = new Validator(sentData, {
		userId: 'required|regex:[a-zA-z0123456789]|maxLength:50',
		name: 'required|string|maxLength:50',
		manufacturer: 'required|string|maxLength:50',
		description: 'required|string|maxLength:500',
		mainPepper: 'required|string|maxLength:250',
		heat: 'required|integer|between:1,10',
	});
	SauceValidator.check().then((matched) => {
		if (matched) {
			const sauce = new Sauce({
				userId: sentData.userId,
				name: sentData.name,
				manufacturer: sentData.manufacturer,
				description: sentData.description,
				mainPepper: sentData.mainPepper,
				imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
				heat: sentData.heat,
				likes: 0,
				dislikes: 0,
				usersLiked: {},
				usersDisliked: {},
			});
			sauce.save()
			.then(() => res.status(200).json({ success: true, message: 'Succès.' }))
			.catch(() => res.status(500).json({ success: false, message: "Erreur lors de la requête SQL permettant d'enregistrer la sauce." }));
		} else {
			res.status(400).json({ success: false, message: 'Les données envoyées ne sont pas valides.' });
		}
	})
	.catch(() => res.status(500).json({ success: false, message: 'Impossible de vérifier les données.' }));
};