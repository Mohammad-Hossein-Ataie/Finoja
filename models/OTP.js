import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  code: String,
  type: String,
  createdAt: { type: Date, default: Date.now, expires: 180 }, // 3 دقیقه اعتبار
});

export default mongoose.models.OTP || mongoose.model('OTP', OTPSchema);
