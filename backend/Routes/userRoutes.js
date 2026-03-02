const express = require("express");
const router = express.Router();
const userController = require("../controller/userController")
const {verifyUser} = require("../middleware/auth")

router.get('/check-auth', verifyUser);
router.get('/check-role', userController.verifyRole);
router.get('/', userController.FetchUser);
router.post('/', userController.CreateUser);
router.post('/login-auth', userController.LoginUser);
router.put('/:id', userController.UpdatedUser);
router.put('/:id', userController.SoftDeletedUser);

module.exports = router;