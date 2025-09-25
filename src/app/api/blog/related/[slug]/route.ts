import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // First, get the current blog post to find its module
    const currentBlog = await prisma.blogPost.findUnique({
      where: { 
        slug,
        isPublished: true,
        isFeatured: true,
      },
      select: {
        id: true,
        moduleId: true,
        module: {
          select: {
            id: true,
            title: true,
            examId: true,
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

    if (!currentBlog) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Get related blog posts from the same module (excluding current post)
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        moduleId: currentBlog.moduleId,
        isPublished: true,
        isFeatured: true,
        id: {
          not: currentBlog.id, // Exclude current post
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 4, // Limit to 4 related posts
    });

    // If no related posts from same module, get posts from same exam
    let fallbackPosts: Array<{
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      createdAt: Date;
      module: {
        title: string;
      };
    }> = [];
    if (relatedPosts.length < 2 && currentBlog.module.examId) {
      fallbackPosts = await prisma.blogPost.findMany({
        where: {
          module: {
            examId: currentBlog.module.examId,
          },
          isPublished: true,
          isFeatured: true,
          id: {
            not: currentBlog.id,
          },
          moduleId: {
            not: currentBlog.moduleId, // Different module but same exam
          },
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
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 4 - relatedPosts.length, // Fill up to 4 total posts
      });
    }

    // Combine related posts and fallback posts
    const allRelatedPosts = [
      ...relatedPosts.map(post => ({
        ...post,
        module: { title: currentBlog.module.title }, // Same module
        isFromSameModule: true,
      })),
      ...fallbackPosts.map(post => ({
        ...post,
        isFromSameModule: false,
      })),
    ];

    const response = NextResponse.json({
      relatedPosts: allRelatedPosts,
      moduleInfo: {
        title: currentBlog.module.title,
        examTitle: currentBlog.module.exam?.title,
        examSlug: currentBlog.module.exam?.slug,
      },
    });

    // Cache for 5 minutes
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=900'
    );
    
    return response;
  } catch (err) {
    console.error("Error fetching related blog posts:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}