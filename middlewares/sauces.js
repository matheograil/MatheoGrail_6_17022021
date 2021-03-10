const Sauce = require('../models/sauce');

// Modules nécessaires.
const fs = require('fs');
const sanitize = require('mongo-sanitize');

// Fonction permettant de supprimer une image.
async function deleteImage(filename) {
    fs.unlink(`./images/${filename}`, err => {
        if (err) {
            return('Error');
        }
        return('Success');
    });
};
module.exports.deleteImage = deleteImage;

// Fonction permettant de savoir si l'utilisateur a aimé ou non une sauce.
async function doesUserHaveReview(array, userId) {
    try {
        if (array.indexOf(userId) !== -1) {
            return({result: true, iterations: array.indexOf(userId), totalLikesOrDislikes: array.length});
        }
        return({result: false, totalLikesOrDislikes: array.length})
    } catch {
        return('Error');
    }
};
module.exports.doesUserHaveReview = doesUserHaveReview;

// Fonction permettant d'aimer ou non une sauce.
function review(array, userId, iterations, action, totalLikesOrDislikes) {
    try {
        if (action === 'put') {
            totalLikesOrDislikes++;
            array.push(userId);
        } else if (action === 'delete') {
            totalLikesOrDislikes--;
            array.splice(iterations, 1);
        }
        return({array: array, totalLikesOrDislikes: totalLikesOrDislikes});
    } catch {
        return('Error');
    }
};
module.exports.review = review;

// Fonction permettant de mettre à jour la sauce avec l'avis de l'utilisateur.
async function putReview(usersLiked, usersDisliked, sauceId, totalLikesOrDislikes) {
    if (usersLiked) {
        Sauce.where('_id', sanitize(sauceId)).updateOne({ usersLiked: sanitize(usersLiked), likes: sanitize(totalLikesOrDislikes) }).then(() => {
            return('Success');
        }).catch(() => {
            return('Error');
        });
    } else if (usersDisliked) {
        Sauce.where('_id', sanitize(sauceId)).updateOne({ usersDisliked: sanitize(usersDisliked), dislikes: sanitize(totalLikesOrDislikes) }).then(() => {
            return('Success');
        }).catch(() => {
            return('Error');
        });
    }
    return('Error');
};
module.exports.putReview = putReview;