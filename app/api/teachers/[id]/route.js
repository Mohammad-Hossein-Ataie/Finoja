import dbConnect from "../../../../lib/dbConnect";
import Teacher from "../../../../models/Teacher";
import User from "../../../../models/User";
import { cookies } from "next/headers";
import { verifyJwt } from "../../../../lib/jwt";

export async function PUT(request, { params }) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload || payload.role !== "admin")
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const updated = await Teacher.findByIdAndUpdate(params.id, body, { new: true });
  return Response.json(updated);
}

export async function DELETE(_req, { params }) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload || payload.role !== "admin")
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Remove user associated with teacher
  await User.deleteOne({ teacher: params.id });
  // Remove teacher
  await Teacher.findByIdAndDelete(params.id);

  return Response.json({ deleted: true });
}
