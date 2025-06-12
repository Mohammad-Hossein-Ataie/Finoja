import dbConnect from '@/lib/dbConnect';
import Teacher from '@/models/Teacher';

export async function PUT(request, { params }) {
  await dbConnect();
  const body = await request.json();
  const updated = await Teacher.findByIdAndUpdate(params.id, body, { new: true });
  return Response.json(updated);
}

export async function DELETE(request, { params }) {
  await dbConnect();
  await Teacher.findByIdAndDelete(params.id);
  return Response.json({ deleted: true });
}
