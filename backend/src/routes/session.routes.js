import express from "express";
import protect from "../middleware/auth.middleware.js";
import StudySession from "../models/StudySession.js";
import Topic from "../models/Topic.js";

const router = express.Router();

// POST /api/sessions — save session
router.post("/", protect, async (req, res) => {
  try {
    const { topicId, hoursStudied, notes } = req.body;

    if (!topicId || !hoursStudied) {
      return res.status(400).json({ success: false, message: "topicId and hoursStudied required" });
    }

    const session = await StudySession.create({
      userId: req.user._id,
      topicId,
      hoursStudied,
      notes: notes || "",
      date: new Date(),
    });

    // Topic status in_progress mark karo
    await Topic.findByIdAndUpdate(topicId, { status: "in_progress" });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/sessions — all sessions
router.get("/", protect, async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id })
      .populate("topicId", "title estimatedHours subjectId")
      .sort({ createdAt: -1 })
      .limit(20);

    const totalHours = sessions.reduce((sum, s) => sum + s.hoursStudied, 0);

    res.status(200).json({ success: true, data: sessions, totalHours });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;