const express = require("express");
const router = express.Router();
const userController = require("../controller/userController")
const {verifyUser} = require("../middleware/auth")

// Registration
router.post('/', userController.RegisterUser);
// Login
router.post('/login-auth', userController.LoginUser);
// Authorization
router.get('/check-role', userController.verifyRole);

// Authentication Check (logged in or not)
router.get('/check-auth', verifyUser);
// Logout
router.get('/remove-auth', userController.LogOut);

router.get('/', userController.FetchUser); // fetch all users
router.post('/fetch-user', userController.FetchSingleUser); // fetch single user

router.post('/create-user', userController.CreateUser); // new User
router.put('/:id', userController.UpdatedUser);// update user

router.put('/delete/:id', userController.SoftDeletedUser); // soft delete
router.delete('/:id', userController.DeleteUser); // hard delete

module.exports = router;