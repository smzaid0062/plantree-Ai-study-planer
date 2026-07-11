import Topic from "../models/Topic.js";
import Subject from "../models/Subject.js";

export const createTopics = async (req, res) => {
  try {
    const { subjectId, topics } = req.body;

    if (!subjectId || !topics?.length) {
      return res.status(400).json({ success: false, message: "SubjectId and topics required" });
    }

    const created = await Topic.insertMany(
      topics.map((t, i) => ({
        userId: req.user._id,
        subjectId,
        title: t.title,
        estimatedHours: t.estimatedHours || 1,
        order: i,
      }))
    );

    await Subject.findByIdAndUpdate(subjectId, {
      totalTopics: created.length,
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find({
      userId: req.user._id,
      subjectId: req.params.subjectId,
    }).sort({ order: 1 });
    res.status(200).json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTopicStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const topic = await Topic.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        status,
        completedAt: status === "done" ? new Date() : null,
      },
      { new: true }
    );

    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    // Update subject completed count
    const completedCount = await Topic.countDocuments({
      subjectId: topic.subjectId,
      status: "done",
    });

    await Subject.findByIdAndUpdate(topic.subjectId, {
      completedTopics: completedCount,
    });

    res.status(200).json({ success: true, data: topic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTodayTopics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const topics = await Topic.find({
      userId: req.user._id,
      scheduledDate: { $gte: today, $lt: tomorrow },
    }).populate("subjectId", "name color examDate");

    res.status(200).json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};