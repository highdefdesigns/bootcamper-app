// if you bring in a new file make sure to add to server.js

const express = require('express');
const { register, login, getMe } = require('../controllers/auth');

const router = express.Router();

// wherever protect is user has to be logged in to use route
const { protect } = require('../middleware/auth');

// when you goto register route you call register
router.post('/register', register);
// when you goto login you call login
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
