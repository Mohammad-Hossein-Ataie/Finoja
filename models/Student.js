// models/Student.js
import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },      // نام
  family: { type: String, required: true },    // نام خانوادگی
  mobile: { type: String, unique: true, required: true }, // شماره موبایل
  email: { type: String },
  password: { type: String, required: true },  // پسورد هش‌شده
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
