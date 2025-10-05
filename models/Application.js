// models/Application.js
import mongoose from "mongoose";

const statusEnum = ["seen", "under_review", "pre_approved", "hired", "rejected", "withdrawn"];

/** اطلاعات رزومه فایل در لحظه اپلای (اسنپ‌شات) */
const resumeFileSchema = new mongoose.Schema(
  {
    key: String,
    name: String,
    size: Number,
    type: String,
    updatedAt: Date,
  },
  { _id: false }
);

const ApplicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },

    status: { type: String, enum: statusEnum, default: "under_review" },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: statusEnum },
          at: { type: Date, default: Date.now },
        },
      ],
      default: [{ status: "under_review", at: Date.now }],
    },

    withdrawn: { type: Boolean, default: false },
    withdrawnAt: { type: Date, default: null },

    /** نوع رزومه در زمان اپلای (file|builder) */
    resumeKind: { type: String, enum: ["file", "builder"], default: "file" },

    /** اسنپ‌شات فایل رزومه */
    resumeFile: { type: resumeFileSchema, default: undefined },

    /** ✅ اسنپ‌شات رزومه‌ساز (اگر resumeKind = builder) - ذخیره سبکِ فرم برای رفرنس */
    resumeFormSnapshot: { type: mongoose.Schema.Types.Mixed, default: undefined },

    contactViewed: { type: Boolean, default: false }, // کارفرما تماس این اپلیکنت را دیده است یا نه
  },
  { timestamps: true }
);

ApplicationSchema.index({ job: 1, student: 1 }, { unique: true }); // جلوگیری از اپلای تکراری

if (mongoose.models.Application) delete mongoose.models.Application;
export default mongoose.model("Application", ApplicationSchema);
