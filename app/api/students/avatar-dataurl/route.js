// app/api/students/avatar-dataurl/route.js
import dbConnect from "../../../../lib/dbConnect";
import Student from "../../../../models/Student";

/**
 * این Route آواتار را از استوریج عمومی لیارا می‌خواند
 * و به Data URL (base64) برمی‌گرداند تا html2canvas بدون مشکل CORS رندر کند.
 *
 * env های لازم:
 * - NEXT_PUBLIC_LIARA_BASE_URL = https://storage.c2.liara.space/<bucket>
 *   (تو .env شما همین مقدار ست شده است)
 *
 * اگر NEXT_PUBLIC_LIARA_BASE_URL نبود، از LIARA_ENDPOINT + LIARA_BUCKET_NAME می‌سازیم.
 */

function getPublicBase() {
  const publicBase = process.env.NEXT_PUBLIC_LIARA_BASE_URL;
  if (publicBase) return publicBase.replace(/\/$/, "");
  const endpoint = (process.env.LIARA_ENDPOINT || "").replace(/\/$/, "");
  const bucket = process.env.LIARA_BUCKET_NAME || "";
  if (endpoint && bucket) return `${endpoint}/${bucket}`;
  return null;
}

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get("mobile");
    if (!mobile) return Response.json({ error: "mobile is required" }, { status: 400 });

    const stu = await Student.findOne({ mobile }).lean();
    if (!stu) return Response.json({ error: "not found" }, { status: 404 });

    const key = stu.avatarKey;
    if (!key) return Response.json({ dataUrl: null }, { status: 200 });

    const base = getPublicBase();
    if (!base) {
      return Response.json({ error: "storage base url not configured" }, { status: 500 });
    }

    // URL عمومی فایل روی لیارا
    const url = `${base}/${key}`;

    // از سرور فچ می‌کنیم و به base64 تبدیل
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      // اگر فایل نبود، null برگردون
      if (res.status === 404) return Response.json({ dataUrl: null }, { status: 200 });
      return Response.json({ error: "fetch failed" }, { status: 502 });
    }

    const arrayBuffer = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const dataUrl = `data:${contentType};base64,${buf.toString("base64")}`;

    return Response.json({ dataUrl }, { status: 200 });
  } catch (e) {
    // برای دیباگ می‌تونی موقتاً لاگ کنی:
    // console.error("avatar-dataurl error:", e);
    return Response.json({ error: "server error" }, { status: 500 });
  }
}
