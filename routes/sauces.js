const express = require('express');
const router = express.Router();

// Authentification et autres configurations.
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');

const saucesCtrl = require('../controllers/sauces');

// GET : api/sauces.
router.get('/', auth, saucesCtrl.getAll);
// GET : api/sauces/:id.
router.get('/:id', auth, saucesCtrl.getId);
// POST : api/sauces.
router.post('/', auth, multer, saucesCtrl.post);
// DELETE : api/sauces/:id.
router.delete('/:id', auth, saucesCtrl.deleteId);

module.exports = router;