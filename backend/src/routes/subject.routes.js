import express from "express";
import { createSubject, getSubjects, updateSubject, deleteSubject } from "../controllers/subject.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createSubject);
router.get("/", protect, getSubjects);
router.patch("/:id", protect, updateSubject);
router.delete("/:id", protect, deleteSubject);

export default router;