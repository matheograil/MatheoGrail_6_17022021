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
					resolve({result: true, iterations: i});
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
					resolve({result: true, iterations: i});
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

// Fonction permettant d'aimer une sauce.
async function likeSauce(sauce, userId, iterations) {
	return new Promise(function(resolve, reject) {
		try {
			
		} catch(err) {
			reject(err);
		}
	});
};
module.exports.likeSauce = likeSauce;

// Fonction permettant de ne pas aimer une sauce.
async function dislikeSauce(sauce, userId, iterations) {
	return new Promise(function(resolve, reject) {
		try {
			
		} catch(err) {
			reject(err);
		}
	});
};
module.exports.dislikeSauce = dislikeSauce;