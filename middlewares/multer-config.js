// Modules nécessaires.
const multer = require('multer');
const str = require('@supercharge/strings');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    // Dossier de destination des fichiers.
    destination: function(req, file, callback) {
        callback(null, './images');
    },
    // Nom des fichiers.
    filename: function(req, file, callback) {
        const extension = MIME_TYPES[file.mimetype];
        callback(null, str.random(50) + '.' + extension);
    }
});

// On autorise seulement les images.
const imageFilter = function(req, file, callback) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        return callback(null, false);
    }
    callback(null, true);
};

module.exports = multer({ storage: storage, fileFilter: imageFilter, limits : { fileSize : 5000000 } }).single("image");