import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const blog = await prisma.blogPost.findUnique({
      where: { 
        slug,
        isPublished: true, // Only allow access to published blogs
        isFeatured: true,  // Only allow access to featured blogs (for marketing)
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
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
    });

    if (!blog) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Set cache headers for better performance
    const response = NextResponse.json(blog);
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    
    return response;
  } catch (err) {
    console.error("Error fetching blog post:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}