const rewardSchema = require("../model/reward");
const userSchema = require("../model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// not soft deleted
module.exports.getReward = async (req, res) => {
    try {
        const fetched = await rewardSchema.find({ isDeleted: false});

        res.status(200).json({
            success: true,
            reward: fetched,
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
        const fetched = await rewardSchema.find({ isDeleted: true});

        res.status(200).json({
            success: true,
            reward: fetched,
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
        const fetched = await rewardSchema.find();

        res.status(200).json({
            success: true,
            reward: fetched,
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
        const {title, category, description, email, isDeleted, points, status} = req.body;
        const updated = await rewardSchema.findByIdAndUpdate(req.params.id, {title, category, 
            description, email, isDeleted, status: email ? "Issued" : "Unassigned", points},
             {returnDocument: 'after'});

        res.status(200).json({
            success: true,
            reward: updated,
        })
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
        const token = req.cookies.corporate_token;
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