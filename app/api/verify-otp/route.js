import dbConnect from '../../../lib/dbConnect';
import OTP from '../../../models/OTP';

export async function POST(req) {
  await dbConnect();
  const { mobile, code, type } = await req.json();
  const otpDoc = await OTP.findOne({ mobile, code, type });
  if (!otpDoc) return Response.json({ error: 'کد اشتباه است یا منقضی شده.' }, { status: 400 });
  await OTP.deleteOne({ _id: otpDoc._id });
  return Response.json({ success: true });
}
