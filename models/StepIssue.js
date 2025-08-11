import mongoose from "mongoose";

const StepIssueSchema = new mongoose.Schema({
  studentMobile:  { type: String, required: true },
  courseId:       { type: String, required: true },
  globalStepIndex:{ type: Number, required: true },
  stepType:       { type: String, default: "" },
  reason:         { type: String, default: "" },
  message:        { type: String, default: "" },
  createdAt:      { type: Date, default: Date.now },
});

export default mongoose.models.StepIssue ||
  mongoose.model("StepIssue", StepIssueSchema);
