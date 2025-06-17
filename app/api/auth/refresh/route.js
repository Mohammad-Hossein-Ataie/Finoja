import { cookies } from "next/headers";
import { verifyJwt, signJwt } from "@/lib/jwt";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyJwt(token);
  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const newToken = await signJwt(
    { _id: payload._id, role: payload.role, teacher: payload.teacher },
    "15m"
  );

  cookieStore.set("token", newToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ ok: true });
}
