import { cookies } from "next/headers";
import { verifyJwt } from "../../../../lib/jwt";
import dbConnect from "../../../../lib/dbConnect";
import Teacher from "../../../../models/Teacher";

export async function PUT(request, { params }) {
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

  const body = await request.json();
  const updated = await Teacher.findByIdAndUpdate(params.id, body, { new: true });
  return Response.json(updated);
}

export async function DELETE(_req, { params }) {
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

  await Teacher.findByIdAndDelete(params.id);
  return Response.json({ deleted: true });
}
