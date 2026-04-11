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

const upload = multer({storage, limits: { fileSize: 1 * 1024 * 1024 }}); // 🔒 1MB limit 

// Registration
router.post('/', userController.RegisterUser);
// Login
router.post('/login-auth', userController.LoginUser);
// Authorization
router.get('/check-role', userController.verifyRole);

// Authentication Check (logged in or not)
router.get('/check-auth', verifyUser);
// Logout
// router.get('/remove-auth', userController.LogOut);

// Change Password
router.patch('/password-change', userController.changePassword);

router.get('/fetch-all-user', userController.FetchUser); // fetch all users
router.get('/fetch-deleted', userController.FetchDeletedOnly); // fetch deleted
router.get('/', userController.FetchUser); // fetch all not soft deleted users
router.get('/fetch-user/:id', userController.FetchSingleUser); // fetch single user

router.post('/create-user', upload.single('file'), userController.CreateUser); // Create User
router.put('/:id', upload.single('file'), userController.UpdatedUser);// update user

// Permanent Delete
router.post('/permanent-delete/:id', userController.PermanentDelete);

router.put('/delete/:id', userController.SoftDeletedUser); // soft delete
router.put('/restore/:id', userController.RestoreUser); // restore soft-deleted user
router.delete('/:id', userController.DeleteUser); // hard delete

router.delete('/image/:id', userController.DeleteImage); // delete image

module.exports = router;