import mongoose from "mongoose";

const UnitFeedbackSchema = new mongoose.Schema({
  studentMobile: { type: String, required: true }, // ساده و مستقیم
  courseId:      { type: String, required: true },
  sectionIdx:    { type: Number, required: true },
  unitIdx:       { type: Number, required: true },
  rating:        { type: Number, min: 1, max: 5, required: true },
  comment:       { type: String, default: "" },
  createdAt:     { type: Date, default: Date.now },
});

export default mongoose.models.UnitFeedback ||
  mongoose.model("UnitFeedback", UnitFeedbackSchema);
