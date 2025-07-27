import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { isFeatured } = await req.json();

    // Toggle featured status and ensure the post is published
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        isFeatured,
        isPublished: true, // Ensure featured posts are always published
      },
      select: {
        id: true,
        title: true,
        isFeatured: true,
        isPublished: true,
        module: {
          select: {
            title: true,
            exam: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (err) {
    console.error("Error updating blog post:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

// Get a single blog post with its featured status
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const post = await prisma.blogPost.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        excerpt: true,
        isFeatured: true,
        isPublished: true,
        module: {
          select: {
            title: true,
            exam: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
