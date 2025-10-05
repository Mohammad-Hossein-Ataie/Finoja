import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJwt } from "../../../../lib/jwt";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import Student from "../../../../models/Student";
import Employer from "../../../../models/Employer";

export async function GET() {
  await dbConnect();

  // این تابع sync است؛ نباید await شود
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  const payload = await verifyJwt(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // در توکن‌های جدید شما شناسه در sub است؛ در قدیمی‌ها ممکن است _id باشد
  const id = String(payload.sub || payload._id || "");
  const role = payload.role || payload.type || "user";

  try {
    if (role === "student") {
      const doc = await Student.findById(id).select("-password").lean();
      if (!doc) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return NextResponse.json({ ...doc, role: "student" });
    }

    if (role === "employer") {
      const doc = await Employer.findById(id)
        .select("-password")
        .populate("company")
        .lean();
      if (!doc) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return NextResponse.json({ ...doc, role: "employer" });
    }

    // پیش‌فرض: یوزر پنل ادمین/عمومی
    const doc = await User.findById(id)
      .select("-password")
      .populate("teacher")
      .populate("student")
      .lean();
    if (!doc) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({ ...doc, role: doc.role || role });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
