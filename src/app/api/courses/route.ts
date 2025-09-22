import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cache for 5 minutes, stale-while-revalidate for 10 minutes
const CACHE_DURATION = 300; // 5 minutes
const STALE_WHILE_REVALIDATE = 600; // 10 minutes

export async function GET() {
  try {
    const courses = await prisma.exam.findMany({
      where: { isPublished: true },
      include: {
        modules: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const response = NextResponse.json(courses);
    
    // Set cache headers for better performance
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`
    );
    response.headers.set('CDN-Cache-Control', `public, max-age=${CACHE_DURATION}`);
    response.headers.set('Vercel-CDN-Cache-Control', `public, max-age=${CACHE_DURATION}`);
    
    return response;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
