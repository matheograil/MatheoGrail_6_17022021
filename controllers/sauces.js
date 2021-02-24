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
	console.log(req.body.sauce['name']);
	const thingObject = JSON.parse(req.body.thing);
	delete thingObject._id;
	const thing = new Thing({
		...thingObject,
		imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
	});
	thing.save()
	.then(() => res.status(201).json({ message: 'Objet enregistré !'}))
	.catch(error => res.status(400).json({ error }));
};