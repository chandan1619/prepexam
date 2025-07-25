import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch lesson details from the database
  return NextResponse.json({ lesson: null });
}
