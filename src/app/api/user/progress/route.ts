import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch user's quiz progress from the database
  return NextResponse.json({ progress: [] });
}
