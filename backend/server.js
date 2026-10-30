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
import resourceRoutes from "./src/routes/resource.routes.js";

connectDB();

const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL, // https://your-app.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());
app.get("/health", (req, res) => res.json({ message: "AI Study Planner Server Is Healthy 🚀" }));

app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/resources", resourceRoutes);

// Fixed PORT logic
const PORT = process.env.PORT || 5000;

// Listen on 0.0.0.0 so Docker containers can reach it
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});