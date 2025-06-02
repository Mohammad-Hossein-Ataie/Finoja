import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nationalCode: String,
  email: String,
  phone: String,
  expertise: String,
});

export default mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
