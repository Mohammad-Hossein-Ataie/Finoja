import dbConnect from '@/lib/dbConnect';
import Course from '@/models/Course';

export async function GET(request) {
  await dbConnect();
  const { params } = await request;
  const course = await Course.findById(params.id).populate("teacher");
  return Response.json(course);
}

export async function PUT(request) {
  await dbConnect();
  const { params } = await request;
  const body = await request.json();
  const updated = await Course.findByIdAndUpdate(params.id, body, { new: true }).populate("teacher");
  return Response.json(updated);
}

export async function DELETE(request) {
  await dbConnect();
  const { params } = await request;
  await Course.findByIdAndDelete(params.id);
  return Response.json({ deleted: true });
}
