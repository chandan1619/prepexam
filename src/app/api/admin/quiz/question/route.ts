import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { quizId, type, question, options, correct } = await req.json();
    if (!quizId || !type || !question || correct === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const quizQuestion = await prisma.quizQuestion.create({
      data: {
        quizId,
        type,
        question,
        options: options || [],
        correct,
      },
    });
    return NextResponse.json({ quizQuestion });
  } catch {
    return NextResponse.json(
      { error: "Not authorized or server error" },
      { status: 403 }
    );
  }
}
