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