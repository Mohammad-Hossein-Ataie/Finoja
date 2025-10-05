// app/api/employer/send-otp/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import OTP from "../../../../models/OTP";
import { sendOtpSMS } from "../../../../lib/sendOtp";

// نرمال‌سازی موبایل ایران
function normalizeMobile(m) {
  if (!m) return "";
  const fa2en = s => s.replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
  let x = fa2en(String(m)).replace(/\D/g, "");
  if (x.startsWith("0098")) x = x.slice(4);
  if (x.startsWith("98")) x = x.slice(2);
  if (!x.startsWith("0")) x = "0" + x;
  return x;
}

// تنظیمات OTP
const EXPIRE_MS = 2 * 60 * 1000;   // اعتبار کد: 2 دقیقه
const COOLDOWN_MS = 90 * 1000;     // کول‌داون ارسال مجدد: 90 ثانیه
const MAX_PER_10MIN = 5;           // سقف ارسال هر 10 دقیقه برای یک شماره/کاربرد

export async function POST(req) {
  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const purpose = String(body?.purpose || "employer_login");
  const mobile = normalizeMobile(body?.mobile || "");

  if (!/^09\d{9}$/.test(mobile)) {
    return NextResponse.json({ error: "شماره معتبر نیست." }, { status: 400 });
  }

  // Rate-limit: cooldown و سقف تعداد
  const now = Date.now();
  const last = await OTP.findOne({ mobile, purpose }).sort({ createdAt: -1 }).lean();

  if (last && last.createdAt && now - new Date(last.createdAt).getTime() < COOLDOWN_MS) {
    const retryAfter = Math.ceil((COOLDOWN_MS - (now - new Date(last.createdAt).getTime())) / 1000);
    return NextResponse.json(
      { error: "ارسال مکرر مجاز نیست. کمی صبر کنید.", retryAfter },
      { status: 429 }
    );
  }

  const tenMinAgo = new Date(now - 10 * 60 * 1000);
  const recentCount = await OTP.countDocuments({ mobile, purpose, createdAt: { $gte: tenMinAgo } });
  if (recentCount >= MAX_PER_10MIN) {
    return NextResponse.json(
      { error: "تعداد درخواست زیاد است. بعداً تلاش کنید." },
      { status: 429 }
    );
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(now + EXPIRE_MS);

  await OTP.create({ mobile, code, purpose, expiresAt });

  const text =
    purpose === "employer_register"
      ? `کد ثبت‌نام شما: ${code}\nفینوجا`
      : `کد ورود شما: ${code}\nفینوجا`;

  const result = await sendOtpSMS(mobile, code, text);
  if (!result?.success) {
    return NextResponse.json({ error: result?.message || "خطا در ارسال پیامک." }, { status: 502 });
  }

  return NextResponse.json({ success: true, expiresAt, cooldown: COOLDOWN_MS / 1000 });
}
