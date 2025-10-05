// lib/auth.js
import { verifyJwt } from "./jwt";

export async function getAuth(req) {
  const token = req.cookies?.get?.("token")?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  return payload || null; // { sub, role: 'student' | 'employer' | 'admin', ... }
}

export function requireRole(payload, roles = []) {
  if (!payload || !roles.includes(payload.role)) {
    const e = new Error("دسترسی غیرمجاز");
    e.statusCode = 403;
    throw e;
  }
}
