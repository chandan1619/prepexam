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
    const body = await req.json();

    // Handle different types of updates
    const updateData: any = {};
    
    if (body.isFeatured !== undefined) {
      updateData.isFeatured = body.isFeatured;
      updateData.isPublished = true; // Ensure featured posts are always published
    }
    
    if (body.title !== undefined) {
      updateData.title = body.title;
    }
    
    if (body.content !== undefined) {
      updateData.content = body.content;
    }
    
    if (body.excerpt !== undefined) {
      updateData.excerpt = body.excerpt;
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        content: true,
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
