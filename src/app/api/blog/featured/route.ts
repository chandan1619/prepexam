import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const featuredPosts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        createdAt: true,
        module: {
          select: {
            title: true,
            exam: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6, // Limit to 6 featured posts
    });

    const response = NextResponse.json(featuredPosts);
    // Reduce cache time to 60 seconds to ensure changes reflect quickly
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
