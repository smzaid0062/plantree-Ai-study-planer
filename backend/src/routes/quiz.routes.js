import express from "express";
import protect from "../middleware/auth.middleware.js";
import Topic from "../models/Topic.js";
import Subject from "../models/Subject.js";
import { generateAIResponse } from "../config/groq.js";

const router = express.Router();

// POST /api/quiz/generate
router.post("/generate", protect, async (req, res) => {
  try {
    const { subjectId } = req.body;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        message: "subjectId is required"
      });
    }

    // Subject fetch karo
    const subject = await Subject.findOne({
      _id: subjectId,
      userId: req.user._id
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
      });
    }

    // Topics fetch karo
    const topics = await Topic.find({
      subjectId,
      userId: req.user._id
    });

    if (topics.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No topics found for this subject"
      });
    }

    // 100% complete check karo (optional — unlock condition)
    const completedCount = topics.filter(t => t.status === "done").length;
    const completionRate = Math.round((completedCount / topics.length) * 100);

    const topicTitles = topics.map(t => t.title).join(", ");

    const prompt = `You are an expert quiz generator for the subject "${subject.name}".

Generate exactly 10 multiple choice questions based on these topics: ${topicTitles}

Rules:
1. Each question must have exactly 4 options (A, B, C, D)
2. Only ONE option is correct
3. Include a brief explanation for the correct answer
4. Questions should test understanding, not just memorization
5. Vary difficulty: 3 easy, 4 medium, 3 hard
6. Return ONLY a valid JSON array, no markdown, no explanation

Format:
[
  {
    "question": "Question text here?",
    "options": {
      "A": "Option A text",
      "B": "Option B text",
      "C": "Option C text",
      "D": "Option D text"
    },
    "correct": "B",
    "explanation": "Brief explanation why B is correct"
  }
]`;

    const responseText = await generateAIResponse(prompt);

    // JSON parse with fallbacks
    let questions;
    try {
      questions = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\[[\s\S]*\]/);
      if (match) {
        try { questions = JSON.parse(match[0]); }
        catch { questions = null; }
      }
    }

    if (!questions || !Array.isArray(questions)) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate quiz. Try again."
      });
    }

    res.status(200).json({
      success: true,
      data: {
        subjectName: subject.name,
        totalTopics: topics.length,
        completionRate,
        questions: questions.slice(0, 10)
      }
    });

  } catch (error) {
    console.error("Quiz generate error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;