const express = require('express');
const router = express.Router();

// Authentification et autres configurations.
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');

const saucesCtrl = require('../controllers/sauces');

// GET : api/sauces.
router.get('/', auth, saucesCtrl.getSauces);
// GET : api/sauces/:id.
router.get('/:id', auth, saucesCtrl.getSauce);
// POST : api/sauces.
router.post('/', auth, multer, saucesCtrl.postSauce);
// PUT : api/sauces/:id.
router.put('/:id', auth, multer, saucesCtrl.putSauce);
// DELETE : api/sauces/:id.
router.delete('/:id', auth, saucesCtrl.deleteSauce);
// POST : api/sauces/:id/like.
router.post('/:id/like', auth, saucesCtrl.sauceReview);

module.exports = router;