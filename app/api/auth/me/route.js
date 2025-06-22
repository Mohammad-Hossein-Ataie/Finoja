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

  // اطمینان از اینکه _id رشته است
  const userId = typeof payload._id === "string" ? payload._id : payload._id.toString();

  const user = await User.findById(userId)
    .select("-password")
    .populate("teacher")
    .populate("student");

  return Response.json(user);
}
