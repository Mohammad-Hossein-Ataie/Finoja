import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  family: { type: String, required: true },
  mobile: { type: String, unique: true, required: true },
  email: { type: String },
  password: { type: String, required: true },
  onboarding: { type: Object },
  learning: [
    {
      courseId: String,
      progress: { type: Number, default: 0 },
      correct: [Number],
      wrong: [Number],
      finished: { type: Boolean, default: false },
      wrongByUnit: { type: Object, default: {} }, // NEW FIELD!
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
