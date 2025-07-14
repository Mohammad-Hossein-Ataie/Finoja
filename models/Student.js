import mongoose from "mongoose";

/** ───────── Sub-schema وضعیت یادگیری یک دوره ───────── */
const learningSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true }, // همان ObjectId رشته‌ای
    progress: { type: Number, default: 0 },     // بزرگ‌ترین flatStepIdx آزاد
    xp: { type: Number, default: 0 },           // امتیاز همین دوره
    correct: { type: [Number], default: [] },   // پرسش‌های حل شده
    wrongByUnit: { type: Object, default: {} }, // { unitGlobalIdx: [stepIdx, …] }
    reviewQueue: { type: [Number], default: [] }, // صف بازبینی پایان یونیت
    finished: { type: Boolean, default: false },
  },
  { _id: false }
);

/** ───────── مدل Student ───────── */
const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  family: { type: String, required: true },
  mobile: { type: String, unique: true, required: true },
  email: String,
  password: { type: String, required: true },

  onboarding: Object,

  learning: { type: [learningSchema], default: [] }, // یک سند برای هر دوره
  totalXp: { type: Number, default: 0 },             // مجموع XP همهٔ دوره‌ها

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Student ||
  mongoose.model("Student", StudentSchema);
