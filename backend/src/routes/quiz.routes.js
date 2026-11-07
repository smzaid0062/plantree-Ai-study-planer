import express from "express";
import protect from "../middleware/auth.middleware.js";
import Topic from "../models/Topic.js";
import Subject from "../models/Subject.js";
import { generateAIResponse } from "../config/ai.js";
import { awardXp } from "../utils/xp.js";
import { accuracyToQuality, nextReview } from "../utils/sm2.js";

const router = express.Router();

// Multi-stage JSON parsing for AI output
const parseJsonArray = (text) => {
  try { return JSON.parse(text); } catch {}
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  try {
    return JSON.parse(text.replace(/```json/gi, "").replace(/```/g, "").trim());
  } catch {
    return null;
  }
};

// POST /api/quiz/generate — body: { subjectId }
router.post("/generate", protect, async (req, res) => {
  try {
    const { subjectId } = req.body;
    if (!subjectId) {
      return res.status(400).json({ success: false, message: "subjectId is required" });
    }

    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    const topics = await Topic.find({ subjectId, userId: req.user._id });
    if (topics.length === 0) {
      return res.status(400).json({ success: false, message: "No topics found for this subject" });
    }

    const topicTitles = topics.map((t) => t.title);
    const completed = topics.filter((t) => t.status === "done").length;
    const completionRate = Math.round((completed / topics.length) * 100);

    const prompt = `You are an expert quiz generator for the subject "${subject.name}".

Generate exactly 10 multiple choice questions.
Allowed topics (the "topic" field MUST be one of these exact strings): ${JSON.stringify(topicTitles)}

Rules:
1. Each question tests exactly one topic from the allowed list
2. Spread the questions across the topics; do not use any other topic
3. Exactly 4 options (A, B, C, D) and exactly one correct option
4. Include a brief explanation for the correct answer
5. Difficulty mix: 3 easy, 4 medium, 3 hard
6. Return ONLY a valid JSON array, no markdown, no explanation

Format:
[{"topic":"exact topic title","question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"B","explanation":"..."}]`;

    const responseText = await generateAIResponse(prompt);
    const parsed = parseJsonArray(responseText);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return res.status(500).json({ success: false, message: "Failed to generate quiz. Try again." });
    }

    // Unknown topic strings ko null kar do, taaki SM-2 galat topic ko update na kare
    const questions = parsed.slice(0, 10).map((q) => ({
      ...q,
      topic: topicTitles.includes(q.topic) ? q.topic : null,
    }));

    res.status(200).json({
      success: true,
      data: {
        subjectId: subject._id,
        subjectName: subject.name,
        totalTopics: topics.length,
        completionRate,
        questions,
      },
    });
  } catch (error) {
    console.error("Quiz generate error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/quiz/complete
// body: { subjectId, score, total, results: [{ topic, correct }] }
router.post("/complete", protect, async (req, res) => {
  try {
    const { subjectId, score = 0, total = 10, results = [] } = req.body;

    // XP (existing behaviour)
    const amount = 10 + Math.round(score * 2);
    const xp = await awardXp(req.user._id, amount, `Quiz: ${score}/${total}`);

    // Group answers by topic title
    const byTopic = {};
    for (const r of results) {
      if (!r?.topic) continue;
      byTopic[r.topic] ??= { correct: 0, total: 0 };
      byTopic[r.topic].total += 1;
      if (r.correct) byTopic[r.topic].correct += 1;
    }

    // SM-2 update for each topic that was tested
    const revision = [];
    if (subjectId && Object.keys(byTopic).length > 0) {
      const topics = await Topic.find({ subjectId, userId: req.user._id });

      for (const topic of topics) {
        const stats = byTopic[topic.title];
        if (!stats) continue;

        const quality = accuracyToQuality(stats.correct, stats.total);
        const next = nextReview(topic.review, quality);

        topic.review = next;
        await topic.save();

        revision.push({
          topicId: topic._id,
          title: topic.title,
          quality,
          intervalDays: next.interval,
          nextReviewDate: next.nextReviewDate,
        });
      }
    }

    res.status(200).json({ success: true, data: { xp, revision } });
  } catch (error) {
    console.error("Quiz complete error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;