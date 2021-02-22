const express = require('express');
const router = express.Router();

// API : auth/signup.
const authCtrl = require('../controllers/auth');
router.post('/signup', authCtrl.signup);

module.exports = router;