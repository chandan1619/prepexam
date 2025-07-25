import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    await requireAdmin();
    const blogs = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        excerpt: true,
        isFree: true,
        isPublished: true,
        isFeatured: true,
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
    return NextResponse.json({ blogs });
  } catch (err) {
    return NextResponse.json(
      { error: "Not authorized or server error" },
      { status: 403 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { moduleId, title, content, excerpt, isFree, isPublished, isFeatured } = await req.json();
    if (!moduleId || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    const blogPost = await prisma.blogPost.create({
      data: {
        moduleId,
        title,
        slug,
        content,
        excerpt,
        isFree: isFree ?? false,
        isPublished: isPublished ?? false,
        isFeatured: isFeatured ?? false,
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        isFree: true,
        isPublished: true,
        isFeatured: true,
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
    return NextResponse.json({ blogPost });
  } catch (err) {
    return NextResponse.json(
      { error: "Not authorized or server error" },
      { status: 403 }
    );
  }
}
