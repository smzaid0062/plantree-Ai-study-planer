import express from "express";
import protect from "../middleware/auth.middleware.js";
import Topic from "../models/Topic.js";

const router = express.Router();

// GET /api/revision/due — topics whose nextReviewDate is today or earlier
router.get("/due", protect, async (req, res) => {
  try {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const topics = await Topic.find({
      userId: req.user._id,
      "review.nextReviewDate": { $lte: endOfToday },
    })
      .populate("subjectId", "name color")
      .sort({ "review.nextReviewDate": 1 });

    res.status(200).json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;