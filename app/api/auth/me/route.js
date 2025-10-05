import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import Student from "../../../../models/Student";
import Employer from "../../../../models/Employer";
import { verifyJwt } from "../../../../lib/jwt";

export async function GET() {
  try {
    await dbConnect();

    // طبق پیام Next: باید await شود
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJwt(token).catch(() => null);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = payload.role || payload.type || "user";
    const id = String(payload.studentId || payload.sub || payload._id || "");

    if (!id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const doc = await User.findById(id)
      .select("-password")
      .populate("teacher")
      .populate("student")
      .lean();
    if (!doc) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({ ...doc, role: doc.role || role });
  } catch (err) {
    console.error("/api/auth/me error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
