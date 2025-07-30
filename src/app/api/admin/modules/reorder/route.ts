import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reorderModulesSchema = z.object({
  courseId: z.string(),
  modules: z.array(z.object({
    id: z.string(),
    order: z.number(),
  })),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = reorderModulesSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { courseId, modules } = parsed.data;

    // Verify that all modules belong to the specified course
    const moduleIds = modules.map(m => m.id);
    const existingModules = await prisma.module.findMany({
      where: {
        id: { in: moduleIds },
        examId: courseId,
      },
      select: { id: true },
    });

    if (existingModules.length !== modules.length) {
      return NextResponse.json(
        { error: "Some modules don't belong to this course" },
        { status: 400 }
      );
    }

    // Update order for each module
    const updatePromises = modules.map(module => 
      prisma.module.update({
        where: { id: module.id },
        data: { order: module.order },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ 
      success: true, 
      message: `Updated order for ${modules.length} modules` 
    });
  } catch (err) {
    console.error('Module reorder error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}