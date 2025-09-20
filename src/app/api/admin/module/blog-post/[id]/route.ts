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

    // Update the blog post (topic) content
    const updateData: any = {};
    
    if (body.title !== undefined) {
      updateData.title = body.title;
    }
    
    if (body.content !== undefined) {
      updateData.content = body.content;
    }
    
    // Auto-generate excerpt from content if not provided
    if (body.content && !body.excerpt) {
      // Strip HTML tags and get first 150 characters
      const plainText = body.content.replace(/<[^>]*>/g, '');
      updateData.excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    }

    // Update the blog post
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
        slug: true,
        createdAt: true,
        module: {
          select: {
            id: true,
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

    return NextResponse.json({ 
      success: true, 
      blogPost: updatedPost,
      message: "Topic content updated successfully. Changes will reflect on the blog within 1 minute." 
    });
  } catch (err) {
    console.error("Error updating blog post from module:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}