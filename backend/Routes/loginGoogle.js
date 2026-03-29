const express = require('express');
const axios = require('axios');
const User_Schema = require('../model/user'); // Update path
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post('/google-login', async (req, res) => {
    try {
        const { access_token } = req.body;

        // 1. Fetch user profile from Google using the access token
        const googleResponse = await axios.get(`${process.env.GOOGLE_API}${access_token}`);
        
        const { sub: googleId, email, name, picture } = googleResponse.data;

        // 2. Check if the user already exists in your DB
        let user = await User_Schema.findOne({ email });

        if (!user) {
            // 3. If they don't exist, register them automatically
            user = new User_Schema({
                username: name,
                email: email,
                googleId: googleId,
                authProvider: 'google',
                profile: { imageUrl: picture }
            });
            await user.save();
        } else if (!user.googleId) {
            // 4. Optional: Link Google to an existing local account
            user.googleId = googleId;
            user.authProvider = 'google';
            user.profile.imageUrl = user.profile.imageUrl || picture;
            await user.save();
        }

        // 5. Generate YOUR app's session/JWT token here 
        const token = jwt.sign({userId: user._id, role: user.role, email: user.email}, process.env.SECRET, { expiresIn: '7d' });
        
        res.cookie("corporate_token", token, {
            httpOnly: true,      
            secure: true,       
            sameSite: "none",    
            maxAge: 168 * 60 * 60 * 1000 
        });

        res.status(200).json({ 
            success: true,
            users: user 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message, 
        });
    }
});

module.exports = router;