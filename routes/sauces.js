const express = require('express');
const router = express.Router();
const saucesCtrl = require('../controllers/sauces');

// Authentification.
const auth = require('../middlewares/auth');

// API : sauces.
router.get('/', auth, saucesCtrl.getAll);
// API : sauces/:id.
router.get('/:id', auth, saucesCtrl.getId);

module.exports = router;