// lib/sms.js
const PAYAMAK_USERNAME = process.env.PAYAMAK_USERNAME;
const PAYAMAK_PASSWORD = process.env.PAYAMAK_PASSWORD;
const PAYAMAK_FROM = process.env.PAYAMAK_FROM; // مثلا '1000...'

/**
 * ارسال پیامک (OTP یا ...)
 * @param {string} to شماره گیرنده (مثلا '09...')
 * @param {string} text متن پیامک
 * @returns {Promise<{ok: boolean, data: any}>}
 */
export async function sendSMS(to, text) {
  const url = "https://rest.payamak-panel.com/api/SendSMS/SendSMS";
  const body = {
    username: PAYAMAK_USERNAME,
    password: PAYAMAK_PASSWORD,
    to, // تک شماره یا با کاما جدا (مثلا "0912...,0935...")
    from: PAYAMAK_FROM,
    text,
    isFlash: false,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return {
    ok: data.RetStatus === 1,
    data,
  };
}
