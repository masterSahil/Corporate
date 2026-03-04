const express = require('express')
const router = express.Router();
const rewardController = require("../controller/rewardController");

router.get("/reward", rewardController.getReward);
router.get("/reward-all", rewardController.getAllReward);
router.post("/reward", rewardController.createReward);
router.put("/reward/:id", rewardController.updateReward);
router.put("/reward-soft-delete/:id", rewardController.softDeleteReward);
router.delete("/reward-delete/:id", rewardController.deleteReward);

module.exports = router;