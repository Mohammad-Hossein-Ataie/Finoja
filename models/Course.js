import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
  // عنوان گام
  title: { type: String, default: "" },

  type: { 
    type: String, 
    enum: [
      'explanation', 
      'multiple-choice', 
      'multi-answer', 
      'fill-in-the-blank', 
      'matching'
    ], 
    default: 'explanation' 
  },

  // برای توضیح و متن سؤال و جای‌خالی و ...  
  content: String,      // متن HTML برای توضیح  
  text: String,         // متن سؤال یا جمله

  // برای گزینه‌های چندگزینه‌ای و جای‌خالی با چند گزینه
  options: [String],    // در جای‌خالی هم استفاده می‌شود
  correctIndex: Number, // فقط یکی صحیح است
  correctIndexes: [Number], // چند جوابی

  answer: String,       // برای پاسخ جای‌خالی سنتی  
  explanation: String,  // توضیح بعد از جواب  
  feedbackCorrect: String,
  feedbackWrong: String,
  order: Number,

  // برای matching
  pairs: [
    {
      left: String,   // مورد سمت راست
      right: String,  // مورد سمت چپ
    }
  ],
  matchingQuestion: String, // عنوان سوال matching
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
