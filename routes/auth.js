const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth');

// API : auth/signup.
router.post('/signup', authCtrl.signup);
// API : auth/login.
router.post('/login', authCtrl.login);

module.exports = router;