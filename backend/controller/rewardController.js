const rewardSchema = require("../model/reward");

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
        const {title, category, description, email} = req.body;
        const newReward = new rewardSchema({title, category, description, email});

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
        const {title, category, description, email, isDeleted} = req.body;
        const updated = await rewardSchema.findByIdAndUpdate(req.params.id, {title, category, description, email, isDeleted}, {returnDocument: 'after'});

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
        const softDelete = await rewardSchema.findByIdAndUpdate(req.params.id, {isDeleted: true}, {returnDocument: 'after'});

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