const Sauce = require('../models/sauce');

// Modules nécessaires.
const fs = require('fs');
const sanitize = require('mongo-sanitize');

// Fonction permettant de supprimer une image.
function deleteImage (filename) {
	return new Promise(function(resolve, reject) {
		fs.unlink(`./images/${filename}`, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve("Success");
			}
		});
	});
};
module.exports.deleteImage = deleteImage;

// Fonction permettant de savoir si l'utilisateur a aimé ou non une sauce.
async function isUserHaveReview(array, userId) {
	return new Promise(function(resolve, reject) {
		try {
			let total = 0;
			for (i in array) {
				if (array[i] == userId) {
					let resolve = true;
					total++;
				}
			}
			if (resolve == true) {
				console.log(total);
				resolve({result: true, iterations: i});
			} else {
				resolve({result: false});
			}
		} catch(err) {
			reject(err);
		}
	});
};
module.exports.isUserHaveReview = isUserHaveReview;

// Fonction permettant d'aimer ou non une sauce.
function review(array, userId, iterations, action) {
	return new Promise(function(resolve, reject) {
		try {
			if (action == 'put') {
				array.push(userId);
			} else if (action == 'delete') {
				delete array[iterations];
			}
			resolve(array);
		} catch(err) {
			reject(err);
		}
	});
};
module.exports.review = review;

// Fonction permettant de mettre à jour la sauce avec l'avis de l'utilisateur.
function putReview(usersLiked, usersDisliked, sauceId) {
	return new Promise(function(resolve, reject) {
		if (usersLiked && usersDisliked) {
			Sauce.where('_id', sanitize(sauceId)).update({$set: {usersLiked: usersLiked, usersDisliked: usersDisliked}}, function (err) {
				if (err) {
					reject(err);
				} else {
					resolve("Success");
				}
			});
		} else if (usersDisliked == false) {
			Sauce.where('_id', sanitize(sauceId)).update({$set: {usersLiked: usersLiked}}, function (err) {
				if (err) {
					reject(err);
				} else {
					resolve("Success");
				}
			});
		} else if (usersLiked == false) {
			Sauce.where('_id', sanitize(sauceId)).update({$set: {usersDisliked: usersDisliked}}, function (err) {
				if (err) {
					reject(err);
				} else {
					resolve("Success");
				}
			});
		}
	});
};
module.exports.putReview = putReview;