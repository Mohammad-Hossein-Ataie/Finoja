import dbConnect from '@/lib/dbConnect';
import Course from '@/models/Course';

export async function GET() {
  await dbConnect();
  const courses = await Course.find().populate("teacher");
  return Response.json(courses);
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const created = await Course.create(body);
  const populated = await Course.findById(created._id).populate("teacher");
  return Response.json(populated);
}
