import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    estimatedHours: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done"],
      default: "pending",
    },
    review: {
      easeFactor: { type: Number, default: 2.5 },
      interval: { type: Number, default: 0 },
      repetitions: { type: Number, default: 0 },
      nextReviewDate: { type: Date, default: null },
      lastReviewedAt: { type: Date, default: null },
    },
    scheduledDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Topic", topicSchema);