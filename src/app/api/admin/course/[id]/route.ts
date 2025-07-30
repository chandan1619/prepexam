import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const course = await prisma.exam.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: {
            order: 'asc',
          },
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
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
