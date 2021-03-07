const Sauce = require('../models/sauce');

// Modules nécessaires.
const { Validator } = require('node-input-validator');
const sanitize = require('mongo-sanitize');
const jsonwebtoken = require('jsonwebtoken');
const saucesMiddlewares = require('../middlewares/sauces');
const { compare } = require('bcrypt');

// GET : api/sauces.
exports.getSauces = (req, res, next) => {
    // Récupération des données.
    Sauce.find().then(sauces => {
        res.status(200).json(sauces);
    }).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
};

// GET : api/sauces/:id.
exports.getSauce = (req, res, next) => {
    const id = req.params.id;
    const SauceIdValidator = new Validator({
        id: 'required|regex:[a-zA-z0123456789]'
    });
    // Vérification des données reçues.
    SauceIdValidator.check().then(matched => {
        if (matched) {
            // La sauce existe-t-elle ?
            Sauce.findOne({ _id: sanitize(id) }).then(sauce => {
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
        userId: 'required|regex:[a-zA-z0123456789]',
        name: 'required|string|maxLength:50',
        manufacturer: 'required|string|maxLength:50',
        description: 'required|string|maxLength:500',
        mainPepper: 'required|string|maxLength:250',
        heat: 'required|integer|between:1,10'
    });
    // On vérifie qu'une image a été selectionnée.
    if (req.file) {
        const filename = req.file.filename;
        // Vérification des données reçues.
        SauceValidator.check().then(matched => {
            if (matched) {
                const sauce = new Sauce({
                    userId: sanitize(sentData.userId),
                    name: sanitize(sentData.name),
                    manufacturer: sanitize(sentData.manufacturer),
                    description: sanitize(sentData.description),
                    mainPepper: sanitize(sentData.mainPepper),
                    imageUrl: sanitize(`${req.protocol}://${req.get('host')}/images/${filename}`),
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
                        saucesMiddlewares.deleteImage(filename);
                        res.status(500).json({ error: "Une erreur s'est produite." });
                    });
            } else {
                //Suppresion de l'image.
                saucesMiddlewares.deleteImage(filename)
                    .then(() => res.status(400).json({ error: 'Les données envoyées sont incorrectes.' }))
                    .catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
            }
        }).catch(() => {
            //Suppresion de l'image.
            saucesMiddlewares.deleteImage(filename);
            res.status(500).json({ error: "Une erreur s'est produite." });
        });
    } else {
        res.status(400).json({ error: 'Les données envoyées sont incorrectes.' });
    }
};

// PUT : api/sauces/:id/like.
exports.putSauce = (req, res, next) => {
    if (req.file) {
        var sentData = JSON.parse(req.body.sauce);
        sentData.id = req.params.id;
    } else {
        var sentData = {
            id: req.params.id,
            userId: req.body.userId,
            name: req.body.name,
            manufacturer: req.body.manufacturer,
            description: req.body.description,
            mainPepper: req.body.mainPepper,
            heat: req.body.heat
        }
    }
    const SauceValidator = new Validator(sentData, {
        id: 'required|regex:[a-zA-z0123456789]',
        userId: 'required|regex:[a-zA-z0123456789]',
        name: 'required|string|maxLength:50',
        manufacturer: 'required|string|maxLength:50',
        description: 'required|string|maxLength:500',
        mainPepper: 'required|string|maxLength:250',
        heat: 'required|integer|between:1,10'
    });
    // Vérification des données reçues.
    SauceValidator.check().then(matched => {
        if (matched) {
            // La sauce existe-t-elle ?
            Sauce.findOne({ _id: sanitize(sentData.id), userId: sanitize(sentData.userId) }).then(sauce => {
                if (!sauce) {
                    res.status(400).json({ error: "La sauce indiquée n'existe pas, ou alors elle ne vous appartient pas." });
                } else if (!sauce && req.file) {
                    //Suppresion de l'image.
                    saucesMiddlewares.deleteImage(req.file.filename)
                        .then(() => res.status(400).json({ error: "La sauce indiquée n'existe pas, ou alors elle ne vous appartient pas." }))
                        .catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
                } else {
                    // Mise à jour de la sauce.
                    Sauce.where('_id', sanitize(sentData.id)).updateOne({ name: sanitize(sentData.name), manufacturer: sanitize(sentData.manufacturer), description: sanitize(sentData.description), mainPepper: sanitize(sentData.mainPepper), heat: sanitize(sentData.heat) })
                        .then(() => {
                            // Une image a-t-elle été selectionnée ?
                            if (req.file) {
                                const filename = req.file.filename;
                                const oldFilename = sauce.imageUrl.split('/');
                                // Suppresion de l'ancienne image.
                                saucesMiddlewares.deleteImage(oldFilename[4]).then(() => {
                                    // Mise à jour de la nouvelle image.
                                    Sauce.where('_id', sanitize(sentData.id)).updateOne({ imageUrl: sanitize(`${req.protocol}://${req.get('host')}/images/${filename}`) }).then(() => {
                                        res.status(200).json({ message: 'La sauce a été modifiée.' });
                                    }).catch(() => {
                                        //Suppresion de l'image.
                                        saucesMiddlewares.deleteImage(filename);
                                        res.status(500).json({ error: "Une erreur s'est produite." });
                                    });
                                }).catch(() => {
                                    //Suppresion de l'image.
                                    saucesMiddlewares.deleteImage(filename);
                                    res.status(500).json({ error: "Une erreur s'est produite." });
                                });
                            } else {
                                res.status(200).json({ message: 'La sauce a été modifiée.' });
                            }
                        })
                        .catch(() => {
                            if (req.file) {
                                //Suppresion de l'image.
                                saucesMiddlewares.deleteImage(req.file.filename);
                            }
                            res.status(500).json({ error: "Une erreur s'est produite." });
                        });
                }
            }).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
        } else if (req.file) {
            //Suppresion de l'image.
            saucesMiddlewares.deleteImage(req.file.filename)
                .then(() => res.status(400).json({ error: 'Les données envoyées sont incorrectes.' }))
                .catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
        } else {
            res.status(400).json({ error: 'Les données envoyées sont incorrectes.' });
        }
    }).catch(() => {
        if (req.file) {
            //Suppresion de l'image.
            saucesMiddlewares.deleteImage(req.file.filename);
        }
        res.status(500).json({ error: "Une erreur s'est produite." });
    });
};

// DELETE : api/sauces/:id.
exports.deleteSauce = (req, res, next) => {
    const id = req.params.id;
    const SauceIdValidator = new Validator({
        id: 'required|regex:[a-zA-z0123456789]'
    });
    // Vérification des données reçues.
    SauceIdValidator.check().then(matched => {
        if (matched) {
            // La sauce existe-t-elle ?
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jsonwebtoken.verify(token, process.env.JWT_TOKEN);
            const userId = decodedToken.userId;
            Sauce.findOne({ _id: sanitize(id), userId: sanitize(userId) }).then(sauce => {
                if (!sauce) {
                    res.status(400).json({ error: "La sauce indiquée n'existe pas, ou alors elle ne vous appartient pas." });
                } else {
                    // Suppresion de la sauce.
                    Sauce.deleteOne({ _id: sanitize(id) }).then(() => {
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
    const id = req.params.id;
    const like = req.body.like;
    const userId = req.body.userId;
    const SauceValidator = new Validator({
        id: 'required|regex:[a-zA-z0123456789]',
        userId: 'required|regex:[a-zA-z0123456789]',
        like: 'required|integer|between:-1,1'
    });
    // Vérification des données reçues.
    SauceValidator.check().then(matched => {
        if (matched) {
            // Récupération de la sauce.
            Sauce.findOne({ _id: sanitize(id) }).then(sauce => {
                if (sauce) {
                    // Fonction permettant de savoir le type d'avis que l'utilisateur a posté sur une sauce.
                    async function userReview(sauce, userId) {
                        const doesUserLiked = await saucesMiddlewares.doesUserHaveReview(sauce.usersLiked, userId);
                        const doesUserDisliked = await saucesMiddlewares.doesUserHaveReview(sauce.usersDisliked, userId);
                        if (doesUserLiked.result) {
                            userReview = +1;
                            i = doesUserLiked.iterations;
                            totalLikesOrDislikes = doesUserLiked.totalLikesOrDislikes;
                        } else if (doesUserDisliked.result) {
                            userReview = -1;
                            i = doesUserDisliked.iterations;
                            totalLikesOrDislikes = doesUserDisliked.totalLikesOrDislikes;
                        } else {
                            userReview = 0;
                            i = 0;
                            totalLikesOrDislikes = { likes: doesUserLiked.totalLikesOrDislikes, dislikes : doesUserDisliked.totalLikesOrDislikes};
                        }
                        return({ userReview: userReview, iterations:i, totalLikesOrDislikes: totalLikesOrDislikes });
                    }
                    // On récupère l'avis actuel de l'utilisateur.
                    userReview(sauce, userId).then(userReview => {
                        switch (userReview.userReview) {
                            // L'utilisateur n'aime pas sauce.
                            case -1:
                                // Il souhaite annuler son avis.
                                if (like == 0) {
                                    const review = saucesMiddlewares.review(sauce.usersDisliked, userId, userReview.iterations, 'delete', userReview.totalLikesOrDislikes);
                                    if (review !== 'Error') {
                                        // Mise à jour de la base de données.
                                        saucesMiddlewares.putReview(false, review.array, id, review.totalLikesOrDislikes).then(() => {
                                            res.status(200).json({ message: "L'avis été pris en compte." });
                                        }).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
                                    } else {
                                        res.status(500).json({ error: "Une erreur s'est produite." });
                                    }
                                } else {
                                    res.status(400).json({ error: "L'utilisateur a déjà effectué cette action." });
                                }
                                break;
                            // L'utilisateur n'a pas encore d'avis.
                            case 0:
                                if (like == +1) {
                                    const review = saucesMiddlewares.review(sauce.usersLiked, userId, userReview.iterations, 'put', userReview.totalLikesOrDislikes.likes);
                                    if (review !== 'Error') {
                                        // Mise à jour de la base de données.
                                        saucesMiddlewares.putReview(review.array, false, id, review.totalLikesOrDislikes).then(() => {
                                            res.status(200).json({ message: "L'avis été pris en compte." });
                                        }).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
                                    } else {
                                        res.status(500).json({ error: "Une erreur s'est produite." });
                                    }
                                } else if (like == -1) {
                                    const review = saucesMiddlewares.review(sauce.usersDisliked, userId, userReview.iterations, 'put', userReview.totalLikesOrDislikes.dislikes);
                                    if (review !== 'Error') {
                                        // Mise à jour de la base de données.
                                        saucesMiddlewares.putReview(false, review.array, id, review.totalLikesOrDislikes).then(() => {
                                            res.status(200).json({ message: "L'avis été pris en compte." });
                                        }).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
                                    } else {
                                        res.status(500).json({ error: "Une erreur s'est produite." });
                                    }
                                } else {
                                    res.status(400).json({ error: "L'utilisateur a déjà effectué cette action." });
                                }
                                break;
                            // L'utilisateur aime la sauce.
                            case +1:
                                if (like == 0) {
                                    const review = saucesMiddlewares.review(sauce.usersLiked, userId, userReview.iterations, 'delete', userReview.totalLikesOrDislikes);
                                    if (review !== 'Error') {
                                        // Mise à jour de la base de données.
                                        saucesMiddlewares.putReview(review.array, false, id, review.totalLikesOrDislikes).then(() => {
                                            res.status(200).json({ message: "L'avis été pris en compte." });
                                        }).catch(() => res.status(500).json({ error: "Une erreur s'est produite." }));
                                    } else {
                                        res.status(500).json({ error: "Une erreur s'est produite." });
                                    }
                                } else {
                                    res.status(400).json({ error: "L'utilisateur a déjà effectué cette action." });
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
};