import dbConnect from "../../../../lib/dbConnect";
import OTP from "../../../../models/OTP";
import { NextResponse } from "next/server";
import { sendOtp } from "../../../../lib/sendOtp";

const OTP_LIFETIME_MS = 3 * 60 * 1000; // 3 دقیقه

function normalizeMobile(m) {
  if (!m) return "";
  const fa2en = s => s.replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
  let x = fa2en(String(m)).replace(/\D/g, "");
  if (x.startsWith("0098")) x = x.slice(4);
  if (x.startsWith("98")) x = x.slice(2);
  if (!x.startsWith("0")) x = "0" + x;
  return x;
}

export async function POST(req) {
  await dbConnect();
  try {
    const { mobile, purpose } = await req.json();
    const nm = normalizeMobile(mobile);
    if (!/^0\d{10}$/.test(nm)) {
      return NextResponse.json({ error: "شماره موبایل نامعتبر است." }, { status: 400 });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + OTP_LIFETIME_MS);

    await OTP.create({ mobile: nm, code, purpose: purpose || "employer", expiresAt });

    const r = await sendOtp(nm, code);
    if (!r.success) {
      return NextResponse.json({ error: r.message || "ارسال پیامک ناموفق بود." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "خطای داخلی ارسال کد." }, { status: 500 });
  }
}
