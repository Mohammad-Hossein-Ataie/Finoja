import dbConnect from '@/lib/dbConnect';
import Course from '@/models/Course';

export async function GET() {
  await dbConnect();
  const courses = await Course.find();
  return Response.json(courses);
}

export async function POST(request) {
  await dbConnect();
  const body = await request.json();
  const course = await Course.create(body);
  return Response.json(course);
}
