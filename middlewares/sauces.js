const fs = require('fs');

// Fonction permettant de supprimer une image.
function deleteImage (filename) {
	return new Promise(function(resolve, reject) {
		fs.unlink(`./images/${filename}`, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve("L'image a été supprimée.");
			}
		});
	});
};
module.exports.deleteImage = deleteImage;

// Fonction permettant de savoir si l'utilisateur a aimé une sauce.
async function isUserLiked(usersLiked, userId) {
	return new Promise(function(resolve, reject) {
		try {
			for (i in usersLiked) {
				if (usersLiked[i] == userId) {
					resolve(true);
				} else {
					resolve(false);
				}
			}
		} catch(err) {
			reject(err);
		}
	});
};
module.exports.isUserLiked = isUserLiked;

// Fonction permettant de savoir si l'utilisateur n'a pas aimé une sauce.
async function isUserDisliked(usersDisliked, userId) {
	return new Promise(function(resolve, reject) {
		try {
			for (i in usersDisliked) {
				if (usersDisliked[i] == userId) {
					resolve(true);
				} else {
					resolve(false);
				}
			}
		} catch(err) {
			reject(err);
		}
	});
};
module.exports.isUserDisliked = isUserDisliked;

// Fonction permettant de savoir le type d'avis que l'utilisateur a posté sur une sauce.
async function userReview(sauce, userId) {
	const isUserLiked = await saucesMiddlewares.isUserLiked(sauce.usersLiked, userId);
	const isUserDisliked = await saucesMiddlewares.isUserDisliked(sauce.usersDisliked, userId);
	if (isUserLiked == true) {
		userReview = +1;
	} else if (isUserDisliked == true) {
		userReview = -1;
	} else {
		userReview = 0;
	}
	return userReview;
}
module.exports.userReview = userReview;