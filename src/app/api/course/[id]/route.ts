import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Try to find by slug first, fallback to id
    const course = await prisma.exam.findFirst({
      where: {
        OR: [{ slug: id }, { id: id }],
        isPublished: true,
      },
      include: {
        modules: {
          include: {
            blogPosts: true,
            quizzes: {
              include: {
                questions: true,
              },
            },
            pyqs: true,
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
