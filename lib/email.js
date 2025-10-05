// lib/email.js
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE, // "true" | "false"
  EMAIL_FROM,  // مثلا "Finoja <no-reply@finoja.ir>"
} = process.env;

let cachedTransport = null;

function getTransport() {
  if (cachedTransport) return cachedTransport;
  cachedTransport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_SECURE || "false") === "true",
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return cachedTransport;
}

/**
 * ارسال ایمیل ساده
 * @param {string} to 
 * @param {string} subject 
 * @param {string} html 
 */
export async function sendEmail(to, subject, html) {
  const transporter = getTransport();
  await transporter.sendMail({
    from: EMAIL_FROM || "Finoja <no-reply@finoja.ir>",
    to,
    subject,
    html,
  });
}

// الگوهای متنی برای وضعیت‌های رزومه
export function renderStatusEmail({ name, jobTitle, companyName, status, reason }) {
  const faStatus = {
    seen: "رزومه مشاهده شد",
    under_review: "در حال بررسی",
    pre_approved: "تایید اولیه",
    hired: "جذب شد",
    rejected: "رد شد",
  }[status] || "به‌روزرسانی درخواست";

  const reasonHtml = status === "rejected" && reason ? `<p>علت رد: ${reason}</p>` : "";

  return {
    subject: `وضعیت درخواست شما - «${jobTitle}» در ${companyName}: ${faStatus}`,
    html: `
      <div style="font-family:Tahoma,sans-serif;direction:rtl;text-align:right">
        <p>سلام ${name} عزیز،</p>
        <p>وضعیت درخواست شما برای موقعیت «${jobTitle}» در شرکت «${companyName}» به‌روزرسانی شد: <b>${faStatus}</b></p>
        ${reasonHtml}
        <p>موفق باشید 🌟</p>
        <p>فینوجا</p>
      </div>
    `
  };
}
