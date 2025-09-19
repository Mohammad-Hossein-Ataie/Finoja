// models/Student.js
import mongoose from "mongoose";

/** ───────── Sub-schema وضعیت یادگیری یک دوره ───────── */
const learningSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },

    // جدید
    doneIds: { type: [String], default: [] },
    correctIds: { type: [String], default: [] },
    wrongByUnitIds: { type: Object, default: {} },
    reviewQueueIds: { type: [String], default: [] },
    carryOverIds: { type: [String], default: [] },
    cursorStepId: { type: String, default: undefined },

    // قدیمی (سازگاری)
    progress: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    correct: { type: [Number], default: [] },
    wrongByUnit: { type: Object, default: {} },
    reviewQueue: { type: [Number], default: [] },
    finished: { type: Boolean, default: false },
    wrong: { type: [Number], default: [] },
  },
  { _id: false }
);

/** ───────── زیر‌اسکیماهای رزومه ───────── */
const resumeEduSchema = new mongoose.Schema(
  {
    degree: String,       // دیپلم، کاردانی، کارشناسی، ...
    field: String,        // رشته
    university: String,
    startYear: Number,
    endYear: Number,
    gpa: String,          // اختیاری
    stillStudying: { type: Boolean, default: false },
  },
  { _id: false }
);

const resumeJobSchema = new mongoose.Schema(
  {
    org: String,
    title: String,
    orgField: String,   // حوزه فعالیت شرکت (مالی، کارگزاری، بیمه و ...)
    level: String,      // رده سازمانی
    country: String,
    city: String,
    startMonth: String,
    startYear: Number,
    endMonth: String,
    endYear: Number,
    current: { type: Boolean, default: false },
    achievements: String, // متن آزاد
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    // مرحله 1: اطلاعات اولیه
    basic: {
      name: String,
      family: String,
      gender: { type: String, enum: ["male", "female", "other"], default: "male" },
      marital: { type: String, enum: ["single", "married"], default: "single" },
      city: String,
      birthYear: Number,
      birthMonth: String,
      birthDay: Number,
      militaryStatus: { type: String, default: "" }, // فقط برای آقایان
      salaryRange: String,
      interestedFields: [String], // حداکثر 3 مورد
      foreignNational: { type: Boolean, default: false },
      nationality: String,
      disability: { type: Boolean, default: false },
      disabilityType: String,
      phone: String,
      email: String,
    },
    // مرحله 2: سوابق تحصیلی
    educations: { type: [resumeEduSchema], default: [] },
    // مرحله 3: سوابق شغلی
    jobs: { type: [resumeJobSchema], default: [] },
    // مرحله 4: مهارت‌ها
    languages: {
      type: [
        {
          name: String, // انگلیسی، آلمانی، ...
          level: String, // سطوح توصیفی
        },
      ],
      default: [],
    },
    softwareSkills: [String],  // مهارت‌های نرم‌افزاری (Excel, Power BI, ... )
    extraSkills: [String],     // مهارت‌های تکمیلی (تحلیل صورت‌های مالی، مدل‌سازی مالی، ...)

    // درصد پیشرفت برای سایدبار
    progress: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
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

  learning: { type: [learningSchema], default: [] },
  totalXp: { type: Number, default: 0 },

  /** ───────── رزومه فایل ───────── */
  resumeKey: { type: String, default: undefined },
  resumeName: { type: String, default: undefined },
  resumeSize: { type: Number, default: undefined },
  resumeType: { type: String, default: undefined },
  resumeUpdatedAt: { type: Date, default: undefined },

  /** ───────── رزومه‌ساز (فرم) ───────── */
  resumeForm: { type: resumeSchema, default: {} },

  /** ───────── آواتار ───────── */
  avatarKey: { type: String, default: undefined },
  avatarType: { type: String, default: undefined },
  avatarSize: { type: Number, default: undefined },
  avatarUpdatedAt: { type: Date, default: undefined },

  createdAt: { type: Date, default: Date.now },
});

/** مهم: کش مدل قدیمی را در Dev پاک کن تا فیلدهای جدید ذخیره شوند */
if (mongoose.models.Student) delete mongoose.models.Student;

export default mongoose.model("Student", StudentSchema);
