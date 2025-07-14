import { sendOtpSMS } from "../../../lib/sendOtp";
import dbConnect from "../../../lib/dbConnect";
import OTP from "../../../models/OTP";

export async function POST(req) {
  await dbConnect();
  const { mobile, type } = await req.json();
  if (!/^09\d{9}$/.test(mobile))
    return Response.json({ error: "شماره معتبر نیست" }, { status: 400 });

  const code = Math.floor(100000 + Math.random() * 900000); // 6 رقمی
  await OTP.findOneAndUpdate(
    { mobile },
    { code, createdAt: new Date(), type },
    { upsert: true, new: true }
  );
  const text =
    (type === "register" ? `کد ثبت‌نام: ${code}` : `کد بازیابی رمز: ${code}`) +
    "\nفینوجا";
  const result = await sendOtpSMS(mobile, code, text);
  if (!result.success)
    return Response.json({ error: result.message }, { status: 500 });
  return Response.json({ success: true });
}
