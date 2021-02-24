const express = require('express');
const router = express.Router();

// Authentification et autres configurations.
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');

const saucesCtrl = require('../controllers/sauces');

// API : sauces.
router.get('/', auth, saucesCtrl.getAll);
// API : sauces/:id.
router.get('/:id', auth, saucesCtrl.getId);
// API : sauces.
router.post('/', auth, multer, saucesCtrl.post);

module.exports = router;