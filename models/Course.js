import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
  title: { type: String, default: "" },

  type: {
    type: String,
    enum: [
      "explanation",
      "multiple-choice",
      "multi-answer",
      "fill-in-the-blank",
      "matching",
      // NEW ↓
      "video",
      "audio",
    ],
    default: "explanation",
  },

  // عمومی
  content: String,   // HTML برای توضیح
  text: String,      // متن سوال/توضیح کوتاه

  // چندگزینه‌ای/جای‌خالی
  options: [String],
  correctIndex: Number,
  correctIndexes: [Number],

  answer: String,
  explanation: String,
  feedbackCorrect: String,
  feedbackWrong: String,
  order: Number,

  // matching
  pairs: [{ left: String, right: String }],
  matchingQuestion: String,

  // NEW: مدیا (برای ویدیو/صوت یا حتی توضیحی)
  mediaUrl: String,  // لینک بیرونی (YouTube/فایل عمومی و ...)
  mediaKey: String,  // کلید S3 در لیارا (خصوصی) مثل: videos/1737-abc-file.mp4
});

const unitSchema = new mongoose.Schema({
  title: String,
  order: Number,
  steps: [stepSchema],
});

const sectionSchema = new mongoose.Schema({
  title: String,
  order: Number,
  units: [unitSchema],
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  sections: [sectionSchema],
});

export default mongoose.models.Course || mongoose.model("Course", courseSchema);
