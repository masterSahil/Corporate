const ratingController = require("../controller/ratingController")
const express = require("express")
const router = express.Router();

router.get("/rating-all", ratingController.getAllRatings);
router.get("/rating", ratingController.getRating);
router.post("/rating", ratingController.createRating);
router.put("/rating/:id", ratingController.updateRating);
router.delete("/rating/:id", ratingController.deleteRating);

module.exports = router;