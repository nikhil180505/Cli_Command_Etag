const express = require('express');
const Routes = require('../Controllers/UserController.js')
const jwt = require('../middleware/jwt.js')

const router = express.Router();

router.post('/user/signup',Routes.Signup);
router.post('/user/login',Routes.login);
router.get('/users',jwt.authenticate,Routes.getallusers);

module.exports = router;