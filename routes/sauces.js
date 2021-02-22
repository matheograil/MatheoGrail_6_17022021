const express = require('express');
const router = express.Router();
const saucesCtrl = require('../controllers/sauces');

// Authentification.
const auth = require('../middlewares/auth');

// API : sauces.
router.get('/', auth, saucesCtrl.get);

module.exports = router;