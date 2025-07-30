import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reorderSchema = z.object({
  type: z.enum(['blogPost', 'quiz', 'pyq', 'moduleQuestion']),
  items: z.array(z.object({
    id: z.string(),
    order: z.number(),
  })),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = reorderSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { type, items } = parsed.data;

    // Update order for each item based on type
    const updatePromises = items.map(item => {
      switch (type) {
        case 'blogPost':
          return prisma.blogPost.update({
            where: { id: item.id },
            data: { order: item.order },
          });
        case 'quiz':
          return prisma.quiz.update({
            where: { id: item.id },
            data: { order: item.order },
          });
        case 'pyq':
          return prisma.pYQ.update({
            where: { id: item.id },
            data: { order: item.order },
          });
        case 'moduleQuestion':
          return prisma.moduleQuestion.update({
            where: { id: item.id },
            data: { order: item.order },
          });
        default:
          throw new Error(`Unknown content type: ${type}`);
      }
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ 
      success: true, 
      message: `Updated order for ${items.length} ${type} items` 
    });
  } catch (err) {
    console.error('Reorder error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}