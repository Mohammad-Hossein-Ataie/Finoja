import dbConnect from "../../../../../../lib/dbConnect";
import Company from "../../../../../../models/Company";
import Student from "../../../../../../models/Student";
import Application from "../../../../../../models/Application";
import { NextResponse } from "next/server";
import { getAuth, requireRole } from "../../../../../../lib/auth";

/** POST body: { applicationId?: string } 
 *  - اگر applicationId بدهی، همان را لاگ می‌کند
 *  - اگر ندهی، فقط studentId ملاک است (برای جستجوهای رزومه)
 */
export async function POST(req, { params }) {
  await dbConnect();
  const payload = await getAuth(req);
  try { requireRole(payload, ["employer"]); } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode || 403 });
  }

  const studentId = params.studentId;
  const { applicationId } = await req.json();

  const company = await Company.findById(payload.companyId);
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  // KYC تایید شده؟
  if (company.kyc?.status !== "approved") {
    return NextResponse.json({ error: "برای مشاهده تماس، احراز هویت شرکت باید تایید شود." }, { status: 403 });
  }

  // قبلاً این تماس دیده شده؟
  const already = company.contactsViewed?.some((v) => String(v.student) === String(studentId));
  if (!already) {
    if (!company.subscription || company.subscription.credits <= 0) {
      return NextResponse.json({ error: "اعتبار کافی برای مشاهده تماس ندارید." }, { status: 402 });
    }
    company.subscription.credits -= 1;
    company.contactsViewed.push({ student: studentId, application: applicationId || null, at: new Date() });
    await company.save();

    // اگر applicationId پاس داده شده، فلگ contactViewed را بزنیم
    if (applicationId) {
      const app = await Application.findById(applicationId);
      if (app && String(app.company) === String(company._id)) {
        app.contactViewed = true;
        await app.save();
      }
    }
  }

  const student = await Student.findById(studentId).lean();
  if (!student) return NextResponse.json({ error: "دانش‌آموز یافت نشد" }, { status: 404 });

  const contact = {
    phone: student.resumeForm?.basic?.phone || student.mobile,
    email: student.resumeForm?.basic?.email || student.email || "",
  };

  return NextResponse.json({ success: true, contact, credits: company.subscription?.credits ?? 0 });
}
