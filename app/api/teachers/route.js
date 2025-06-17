import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import dbConnect from "@/lib/dbConnect";
import Teacher from "@/models/Teacher";

export async function GET() {
  await dbConnect();
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const payload = verifyJwt(token);
  if (!payload) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // فقط ادمین و استاد مجاز به دیدن
  if (payload.role === "admin" || payload.role === "teacher") {
    const teachers = await Teacher.find();
    return Response.json(teachers);
  }
  return Response.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req) {
  await dbConnect();
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const payload = verifyJwt(token);
  if (!payload) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // فقط ادمین مجاز به اضافه‌کردن
  if (payload.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const created = await Teacher.create(body);
  return Response.json(created);
}
