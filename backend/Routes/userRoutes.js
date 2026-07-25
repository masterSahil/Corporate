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

// Change Password
router.patch('/password-change', verifyUser, userController.changePassword);

router.get('/fetch-all-user', verifyUser, userController.FetchUser); // fetch all users
router.get('/fetch-deleted', verifyUser, userController.FetchDeletedOnly); // fetch deleted (inActive)
router.get('/', verifyUser, userController.FetchUser); // fetch all active users
router.get('/fetch-user/:id', verifyUser, userController.FetchSingleUser); // fetch single user

router.post('/create-user', verifyUser, upload.single('file'), userController.CreateUser); // Create User
router.put('/:id', verifyUser, upload.single('file'), userController.UpdatedUser);// update user

// Permanent Delete
router.post('/permanent-delete/:id', verifyUser, userController.PermanentDelete);

router.put('/delete/:id', verifyUser, userController.SoftDeletedUser); // soft delete
router.put('/restore/:id', verifyUser, userController.RestoreUser); // restore soft-deleted user
router.delete('/:id', verifyUser, userController.DeleteUser); // hard delete

router.delete('/image/:id', verifyUser, userController.DeleteImage); // delete image

module.exports = router;