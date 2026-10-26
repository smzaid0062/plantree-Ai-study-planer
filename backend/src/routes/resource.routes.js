import express from "express";
import {
  suggestResources,
  saveResource,
  getSavedResources,
  deleteResource,
} from "../controllers/resource.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/suggest", protect, suggestResources);
router.post("/save", protect, saveResource);
router.get("/", protect, getSavedResources);
router.delete("/:id", protect, deleteResource);

export default router;