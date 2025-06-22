import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nationalCode: String,
  email: String,
  phone: String,
  grade: String,    // پایه یا مقطع
  // ...هر فیلدی که بخواهی اضافه کن
});

export default mongoose.models.Student || mongoose.model("Student", studentSchema);
