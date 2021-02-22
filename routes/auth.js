const express = require('express');
const router = express.Router();

// API : auth/signup.
const authCtrl = require('../controllers/auth');
router.post('/signup', authCtrl.signup);

// API : auth/login.
router.post('/login', authCtrl.login);

module.exports = router;