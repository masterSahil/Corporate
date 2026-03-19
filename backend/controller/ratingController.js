const ratingSchema = require("../model/rating")

module.exports.getAllRatings = async(req, res) => {
    try {
        const rating = await ratingSchema.find().populate("buyerId", "username");;

        res.status(200).json({
            success: true,
            rating,
        })
    } catch (error) {
        res.status(501).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports.getRating = async(req, res) => {
    try {
        const rating = await ratingSchema.findById(req.params.id);

        res.status(200).json({
            success: true,
            rating,
        })
    } catch (error) {
        res.status(501).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports.createRating = async(req, res) => {
    try {
        const {productId, buyerId, rate, review} = req.body;
        const rating = new ratingSchema({productId, buyerId, rate, review, createdAt: Date.now()});

        await rating.save();
        res.status(200).json({
            success: true,
            rating,
        })
    } catch (error) {
        res.status(501).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports.updateRating = async(req, res) => {
    try {
        const {productId, buyerId, rate, review} = req.body;
        const rating = await ratingSchema.findByIdAndUpdate(req.params.id, {productId, buyerId, rate, review, createdAt: Date.now()}, {returnDocument: 'after'});

        await rating.save();
        res.status(200).json({
            success: true,
            rating,
        })
    } catch (error) {
        res.status(501).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports.deleteRating = async(req, res) => {
    try {
        const rating = await ratingSchema.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            rating,
        })
    } catch (error) {
        res.status(501).json({
            success: false,
            message: error.message,
        })
    }
}