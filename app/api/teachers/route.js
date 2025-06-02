import dbConnect from '@/lib/dbConnect';

import Teacher from '@/models/Teacher';

export async function GET() {
  await dbConnect();
  const teachers = await Teacher.find();
  return Response.json(teachers);
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const created = await Teacher.create(body);
  return Response.json(created);
}
