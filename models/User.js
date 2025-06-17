import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // رمز به صورت هش ذخیره کن!
  role: { type: String, enum: ["admin", "teacher"], default: "teacher" },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }, // اگر نقش استاد باشه
});

// رمز رو قبل از ذخیره هش کن
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
