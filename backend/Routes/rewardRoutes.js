const express = require('express')
const router = express.Router();
const rewardController = require("../controller/rewardController");

router.get("/reward", rewardController.getReward); // not deleted rewards
router.get("/reward-deleted", rewardController.getSoftDeletedReward); // only deleted rewards
router.get("/reward-all", rewardController.getAllReward); // both deleted & not deleted
router.post("/reward", rewardController.createReward); // new reward
router.put("/reward/:id", rewardController.updateReward); // update
router.put("/reward-restore/:id", rewardController.restoringReward); // restore reward
router.put("/reward-soft-delete/:id", rewardController.softDeleteReward); // soft delete
router.post("/hard-delete-reward/:id", rewardController.permanentDelete); // remove

module.exports = router;