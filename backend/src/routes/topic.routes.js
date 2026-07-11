import express from "express";
import { createTopics, getTopics, updateTopicStatus, getTodayTopics } from "../controllers/topic.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createTopics);
router.get("/today", protect, getTodayTopics);
router.get("/:subjectId", protect, getTopics);
router.patch("/:id/status", protect, updateTopicStatus);

export default router;