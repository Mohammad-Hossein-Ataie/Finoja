import dbConnect from '@/lib/dbConnect';

import Course from '@/models/Course';

export async function GET(request, { params }) {
  await dbConnect();
  const course = await Course.findById(params.id).populate("teacher");
  return Response.json(course);
}

export async function PUT(request, { params }) {
  await dbConnect();
  const body = await request.json();
  const updated = await Course.findByIdAndUpdate(params.id, body, { new: true });
  return Response.json(updated);
}

export async function DELETE(request, { params }) {
  await dbConnect();
  await Course.findByIdAndDelete(params.id);
  return Response.json({ deleted: true });
}
