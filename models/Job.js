// models/Job.js
import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },

    title: { type: String, required: true },
    description: String,
    salaryRange: String, // نمایش آزاد/متنی
    minExpYears: { type: Number, default: 0 },
    gender: { type: String, enum: ["male", "female", "any"], default: "any" },
    education: String,    // دیپلم/کاردانی/کارشناسی/...
    fieldOfStudy: String, // رشته مرتبط
    requiredSkills: { type: [String], default: [] },

    finojaCourseIds: { type: [String], default: [] }, // گذروندن دوره خاص در فینوجا

    location: {
      country: String,
      city: String,
    },

    active: { type: Boolean, default: true },
    postedAt: { type: Date, default: Date.now },

    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
  },
  { timestamps: true }
);

JobSchema.index({ title: "text", description: "text" });

if (mongoose.models.Job) delete mongoose.models.Job;
export default mongoose.model("Job", JobSchema);
