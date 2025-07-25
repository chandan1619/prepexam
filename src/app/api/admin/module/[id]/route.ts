import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    // Delete all related records first, in the correct order
    await prisma.blogPost.deleteMany({ where: { moduleId: id } });
    // Delete quiz questions before deleting quizzes
    const quizzes = await prisma.quiz.findMany({ where: { moduleId: id } });
    for (const quiz of quizzes) {
      await prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
    }
    await prisma.quiz.deleteMany({ where: { moduleId: id } });
    await prisma.pYQ.deleteMany({ where: { moduleId: id } });
    await prisma.moduleQuestion.deleteMany({ where: { moduleId: id } });
    // Now delete the module
    await prisma.module.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
