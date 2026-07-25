const express = require('express')
const router = express.Router();
const rewardController = require("../controller/rewardController");
const {verifyUser} = require("../middleware/auth");

router.get("/reward", verifyUser, rewardController.getReward); // active rewards
router.get("/reward-deleted", verifyUser, rewardController.getSoftDeletedReward); // only deleted rewards
router.get("/reward-all", verifyUser, rewardController.getAllReward); // both deleted & active
router.post("/reward", verifyUser, rewardController.createReward); // new reward
router.put("/reward/:id", verifyUser, rewardController.updateReward); // update
router.put("/reward-restore/:id", verifyUser, rewardController.restoringReward); // restore reward
router.put("/reward-soft-delete/:id", verifyUser, rewardController.softDeleteReward); // soft delete
router.post("/hard-delete-reward/:id", verifyUser, rewardController.permanentDelete); // remove

module.exports = router;