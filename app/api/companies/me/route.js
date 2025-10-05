// app/api/companies/me/route.js
import dbConnect from "../../../../lib/dbConnect";
import Company from "../../../../models/Company";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../lib/auth";

export async function GET(req) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["employer", "admin"]); } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const company = await Company.findById(payload.companyId).lean();
  if (!company) return NextResponse.json({ error: "شرکت پیدا نشد." }, { status: 404 });

  return NextResponse.json({ company });
}

/**
 * PATCH body: { name?, field?, country?, city?, website?, description? }
 * فقط فیلدهای عمومی قابل‌ویرایش هستند. KYC/اشتراک از این مسیر تغییر نمی‌کند.
 */
export async function PATCH(req) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["employer", "admin"]); } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { name, field, country, city, website, description } = body || {};

  const updates = {};
  if (typeof name === "string") updates.name = name.trim();
  if (typeof field === "string") updates.field = field.trim();
  if (typeof country === "string") updates.country = country.trim();
  if (typeof city === "string") updates.city = city.trim();
  if (typeof description === "string") updates.description = description.trim();
  if (typeof website === "string") {
    const w = website.trim();
    // نرمال‌سازی ساده‌ی وب‌سایت
    updates.website = w.replace(/^https?:\/\//i, "").replace(/\/+$/,"");
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "هیچ فیلدی برای به‌روزرسانی ارسال نشده است." }, { status: 400 });
  }

  const company = await Company.findByIdAndUpdate(
    payload.companyId,
    { $set: updates },
    { new: true }
  ).lean();

  if (!company) return NextResponse.json({ error: "شرکت پیدا نشد." }, { status: 404 });

  return NextResponse.json({ success: true, company });
}
