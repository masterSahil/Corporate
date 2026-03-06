const express = require("express");
const router = express.Router();
const userController = require("../controller/userController")
const {verifyUser} = require("../middleware/auth")
const multer = require("multer")
const cloudinary = require("../config/Cloudinary");
const {CloudinaryStorage} = require("multer-storage-cloudinary")

const storage = new CloudinaryStorage({
    cloudinary, 
    params: {
        folder: "corporate_users",
    }
})

const upload = multer({storage});

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

// Change Password
router.patch('/password-change', userController.changePassword);

router.get('/', userController.FetchUser); // fetch all users
router.post('/fetch-user', userController.FetchSingleUser); // fetch single user

router.post('/create-user', upload.single('file'), userController.CreateUser); // new User
router.put('/:id', upload.single('file'), userController.UpdatedUser);// update user

router.put('/delete/:id', userController.SoftDeletedUser); // soft delete
router.delete('/:id', userController.DeleteUser); // hard delete

router.delete('/image/:id', userController.DeleteImage); // delete image

module.exports = router;