const UserSchema = require("../model/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

module.exports.FetchSingleUser = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await UserSchema.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                users: user,
            });
        }

        res.status(200).json({
            success: true,
            users: user,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Crud on Users
module.exports.FetchUser = async (req, res) => {
    try {
        const getUser = await UserSchema.find({ isDeleted: false });

        res.status(200).json({
            success: true,
            users: getUser,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports.CreateUser = async (req, res) => {
    try {
        const {username, email, password, gender, phoneNumber, role} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        const user = await UserSchema.findOne({email});
        if(user) return res.status(409).json({success: false, message: "User Already Exists"});

        const hash_password = await bcrypt.hash(password, 10);
        const created = new UserSchema({username, email, password:hash_password, gender, phoneNumber, role});
        await created.save();

        res.status(200).json({
            success: true,
            users: created,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports.UpdatedUser = async (req, res) => {
    try {
        const {id} = req.params;
        const {username, email, password, gender, phoneNumber, role} = req.body;
        
        const hash_password = await bcrypt.hash(password, 10);
        const updatedUser = await UserSchema.findByIdAndUpdate(id, 
            {username, email, password:hash_password, gender, phoneNumber, role}, { returnDocument: 'after' });

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        
        res.status(200).json({
            success: true,
            users: updatedUser,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports.SoftDeletedUser = async (req, res) => {
    try {
        const {id} = req.params;
        const softDelete = await UserSchema.findByIdAndUpdate(id, {isDeleted: true}, {returnDocument: 'after'});

        if (!softDelete) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            users: softDelete,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports.DeleteUser = async (req, res) => {
    try {
        const {id} = req.params;
        const removed = await UserSchema.findByIdAndDelete(id);

        if (!removed) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            users: removed,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Register, Login, Authorization, Logout
module.exports.RegisterUser = async (req, res) => {
    try {
        const {email, password, role} = req.body;
        const hash_password = await bcrypt.hash(password, 10);

        const user = await UserSchema.findOne({email});

        if (user) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered. Please log in instead.",
            })
        }
        
        const newUser = new UserSchema({email, password:hash_password, role});
        await newUser.save();

        const token = jwt.sign({userId: newUser._id, role: newUser.role, email: newUser.email}, process.env.SECRET, { expiresIn: '1d' });
        
        // local dev         = secure: false; sameSite: "lax"
        // Deploy with https = secure: true; sameSite: "none"
        res.cookie("corporate_token", token, {
            httpOnly: true,      // so JS cannot access it (good security)
            secure: false,       // set true if using HTTPS
            sameSite: "lax",     // "none" for cross-origin on HTTPS
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(201).json({
            success: true,
            users: newUser,
            token
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error,
        })
    }
}

module.exports.LoginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await UserSchema.findOne({email});

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not registered. Please Register instead.",
            })
        }
        
        const passwordTrue = await bcrypt.compare(password, user.password);

        if (!passwordTrue) {
            return res.status(401).json({
                success: false,
                message: "Email or Password is Wrong",
            })
        }

        const token = jwt.sign({userId: user._id, role: user.role, email: user.email}, process.env.SECRET, { expiresIn: '1d' });
        
        // Deploy with https = secure: true; sameSite: "none"
        res.cookie("corporate_token", token, {
            httpOnly: true,      // so JS cannot access it (good security)
            secure: false,       // set true if using HTTPS
            sameSite: "lax",     // "none" for cross-origin on HTTPS
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(201).json({
            success: true,
            users: user,
            token
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error,
        })
    }
}

module.exports.verifyRole = async (req, res) => {
    const token = req.cookies.corporate_token;

    if (!token) {
        return res.status(401).json({ authenticated: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        console.log(decoded.email);

        const user = await UserSchema.findOne({email: decoded.email});
        console.log(user.role)
        res.status(200).json({
            success: true,
            user: user,
            role: user.role,
        })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ authenticated: false });
    }
};

module.exports.LogOut = async (req, res) => {
    try {
        res.clearCookie("corporate_token", {
            httpOnly: true,      // so JS cannot access it (good security)
            secure: false,       // set true if using HTTPS
            sameSite: "lax",     // "none" for cross-origin on HTTPS
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}