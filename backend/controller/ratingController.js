const ratingSchema = require("../model/rating")

module.exports.getAllRatings = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 0;
        const skip = (page - 1) * limit;

        const [rating, totalItems] = await Promise.all([
            ratingSchema.find().populate("buyerId", "username").populate("productId", "name").sort({createdAt: -1}).skip(skip).limit(limit),
            ratingSchema.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            rating,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                pageSize: limit,
            }
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