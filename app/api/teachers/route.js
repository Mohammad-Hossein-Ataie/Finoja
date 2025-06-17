import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import dbConnect from "@/lib/dbConnect";
import Teacher from "@/models/Teacher";

export async function GET() {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (payload.role === "admin" || payload.role === "teacher") {
    const teachers = await Teacher.find();
    return Response.json(teachers);
  }

  return Response.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (payload.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const created = await Teacher.create(body);
  return Response.json(created);
}
