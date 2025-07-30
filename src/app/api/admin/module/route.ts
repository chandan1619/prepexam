import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const moduleSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  examId: z.string(),
  isFree: z.boolean().optional().default(false),
  order: z.number().optional().default(0),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = moduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { title, description, examId, isFree, order } = parsed.data;
    const moduleData = await prisma.module.create({
      data: {
        title,
        description: description || null,
        examId,
        isFree: isFree ?? false,
        order: order ?? 0,
      },
      include: {
        blogPosts: true,
        pyqs: true,
        quizzes: true,
      },
    });
    return NextResponse.json({ module: moduleData });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
