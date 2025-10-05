// models/Application.js
import mongoose from "mongoose";

const statusEnum = ["seen", "under_review", "pre_approved", "hired", "rejected"];

const statusHistorySchema = new mongoose.Schema(
  { status: { type: String, enum: statusEnum }, at: { type: Date, default: Date.now } },
  { _id: false }
);

const ApplicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },

    status: { type: String, enum: statusEnum, default: "under_review" },
    statusHistory: { type: [statusHistorySchema], default: [{ status: "under_review" }] },

    withdrawn: { type: Boolean, default: false },

    contactViewed: { type: Boolean, default: false }, // کارفرما تماس این اپلیکنت را دیده است یا نه
  },
  { timestamps: true }
);

ApplicationSchema.index({ job: 1, student: 1 }, { unique: true }); // جلوگیری از اپلای تکراری

if (mongoose.models.Application) delete mongoose.models.Application;
export default mongoose.model("Application", ApplicationSchema);
