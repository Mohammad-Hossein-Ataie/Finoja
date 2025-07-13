import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: String,
  role: { 
    type: String, 
    enum: ["admin", "teacher", "student"], 
    default: "student" // پیش‌فرض یادگیرنده است
  },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }, // اگر استاد باشد
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" }, // اگر یادگیرنده باشد
});

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
