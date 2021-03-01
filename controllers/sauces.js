const Sauce = require('../models/sauce');

// Modules nécessaires.
const { Validator } = require('node-input-validator');
const sanitize = require('mongo-sanitize');
const jsonwebtoken = require('jsonwebtoken');
const saucesMiddlewares = require('../middlewares/sauces');

// GET : api/sauces.
exports.getSauces = (req, res, next) => {
	// Récupération des données.
	Sauce.find({}).then((sauces) => {
		res.status(200).json(sauces);
	}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
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
			}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
		} else {
			res.status(400).json({ error: 'Les données envoyées sont incorrectes.' });
		}
	}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
};

// POST : api/sauces.
exports.postSauce = (req, res, next) => {
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
				usersLiked: new Array(),
				usersDisliked: new Array()
			});
			// Enregistrement dans la base de données.
			sauce.save()
			.then(() => res.status(200).json({ message: 'La sauce a été enregistrée.' }))
			.catch(() => { 
				//Suppresion de l'image.
				saucesMiddlewares.deleteImage(req.file.filename);
				res.status(500).json({ error: "Une erreur s'est produite." });
			});
		} else {
			//Suppresion de l'image.
			saucesMiddlewares.deleteImage(req.file.filename)
				.then(() => res.status(400).json({ error: 'Les données envoyées sont incorrectes.' }))
				.catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
		}
	}).catch(() => {
		//Suppresion de l'image.
		saucesMiddlewares.deleteImage(req.file.filename);
		res.status(500).json({ error: "Une erreur s'est produite." });
	});
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
						saucesMiddlewares.deleteImage(filename)
							.then(() => res.status(200).json({ message: 'La sauce a été supprimée.' }))
							.catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
					}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
				}
			}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
		} else {
			res.status(400).json({ error: 'Les données envoyées sont incorrectes.' });
		}
	}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
};

// POST : api/sauces/:id/like.
exports.sauceReview = (req, res, next) => {
	const SauceIdValidator = new Validator(req.params, {
		id: 'required|regex:[a-zA-z0123456789]|maxLength:50'
	});
	// Vérification des données reçues.
	SauceIdValidator.check().then((matched) => {
		if (matched) {
			// Récupération de la sauce.
			Sauce.findOne({ _id: sanitize(req.params.id)}).then(sauce => {
				if (sauce) {
					const token = req.headers.authorization.split(' ')[1];
					const decodedToken = jsonwebtoken.verify(token, process.env.JWT_TOKEN);
					const userId = decodedToken.userId;
					// Fonction permettant de savoir le type d'avis que l'utilisateur a posté sur une sauce.
					async function userReview(sauce, userId) {
						const isUserLiked = await saucesMiddlewares.isUserHaveReview(sauce.usersLiked, userId);
						const isUserDisliked = await saucesMiddlewares.isUserHaveReview(sauce.usersDisliked, userId);
						if (isUserLiked.result) {
							userReview = +1;
							i = isUserLiked.iterations;
							totalLikesOrDislikes = isUserLiked.totalLikesOrDislikes;
						} else if (isUserDisliked.result) {
							userReview = -1;
							i = isUserDisliked.iterations;
							totalLikesOrDislikes = isUserDisliked.totalLikesOrDislikes;
						} else {
							userReview = 0;
							i = 0;
							totalLikesOrDislikes = 0;
						}
						return ({ userReview: userReview, iterations:i, totalLikesOrDislikes: totalLikesOrDislikes });
					}
					// On récupère l'avis actuel de l'utilisateur.
					userReview(sauce, userId).then((userReview) => {
						const like = req.body.like;
						switch (userReview.userReview) {
							case -1:
								if (like == 0) {
									saucesMiddlewares.review(sauce.usersDisliked, userId, userReview.iterations, 'delete', userReview.totalLikesOrDislikes).then((usersDisliked) => {
										// Mise à jour de la base de données.
										saucesMiddlewares.putReview(false, usersDisliked.array, req.params.id, usersDisliked.totalLikesOrDislikes).then(() => {
											res.status(200).json({ message: "L'avis été pris en compte." });
										}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
									}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
								} else if (like == -1) {
									res.status(400).json({ error: "L'utilisateur a déjà effectué cette action." });
								}
								break;
							case 0:
								if (like == +1) {
									saucesMiddlewares.review(sauce.usersLiked, userId, userReview.iterations, 'put', userReview.totalLikesOrDislikes).then((usersLiked) => {
										// Mise à jour de la base de données.
										saucesMiddlewares.putReview(usersLiked.array, false, req.params.id, usersLiked.totalLikesOrDislikes).then(() => {
											res.status(200).json({ message: "L'avis été pris en compte." });
										}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
									}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
								} else if (like == 0) {
									res.status(400).json({ error: "L'utilisateur a déjà effectué cette action." });
								} else if (like == -1) {
									saucesMiddlewares.review(sauce.usersDisliked, userId, userReview.iterations, 'put', userReview.totalLikesOrDislikes).then((usersDisliked) => {
										// Mise à jour de la base de données.
										saucesMiddlewares.putReview(false, usersDisliked.array, req.params.id, usersDisliked.totalLikesOrDislikes).then(() => {
											res.status(200).json({ message: "L'avis été pris en compte." });
										}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
									}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
								}
								break;
							case +1:
								if (like == +1) {
									res.status(400).json({ error: "L'utilisateur a déjà effectué cette action." });
								} else if (like == 0) {
									saucesMiddlewares.review(sauce.usersLiked, userId, userReview.iterations, 'delete', userReview.totalLikesOrDislikes).then((usersLiked) => {
										// Mise à jour de la base de données.
										saucesMiddlewares.putReview(usersLiked.array, false, req.params.id, usersLiked.totalLikesOrDislikes).then(() => {
											res.status(200).json({ message: "L'avis été pris en compte." });
										}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
									}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
								}
						}
					}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
				} else {
					res.status(400).json({ error: "La sauce indiquée n'existe pas." });
				}
			}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
		} else {
			res.status(400).json({ error: 'Les données envoyées sont incorrectes.' });
		}
	}).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
}