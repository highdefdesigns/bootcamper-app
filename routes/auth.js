// if you bring in a new file make sure to add to server.js

const express = require('express');
const { register, login } = require('../controllers/auth');

const router = express.Router();

// when you goto register route you call register
router.post('/register', register);
// when you goto login you call login
router.post('/login', login);

module.exports = router;
