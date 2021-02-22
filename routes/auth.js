const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/auth');

//Signup.
router.post('/signup', authCtrl.signup);

module.exports = router;