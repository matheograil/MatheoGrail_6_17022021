const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/auth');

// POST : api/auth/signup.
router.post('/signup', authCtrl.register);
// POST : api/auth/login.
router.post('/login', authCtrl.login);

module.exports = router;