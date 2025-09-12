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
    xp: { type: Number, default: 0 },           // امتیاز همین دوره
    correct: { type: [Number], default: [] },   // قدیمی: پرسش‌های حل‌شده با اندیس
    wrongByUnit: { type: Object, default: {} }, // قدیمی
    reviewQueue: { type: [Number], default: [] }, // قدیمی
    finished: { type: Boolean, default: false },

    // فقط برای سازگاری اگر جایی از UI قدیم می‌خواند
    wrong: { type: [Number], default: [] },
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

  /** ───────── رزومه دانش‌آموز ─────────
   *  key: کلید S3
   *  name: نام فایل اصلی برای نمایش
   *  size/type: اطلاعات اختیاری
   *  updatedAt: تاریخ آخرین تغییر
   */
  resumeKey: { type: String, default: undefined },
  resumeName: { type: String, default: undefined },
  resumeSize: { type: Number, default: undefined },
  resumeType: { type: String, default: undefined },
  resumeUpdatedAt: { type: Date, default: undefined },

  createdAt: { type: Date, default: Date.now },
});

/**
 * ⚠️ مهم: در محیط توسعه، مدل قبلی ممکن است با اسکیمای قدیمی کش شده باشد
 * و باعث شود فیلدهای جدید (مثل resume*) ذخیره نشوند.
 * با پاک کردن مدل کش‌شده، مونگوس را مجبور می‌کنیم مدل را با اسکیمای جدید بسازد.
 */
if (mongoose.models.Student) {
  delete mongoose.models.Student;
}

export default mongoose.model("Student", StudentSchema);
