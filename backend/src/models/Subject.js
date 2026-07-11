import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: { type: String, required: true, trim: true },
        examDate: { type: Date, required: true },
        color: { type: String, default: "#58a6ff" },
        totalTopics: { type: Number, default: 0 },
        completedTopics: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);