import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateModuleSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  isFree: z.boolean().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    
    const module = await prisma.module.findUnique({
      where: { id },
      include: {
        blogPosts: true,
        pyqs: true,
        quizzes: {
          include: {
            questions: true,
          },
        },
        moduleQuestions: true,
      },
    });

    if (!module) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ module });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateModuleSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.isFree !== undefined) updateData.isFree = parsed.data.isFree;

    const updatedModule = await prisma.module.update({
      where: { id },
      data: updateData,
      include: {
        blogPosts: true,
        pyqs: true,
        quizzes: {
          include: {
            questions: true,
          },
        },
        moduleQuestions: true,
      },
    });

    return NextResponse.json({ module: updatedModule });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
