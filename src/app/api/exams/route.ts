import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch exams from the database
  return NextResponse.json({ exams: [] });
}
