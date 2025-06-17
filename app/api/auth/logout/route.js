/**
 * POST /api/auth/logout
 * کوکی JWT را با maxAge صفر پاک می‌کند.
 */
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // با گذاشتن maxAge = 0 عملاً کوکی حذف می‌شود
  cookieStore.set("token", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return Response.json({ ok: true });
}
