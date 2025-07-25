import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { moduleId, question, solution, year, isFree } = await req.json();
    if (!moduleId || !question || !solution || !year) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const pyq = await prisma.pYQ.create({
      data: {
        moduleId,
        question,
        solution,
        year,
        isFree: isFree ?? false,
      },
    });
    return NextResponse.json({ pyq });
  } catch (err) {
    return NextResponse.json(
      { error: "Not authorized or server error" },
      { status: 403 }
    );
  }
}
