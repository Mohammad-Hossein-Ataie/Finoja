// models/Company.js
import mongoose from "mongoose";

const kycDocSchema = new mongoose.Schema(
  {
    type: { type: String }, // 'registrationDoc' | 'letter' | 'other'
    key: String,            // S3 key
    name: String,
    size: Number,
  },
  { _id: false }
);

const contactViewSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    plan: { type: String, default: "trial" }, // trial | basic | pro ...
    credits: { type: Number, default: 10 },   // تعداد اعتبار باقی‌مانده برای «مشاهده تماس»
    expiresAt: { type: Date, default: null },
  },
  { _id: false }
);

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  field: String,            // حوزه فعالیت (مالی، بانک، بیمه، ...)
  country: String,
  city: String,
  website: String,
  description: String,
  logoKey: String,

  subscription: { type: subscriptionSchema, default: () => ({}) },

  kyc: {
    status: { type: String, enum: ["pending", "approved", "rejected", "none"], default: "none" },
    docs: { type: [kycDocSchema], default: [] },
    reviewedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // تایید دستی ادمین
  },

  contactsViewed: { type: [contactViewSchema], default: [] }, // لاگ مشاهده تماس (برای جلوگیری از دوباره‌کِشی اعتبار)

  createdAt: { type: Date, default: Date.now },
});

if (mongoose.models.Company) delete mongoose.models.Company;
export default mongoose.model("Company", CompanySchema);
