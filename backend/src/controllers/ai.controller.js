import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { generateAIResponse } from "../config/groq.js";
import Topic from "../models/Topic.js";
import Subject from "../models/Subject.js";

// ── 1. SYLLABUS PARSER ──────────────────────────────────────────
export const parseSyllabus = async (req, res) => {
  try {
    const { subjectId, rawText } = req.body;
    let syllabusText = rawText || "";

    // PDF file uploaded toh extract karo
    if (req.file) {
      const pdfData = await pdfParse(req.file.buffer);
      syllabusText = pdfData.text;
    }

    if (!syllabusText.trim()) {
      return res.status(400).json({
        success: false,
        message: "No syllabus content provided",
      });
    }

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        message: "SubjectId is required",
      });
    }

    // Extract gemini topic 
    const prompt = `
You are an expert academic syllabus analyzer.

Analyze this syllabus and extract all topics/chapters/units.
For each topic, estimate realistic study hours needed (1-8 hours).

Return ONLY a valid JSON array in this exact format, nothing else:
[
  { "title": "Topic name", "estimatedHours": 2 },
  { "title": "Another topic", "estimatedHours": 3 }
]

Rules:
- Extract every unique topic, chapter, or unit
- Merge duplicate or very similar topics
- estimatedHours should be between 1 and 8
- Return ONLY the JSON array, no explanation, no markdown

Syllabus content:
${syllabusText.slice(0, 8000)}
    `;

    const responseText = await generateAIResponse(prompt);

    // JSON parse karo safely
   // Multiple parse attempts
let topics;
try {
  topics = JSON.parse(responseText);
} catch {
  const match = responseText.match(/\[[\s\S]*\]/);
  if (match) {
    try { topics = JSON.parse(match[0]); } catch { topics = null; }
  }
}
if (!topics) {
  try {
    const cleaned = responseText.replace(/```json/gi,"").replace(/```/g,"").trim();
    topics = JSON.parse(cleaned);
  } catch {
    return res.status(500).json({ success: false, message: "AI response parsing failed." });
  }
}

    // Purane topics delete karo (fresh parse)
    await Topic.deleteMany({ subjectId, userId: req.user._id });

    // Naye topics save karo
    const created = await Topic.insertMany(
      topics.map((t, i) => ({
        userId: req.user._id,
        subjectId,
        title: t.title,
        estimatedHours: Math.min(Math.max(t.estimatedHours || 1, 1), 8),
        order: i,
        status: "pending",
      }))
    );

    // Subject ka totalTopics update karo
    await Subject.findByIdAndUpdate(subjectId, {
      totalTopics: created.length,
      completedTopics: 0,
    });

    res.status(200).json({
      success: true,
      message: `${created.length} topics extracted successfully`,
      data: created,
    });
  } catch (error) {
    console.error("Parse syllabus error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 2. PLAN GENERATOR ───────────────────────────────────────────
export const generatePlan = async (req, res) => {
  try {
    const userId = req.user._id;

    // User ki saari subjects + pending topics fetch karo
    const subjects = await Subject.find({ userId });

    if (subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No subjects found. Add subjects first.",
      });
    }

    const allPendingTopics = await Topic.find({
      userId,
      status: { $in: ["pending", "in_progress"] },
    }).populate("subjectId", "name examDate color");

    if (allPendingTopics.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No pending topics found.",
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const dailyHours = req.user.dailyStudyHours || 4;

    // Gemini ke liye context banao
    const topicsForAI = allPendingTopics.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      subject: t.subjectId?.name,
      examDate: t.subjectId?.examDate?.toISOString().split("T")[0],
      estimatedHours: t.estimatedHours,
    }));

    const prompt = `
You are an expert study planner.

Create a day-by-day study schedule starting from today: ${today}
Student can study ${dailyHours} hours per day maximum.

Topics to schedule (JSON):
${JSON.stringify(topicsForAI, null, 2)}

Rules:
1. Schedule ALL topics before their subject's examDate
2. Do not exceed ${dailyHours} hours per day
3. Keep harder/larger topics earlier
4. Mix topics from different subjects on same day if possible
5. Return ONLY a valid JSON array, no explanation

Return format:
[
  { "topicId": "topic_id_here", "scheduledDate": "2026-07-15" },
  { "topicId": "another_id", "scheduledDate": "2026-07-15" }
]
    `;

    const responseText = await generateAIResponse(prompt);

    let schedule;
    try {
      const cleaned = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      schedule = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({
        success: false,
        message: "AI plan generation failed. Try again.",
      });
    }

    // Topics ko scheduled dates ke saath update karo
    const updatePromises = schedule.map((item) =>
      Topic.findByIdAndUpdate(item.topicId, {
        scheduledDate: new Date(item.scheduledDate),
        status: "pending",
      })
    );

    await Promise.all(updatePromises);

    // Updated topics fetch karo
    const updatedTopics = await Topic.find({
      userId,
      scheduledDate: { $ne: null },
    }).populate("subjectId", "name color examDate");

    res.status(200).json({
      success: true,
      message: `Study plan generated for ${schedule.length} topics`,
      data: updatedTopics,
    });
  } catch (error) {
    console.error("Generate plan error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 3. ADAPTIVE REPLANNER ────────────────────────────────────────
export const replan = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const missedTopics = await Topic.find({
      userId,
      status: { $in: ["pending", "in_progress"] },
      scheduledDate: { $lt: today },
    }).populate("subjectId", "name examDate");

    const futurePendingTopics = await Topic.find({
      userId,
      status: { $in: ["pending", "in_progress"] },
      scheduledDate: { $gte: today },
    }).populate("subjectId", "name examDate");

    const allTopicsToReplan = [...missedTopics, ...futurePendingTopics];

    if (allTopicsToReplan.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No topics need replanning. You are on track! 🎉",
        data: [],
      });
    }

    const todayStr = today.toISOString().split("T")[0];
    const dailyHours = req.user.dailyStudyHours || 4;

    const topicsForAI = allTopicsToReplan.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      subject: t.subjectId?.name,
      examDate: t.subjectId?.examDate?.toISOString().split("T")[0],
      estimatedHours: t.estimatedHours,
      wasMissed: t.scheduledDate < today,
    }));

   const prompt = `You are a study planner. Replan these topics starting from ${todayStr}.
Student studies ${dailyHours} hours per day maximum.

Topics to replan:
${JSON.stringify(topicsForAI)}

IMPORTANT RULES:
1. Return ONLY a raw JSON array — no markdown, no backticks
2. Each topic must appear EXACTLY ONCE in the output
3. Use field name "topicId" not "id"
4. Start from today: ${todayStr}
5. Max ${dailyHours} hours per day
6. Schedule before examDate

Example output:
[{"topicId":"abc123","scheduledDate":"2026-07-11"},{"topicId":"def456","scheduledDate":"2026-07-12"}]`;

    const responseText = await generateAIResponse(prompt);

    // Debug log
    console.log("Replan AI raw response:", responseText);

    // Multiple parse attempts
    let newSchedule;

    // Attempt 1 — direct parse
    try {
      newSchedule = JSON.parse(responseText);
    } catch {
      // Attempt 2 — extract JSON array
      const match = responseText.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          newSchedule = JSON.parse(match[0]);
        } catch {
          newSchedule = null;
        }
      }
    }

    // Attempt 3 — clean and parse
    if (!newSchedule) {
      try {
        const cleaned = responseText
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .replace(/[\r\n]+/g, " ")
          .trim();
        newSchedule = JSON.parse(cleaned);
      } catch {
        console.error("All parse attempts failed. Raw:", responseText);
        return res.status(500).json({
          success: false,
          message: "AI replanning failed. Try again.",
          debug: responseText.slice(0, 200),
        });
      }
    }

    if (!Array.isArray(newSchedule) || newSchedule.length === 0) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid schedule format.",
      });
    }

    const updatePromises = newSchedule.map((item) => {
  const id = item.topicId || item.id; // ← dono handle karo
  if (!id) return Promise.resolve();
  return Topic.findByIdAndUpdate(id, {
    scheduledDate: new Date(item.scheduledDate),
  });
});

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `${newSchedule.length} topics replanned successfully`,
      missedCount: missedTopics.length,
      data: newSchedule,
    });
  } catch (error) {
    console.error("Replan error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── 4. DASHBOARD STATS ───────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalTopics,
      completedTopics,
      todayTopics,
      missedTopics,
      subjects,
    ] = await Promise.all([
      Topic.countDocuments({ userId }),
      Topic.countDocuments({ userId, status: "done" }),
      Topic.find({
        userId,
        scheduledDate: { $gte: today, $lt: tomorrow },
      }).populate("subjectId", "name color"),
      Topic.countDocuments({
        userId,
        status: { $in: ["pending", "in_progress"] },
        scheduledDate: { $lt: today },
      }),
      Subject.find({ userId }),
    ]);

    const completionRate =
      totalTopics > 0
        ? Math.round((completedTopics / totalTopics) * 100)
        : 0;

    // Weekly progress (last 7 days)
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const count = await Topic.countDocuments({
        userId,
        status: "done",
        completedAt: { $gte: day, $lt: nextDay },
      });

      weeklyProgress.push({
        date: day.toISOString().split("T")[0],
        completed: count,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalTopics,
        completedTopics,
        pendingTopics: totalTopics - completedTopics,
        completionRate,
        missedTopics,
        todayTopics,
        totalSubjects: subjects.length,
        subjects: subjects.map((s) => ({
          _id: s._id,
          name: s.name,
          examDate: s.examDate,
          color: s.color,
          totalTopics: s.totalTopics,
          completedTopics: s.completedTopics,
          progress:
            s.totalTopics > 0
              ? Math.round((s.completedTopics / s.totalTopics) * 100)
              : 0,
          daysLeft: Math.max(
            0,
            Math.floor((new Date(s.examDate) - new Date()) / (1000 * 60 * 60 * 24))
          ),
        })),
        weeklyProgress,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};