import dbConnect from "../../../../lib/dbConnect";
import Student from "../../../../models/Student";
import User from "../../../../models/User";
import { cookies } from "next/headers";
import { verifyJwt } from "../../../../lib/jwt";

export async function PUT(request, { params }) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload || (payload.role !== "admin" && payload.role !== "teacher"))
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const updated = await Student.findByIdAndUpdate(params.id, body, { new: true });
  return Response.json(updated);
}

export async function DELETE(_req, { params }) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload || (payload.role !== "admin" && payload.role !== "teacher"))
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Remove user associated with student
  await User.deleteOne({ student: params.id });
  // Remove student
  await Student.findByIdAndDelete(params.id);

  return Response.json({ deleted: true });
}
