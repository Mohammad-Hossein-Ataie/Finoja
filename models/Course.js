import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
  type: { type: String, enum: ['explanation', 'multiple-choice', 'multi-answer', 'fill-in-the-blank'], default: 'explanation' },
  content: String,
  text: String,
  options: [String],
  correctIndex: Number,
  correctIndexes: [Number],
  answer: String,
  explanation: String,
  feedbackCorrect: String,
  feedbackWrong: String,
  order: Number,
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
