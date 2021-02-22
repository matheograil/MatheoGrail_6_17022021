const Sauce = require('../models/sauce');

// API : sauces.
exports.get = (req, res, next) => {
	Sauce.find({}).then((sauces) => {
		res.send(sauces);
	})
	.catch(() => res.status(500).json({ success: false, message: 'Erreur lors de la requête SQL permettant de récupérer les sauces.' }));
}