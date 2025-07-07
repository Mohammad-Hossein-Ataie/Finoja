import dbConnect from '../../../lib/dbConnect';
import Student from '../../../models/Student';

export async function POST(req) {
  await dbConnect();
  const { mobile } = await req.json();
  const exists = await Student.findOne({ mobile });
  return Response.json({ exists: !!exists });
}
