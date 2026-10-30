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

// GET /api/sessions/activity?days=365 — daily study hours for heatmap
router.get("/activity", protect, async (req, res) => {
  try {
    const days = Math.min(Number(req.query.days) || 365, 730);

    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const activity = await StudySession.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Asia/Kolkata",
            },
          },
          hours: { $sum: "$hoursStudied" },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: activity.map((a) => ({
        date: a._id,
        hours: Number(a.hours.toFixed(2)),
        sessions: a.sessions,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;