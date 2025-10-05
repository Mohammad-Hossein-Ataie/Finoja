import dbConnect from "../../../../lib/dbConnect";
import Company from "../../../../models/Company";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../lib/auth";

export async function GET(req) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["admin"]); } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const { searchParams } = new URL(req.url);
  const kyc = searchParams.get("kyc"); // none|pending|approved|rejected|null
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const filter = {};
  if (kyc && ["none", "pending", "approved", "rejected"].includes(kyc)) {
    if (kyc === "none") {
      filter.$or = [{ "kyc.status": { $exists: false } }, { "kyc.status": "none" }, { kyc: null }];
    } else {
      filter["kyc.status"] = kyc;
    }
  }

  const docs = await Company.find(filter).sort({ createdAt: -1 }).lean();

  // فیلتر متنی سمت سرور (ساده)
  const list = (q
    ? docs.filter((c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.city || "").toLowerCase().includes(q) ||
        (c.website || "").toLowerCase().includes(q)
      )
    : docs
  ).map((c) => ({
    _id: c._id,
    name: c.name,
    field: c.field || "",
    country: c.country || "",
    city: c.city || "",
    website: c.website || "",
    createdAt: c.createdAt,
    kyc: {
      status: c?.kyc?.status || "none",
      docs: Array.isArray(c?.kyc?.docs) ? c.kyc.docs.map(d => ({
        type: d.type, key: d.key, name: d.name, size: d.size
      })) : [],
    },
  }));

  return NextResponse.json({ companies: list });
}
