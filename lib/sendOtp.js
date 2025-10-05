// lib/sendOtp.js
import axios from "axios";

const PAYAMAK_API_URL = "https://rest.payamak-panel.com/api/SendSMS/SendSMS";
const USERNAME = process.env.PAYAMAK_USER || "9124469400";
const PASSWORD = process.env.PAYAMAK_PASS || "7c45db3e-280c-4643-a88c-bd69915e81d9";
const FROM_NUMBER = process.env.PAYAMAK_FROM || "50004001469400";

/**
 * ارسال OTP با پنل پیامک
 * @param {string} mobile - شماره موبایل مقصد (11 رقمی ایران یا فرمت معتبر)
 * @param {string|number} code - کد تایید
 * @param {string} [text] - متن دلخواه؛ اگر خالی باشد متن پیش‌فرض شامل کد ارسال می‌شود
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function sendOtpSMS(mobile, code, text = "") {
  if (!mobile) {
    return { success: false, message: "شماره موبایل وارد نشده است." };
  }
  const body = {
    username: USERNAME,
    password: PASSWORD,
    to: mobile,
    from: FROM_NUMBER,
    text: text || `کد ورود شما: ${code}`,
    isFlash: false,
  };

  try {
    const { data } = await axios.post(PAYAMAK_API_URL, body);
    if (data?.RetStatus === 1) {
      return { success: true };
    }
    return {
      success: false,
      message: data?.StrRetStatus || "خطا در ارسال پیامک",
    };
  } catch (e) {
    return { success: false, message: "خطای ارتباط با سرویس پیامک" };
  }
}

/** سازگاری به عقب: بسیاری از بخش‌ها از نام `sendOtp` استفاده می‌کنند. */
export const sendOtp = sendOtpSMS;

/** در صورت نیاز به ایمپورت پیش‌فرض */
export default { sendOtpSMS, sendOtp };
