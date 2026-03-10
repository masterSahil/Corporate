const rewardSchema = require("../model/reward");

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
        const restored = await rewardSchema.findByIdAndUpdate(req.params.id, {isDeleted: false, 
                $unset: { deletedAt: "" } // Removes the deletedAt field completely
            }, { returnDocument: 'after' } 
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
        const {title, category, description, email, status} = req.body;
        const newReward = new rewardSchema({title, category, description, email, 
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
        const {title, category, description, email, isDeleted, status} = req.body;
        const updated = await rewardSchema.findByIdAndUpdate(req.params.id, {title, category, 
            description, email, isDeleted, status}, {returnDocument: 'after'});

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