import mongoose from "mongoose";

const EmployerSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: { type: String, required: true, unique: true },
  password: { type: String, default: null }, // OTP-only
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  createdAt: { type: Date, default: Date.now },
});

if (mongoose.models.Employer) delete mongoose.models.Employer;
export default mongoose.model("Employer", EmployerSchema);
