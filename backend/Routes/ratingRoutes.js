const ratingController = require("../controller/ratingController")
const express = require("express")
const router = express.Router();
const {verifyUser} = require("../middleware/auth");

router.get("/rating-all", verifyUser, ratingController.getAllRatings);
router.get("/rating", verifyUser, ratingController.getRating);
router.post("/rating", verifyUser, ratingController.createRating);
router.put("/rating/:id", verifyUser, ratingController.updateRating);
router.delete("/rating/:id", verifyUser, ratingController.deleteRating);

module.exports = router;