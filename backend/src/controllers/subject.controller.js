import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";

export const createSubject = async (req, res) => {
  try {
    const { name, examDate, color } = req.body;

    if (!name || !examDate) {
      return res.status(400).json({ success: false, message: "Name and exam date required" });
    }

    const subject = await Subject.create({
      userId: req.user._id,
      name,
      examDate: new Date(examDate),
      color: color || "#58a6ff",
    });

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id })
      .sort({ examDate: 1 });
    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    await Topic.deleteMany({ subjectId: req.params.id });
    res.status(200).json({ success: true, message: "Subject and topics deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};