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

  /** ───────── رزومه ───────── */
  resumeKey: { type: String, default: undefined },
  resumeName: { type: String, default: undefined },
  resumeSize: { type: Number, default: undefined },
  resumeType: { type: String, default: undefined },
  resumeUpdatedAt: { type: Date, default: undefined },

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
