const Sauce = require('../models/sauce');

// Modules nécessaires.
const fs = require('fs');
const sanitize = require('mongo-sanitize');

// Fonction permettant de supprimer une image.
function deleteImage(filename) {
    return new Promise(function(resolve, reject) {
        fs.unlink(`./images/${filename}`, err => {
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
            let matched;
            let totalLikesOrDislikes = 0;
            for (i in array) {
                totalLikesOrDislikes++;
                if (array[i] === userId) {
                    matched = true;
                }
            }
            if (matched) {
                resolve({result: true, iterations: i, totalLikesOrDislikes: totalLikesOrDislikes});
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
function review(array, userId, iterations, action, totalLikesOrDislikes) {
    return new Promise(function(resolve, reject) {
        try {
            if (action === 'put') {
                totalLikesOrDislikes++;
                array.push(userId);
            } else if (action === 'delete') {
                totalLikesOrDislikes--;
                array.splice(iterations, 1);
            }
            resolve( {array: array, totalLikesOrDislikes: totalLikesOrDislikes});
        } catch(err) {
            reject(err);
        }
    });
};
module.exports.review = review;

// Fonction permettant de mettre à jour la sauce avec l'avis de l'utilisateur.
function putReview(usersLiked, usersDisliked, sauceId, totalLikesOrDislikes) {
    return new Promise(function(resolve, reject) {
        if (usersLiked) {
            Sauce.where('_id', sanitize(sauceId)).updateOne({ usersLiked: usersLiked, likes: totalLikesOrDislikes }).then(() => {
                resolve('Success');
            }).catch(err => reject(err));
        } else if (usersDisliked) {
            Sauce.where('_id', sanitize(sauceId)).updateOne({ usersDisliked: usersDisliked, dislikes: totalLikesOrDislikes }).then(() => {
                resolve('Success');
            }).catch(err => reject(err));
        } else {
            reject('Error');
        }
    });
};
module.exports.putReview = putReview;