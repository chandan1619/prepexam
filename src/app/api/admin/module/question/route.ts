import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { moduleId, type, question, options, correct } = await req.json();
    if (!moduleId || !type || !question || correct === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const moduleQuestion = await prisma.moduleQuestion.createMany({
      data: {
        moduleId,
        type,
        question,
        options: options || [],
        correct,
      },
    });
    return NextResponse.json({ moduleQuestion });
  } catch {
    return NextResponse.json(
      { error: "Not authorized or server error" },
      { status: 403 }
    );
  }
}
