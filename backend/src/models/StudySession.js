import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    date: { type: Date, default: Date.now },
    hoursStudied: { type: Number, required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("StudySession", studySessionSchema);