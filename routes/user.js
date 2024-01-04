const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../../Signup/signup.html'));
});

router.post('/signup', userController.signup);

router.post('/login', userController.login);

module.exports = router;
