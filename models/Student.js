import mongoose from "mongoose";

/** ───────── Sub-schema وضعیت یادگیری یک دوره ───────── */
const learningSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true }, // همان ObjectId رشته‌ای

    // ✅ فیلدهای جدید پایدار بر اساس شناسه
    doneIds: { type: [String], default: [] },           // همه گام‌هایی که طی شده‌اند
    correctIds: { type: [String], default: [] },        // گام‌های پاسخ صحیح حداقل یک‌بار
    wrongByUnitIds: { type: Object, default: {} },      // { [unitId]: string[] of stepIds }
    reviewQueueIds: { type: [String], default: [] },    // صف مرور جاری
    carryOverIds: { type: [String], default: [] },      // غلط‌های منتقل‌شده به یونیت بعدی
    cursorStepId: { type: String, default: undefined }, // اختیاری

    // ✅ فیلدهای قدیمی برای سازگاری عقب
    progress: { type: Number, default: 0 },     // بزرگ‌ترین flatStepIdx آزاد (قدیمی)
    xp: { type: Number, default: 0 },           // امتیاز همین دوره (همان قبلی)
    correct: { type: [Number], default: [] },   // قدیمی: پرسش‌های حل‌شده با اندیس
    wrongByUnit: { type: Object, default: {} }, // قدیمی: { unitGlobalIdx: [flatIdx, …] }
    reviewQueue: { type: [Number], default: [] }, // قدیمی: صف بازبینی با اندیس
    finished: { type: Boolean, default: false },

    // تجمیع قدیمی:
    // wrong: [Number] را دیگر لازم نداریم، اما اگر قبلاً بوده مشکل‌ساز نیست
    wrong: { type: [Number], default: [] }, // فقط برای سازگاری اگر جاهایی از UI قدیم می‌خواند
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
