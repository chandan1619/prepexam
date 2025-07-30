import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { moduleId, title, description, type, passingMark, timeLimit } = await req.json();
    if (!moduleId || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Validate quiz type
    const validTypes = ['PRACTICE', 'ASSESSMENT'];
    const quizType = type && validTypes.includes(type) ? type : 'ASSESSMENT';
    
    const quiz = await prisma.quiz.create({
      data: {
        moduleId,
        title,
        description: description || null,
        type: quizType,
        passingMark: passingMark || (quizType === 'PRACTICE' ? 0 : 40),
        timeLimit: timeLimit || (quizType === 'PRACTICE' ? 0 : 30),
      },
      include: { questions: true },
    });
    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('Quiz creation error:', error);
    return NextResponse.json(
      { error: "Not authorized or server error" },
      { status: 403 }
    );
  }
}
