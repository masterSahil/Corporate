const rewardSchema = require("../model/reward");
const userSchema = require("../model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// not soft deleted
module.exports.getReward = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [fetched, totalItems] = await Promise.all([
            rewardSchema.find({ isDeleted: false}).sort({createdAt: -1}).skip(skip).limit(limit),
            rewardSchema.countDocuments({ isDeleted: false})
        ]);

        res.status(200).json({
            success: true,
            reward: fetched,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                pageSize: limit,
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// fetching soft deleted data
module.exports.getSoftDeletedReward = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [fetched, totalItems] = await Promise.all([
            rewardSchema.find({ isDeleted: true}).sort({createdAt: -1}).skip(skip).limit(limit),
            rewardSchema.countDocuments({ isDeleted: true})
        ]);

        res.status(200).json({
            success: true,
            reward: fetched,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                pageSize: limit,
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// restoring reward
module.exports.restoringReward = async (req, res) => {
    try {
        const restored = await rewardSchema.findByIdAndUpdate(req.params.id, {isDeleted: false, deletedAt: null}, { returnDocument: 'after' } 
        );

        if (!restored) {
            return res.status(404).json({
                success: false,
                message: "Reward not found",
            });
        }

        res.status(200).json({
            success: true,
            reward: restored,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports.getAllReward = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [fetched, totalItems] = await Promise.all([
            rewardSchema.find().sort({createdAt: -1}).skip(skip).limit(limit),
            rewardSchema.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            reward: fetched,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                pageSize: limit,
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports.createReward = async (req, res) => {
    try {
        const {title, category, description, email, points, status} = req.body;
        const newReward = new rewardSchema({title, category, description, email, points,
            status: email ? "Issued" : "Unassigned"});

        if (email) {
            const user = await userSchema.findOne({email});
            if (!user) {
                return res.status(501).json({
                    success: false,
                    message: "Employee Not Exists with this Email",
                })
            }
        }

        await newReward.save();
        res.status(200).json({
            success: true,
            reward: newReward,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports.updateReward = async (req, res) => {
    try {
        const { title, category, description, email, isDeleted, points, status } = req.body;
        
        // 1. Fetch the OLD reward first so we know who it belonged to
        const oldReward = await rewardSchema.findById(req.params.id);
        if (!oldReward) {
            return res.status(404).json({ success: false, message: "Reward not found" });
        }

        let finalStatus = status || oldReward.status;
        let finalPoints = points !== undefined ? points : oldReward.points;

        // Check if the reward was already accepted/redeemed by the user
        const wasClaimed = oldReward.status === 'redeemed';

        if (wasClaimed) {
            // SCENARIO 1: Admin removed the email (Unassigned)
            if (!email || email === "") {
                // Find the user using the OLD email from the database
                const originalUser = await userSchema.findOne({ email: oldReward.email });
                if (originalUser) {
                    // Deduct the points (and make sure it doesn't go below 0)
                    const newTotal = Math.max(0, originalUser.points - oldReward.points);
                    await userSchema.findByIdAndUpdate(originalUser._id, { points: newTotal });
                }
                
                finalStatus = "Unassigned";
            } 
            // SCENARIO 2: Admin changed the points (e.g., made them less)
            else if (points !== undefined && points !== oldReward.points) {
                const user = await userSchema.findOne({ email: oldReward.email });
                if (user) {
                    // Calculate the difference. 
                    // Example: Old points = 500, New points = 300. Difference = -200.
                    const difference = points - oldReward.points;
                    const newTotal = Math.max(0, (user.points || 0) + difference);
                    
                    await userSchema.findByIdAndUpdate(user._id, { points: newTotal });
                }
            }
        } else {
            // If the reward was never claimed, just set the status normally
            if (!status) {
                finalStatus = (email && email !== "") ? "Issued" : "Unassigned";
            }
        }

        if (email) {
            const user = await userSchema.findOne({email});
            if (!user) {
                return res.status(501).json({
                    success: false,
                    message: "Employee Not Exists with this Email",
                })
            }
        }

        // 2. Finally, update the reward itself
        const updated = await rewardSchema.findByIdAndUpdate(req.params.id, 
            {title, category, description, email, isDeleted, points: finalPoints, 
                status: finalStatus, updatedAt: new Date()}, { returnDocument: 'after' }
        );

        res.status(200).json({
            success: true,
            reward: updated,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports.softDeleteReward = async (req, res) => {
    try {
        const softDelete = await rewardSchema.findByIdAndUpdate(req.params.id, 
            {isDeleted: true, deletedAt: new Date()}, {returnDocument: 'after'});

        res.status(200).json({
            success: true,
            reward: softDelete,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports.permanentDelete = async (req, res) => {
    try {
        const {password} = req.body;
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Token Not Found",
            })
        }

        const decoded = jwt.verify(token, process.env.SECRET);
        const loggedInUser = await userSchema.findOne({email: decoded.email});
        if (!loggedInUser) {
            return res.status(404).json({
                success: false,
                message: "Failed To Fetch LoggedIn User Data",
            })
        }

        const isTruePassword = await bcrypt.compare(password, loggedInUser.password);
        if (!isTruePassword) {
            return res.status(409).json({
                success: false,
                message: "Password is Invalid",
            })
        }
        const rewardToDelete = await rewardSchema.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            reward: rewardToDelete,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports.deleteReward = async (req, res) => {
    try {
        const remove = await rewardSchema.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            reward: remove,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}