import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cache for 10 minutes, stale-while-revalidate for 30 minutes
const CACHE_DURATION = 600; // 10 minutes
const STALE_WHILE_REVALIDATE = 1800; // 30 minutes

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
          orderBy: { order: 'asc' },
          include: {
            blogPosts: {
              orderBy: { order: 'asc' },
            },
            quizzes: {
              orderBy: { order: 'asc' },
              include: {
                questions: true,
              },
            },
            pyqs: {
              orderBy: { order: 'asc' },
            },
            moduleQuestions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
    
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const response = NextResponse.json({ course });
    
    // Set cache headers for better performance
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`
    );
    response.headers.set('CDN-Cache-Control', `public, max-age=${CACHE_DURATION}`);
    response.headers.set('Vercel-CDN-Cache-Control', `public, max-age=${CACHE_DURATION}`);
    
    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
