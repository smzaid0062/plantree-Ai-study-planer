import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import subjectRoutes from "./src/routes/subject.routes.js";
import topicRoutes from "./src/routes/topic.routes.js";
import aiRoutes from "./src/routes/ai.routes.js";
import sessionRoutes from "./src/routes/session.routes.js";
import quizRoutes from "./src/routes/quiz.routes.js";
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "AI Study Planner API 🚀" }));

app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/quiz", quizRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));