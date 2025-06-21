import { cookies } from "next/headers";
import { verifyJwt } from "../../../../lib/jwt";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";

export async function GET() {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = await verifyJwt(token);

  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findById(payload._id)
    .select("-password")
    .populate("teacher");

  return Response.json(user);
}
