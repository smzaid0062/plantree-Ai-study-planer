import express from "express";
import {
  parseSyllabus,
  generatePlan,
  replan,
  getDashboardStats,
} from "../controllers/ai.controller.js";
import protect from "../middleware/auth.middleware.js";
import upload from "../config/multer.js";

const router = express.Router();

// Syllabus parse — PDF ya text
router.post(
  "/parse-syllabus",
  protect,
  upload.single("syllabus"),
  parseSyllabus
);

// Generate full study plan
router.post("/generate-plan", protect, generatePlan);

// Adaptive replan
router.post("/replan", protect, replan);

// Dashboard stats
router.get("/dashboard", protect, getDashboardStats);

export default router;