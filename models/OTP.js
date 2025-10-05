import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, index: true },
    code: { type: String, required: true },
    purpose: { type: String, default: "employer", index: true }, // مثلا employer|student|register|login
    expiresAt: { type: Date, default: null }, // برای TTL
  },
  { timestamps: true }
);

// TTL: اسناد بعد از expiresAt خودبه‌خود حذف می‌شوند
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OTPSchema.index({ mobile: 1, createdAt: -1 });

export default mongoose.models.OTP || mongoose.model("OTP", OTPSchema);
