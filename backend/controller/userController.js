const UserSchema = require("../model/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cloudinary = require("../config/Cloudinary")

module.exports.FetchSingleUser = async (req, res) => {
    try {
        const user = await UserSchema.findById(req.params.id);

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

// get each user
module.exports.FetchAllUsers = async (req, res) => {
    try {
        const getUser = await UserSchema.find();

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

// Crud on Users
module.exports.FetchDeletedOnly = async (req, res) => {
    try {
        const getUser = await UserSchema.find({ isDeleted: true });

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

// restore user
module.exports.RestoreUser = async (req, res) => {
    try {
        const restored = await UserSchema.findByIdAndUpdate(req.params.id, 
            { isDeleted: false, deletedAt: null }, { returnDocument: 'after' });

        if (!restored) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            users: restored,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// permanent delete
module.exports.PermanentDelete = async (req, res) => {
    try {
        const {password} = req.body;
        const user = await UserSchema.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found",
            })
        }

        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ authenticated: false, message: "Token not found" });
        }
    
        const decoded = jwt.verify(token, process.env.SECRET);
        const loggedInAdmin = await UserSchema.findOne({email: decoded.email});
        const isTruePassword = await bcrypt.compare(password, loggedInAdmin.password);

        if (!isTruePassword) {
            return res.status(409).json({
                success: false,
                message: "Invalid Password",
            }) 
        }

        // Delete Cloudinary image if exists
        if (user.profile?.imagePublicId) {
            await cloudinary.uploader.destroy(user.profile.imagePublicId);
        }
        const permanentDelete = await UserSchema.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            users: permanentDelete,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
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
        const {username, email, password, gender, phoneNumber, role, profile, department, employment} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        const user = await UserSchema.findOne({email});
        if(user) return res.status(409).json({success: false, message: "User Already Exists With Same Email"});

        const hash_password = await bcrypt.hash(password, 10);
        const userData = {username, email, password: hash_password, gender, phoneNumber, role, department, employment, profile};

        if (req.file) {
            userData.profile = { imageUrl: req.file.path, imagePublicId: req.file.filename };
        }

        const created = new UserSchema(userData);
        await created.save();

        res.status(201).json({
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
    const { username, email, password, gender, phoneNumber, role, department, employment, points, profile } = req.body;

    const user = await UserSchema.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = { username, email, gender, phoneNumber, role, department, employment, points };

    // password update
    if (password) {
      userData.password = await bcrypt.hash(password, 10);
    }

    // image update
    if (req.file) {
        if (user.profile?.imagePublicId) {
            await cloudinary.uploader.destroy(user.profile.imagePublicId);
        }
        userData.profile = { imageUrl: req.file.path, imagePublicId: req.file.filename };
    }

    const updatedUser = await UserSchema.findByIdAndUpdate(req.params.id,userData,{returnDocument: 'after'});

    res.status(200).json({
      success: true,
      users: updatedUser,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.DeleteImage = async (req, res) => {
    try {
        const user = await UserSchema.findById(req.params.id);

        if (user?.profile?.imagePublicId) {
            await cloudinary.uploader.destroy(user.profile.imagePublicId);
        }

        res.status(200).json({
            success: true,
            users: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports.SoftDeletedUser = async (req, res) => {
    try {
        const softDelete = await UserSchema.findByIdAndUpdate(req.params.id, {isDeleted: true, deletedAt: new Date()}, 
            {returnDocument: 'after'});

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
        const removed = await UserSchema.findByIdAndDelete(req.params.id);

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

// Register, Login, Authorization, Logout, New Password
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

        const token = jwt.sign({userId: newUser._id, role: newUser.role, email: newUser.email}, process.env.SECRET, { expiresIn: '7d' });
        
        // local dev         = secure: false; sameSite: "lax"
        // Deploy with https = secure: true; sameSite: "none"

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

        if (user && !user.password) {
            return res.status(401).json({
                success: false,
                message: "This account was created using Google. Please log in with Google."
            })
        }
        if (user.isDeleted) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Contact admin to Login again.",
            });
        }
        
        const passwordTrue = await bcrypt.compare(password, user.password);

        if (!passwordTrue) {
            return res.status(401).json({
                success: false,
                message: "Email or Password is Wrong",
            })
        }

        const token = jwt.sign({userId: user._id, role: user.role, email: user.email}, process.env.SECRET, { expiresIn: '7d' });
        
        // Deploy with https = secure: true; sameSite: "none"

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
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ authenticated: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);

        const user = await UserSchema.findOne({email: decoded.email});
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

module.exports.changePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        const user = await UserSchema.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Current Password is Invalid",
            });
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New Password can't be same as current password",
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await UserSchema.findByIdAndUpdate(user._id, { password: hashedPassword });
        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};