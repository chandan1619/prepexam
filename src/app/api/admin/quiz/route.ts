import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { moduleId, title, description } = await req.json();
    if (!moduleId || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const quiz = await prisma.quiz.create({
      data: {
        moduleId,
        title,
        description: description || null,
      },
      include: { questions: true },
    });
    return NextResponse.json({ quiz });
  } catch (err) {
    return NextResponse.json(
      { error: "Not authorized or server error" },
      { status: 403 }
    );
  }
}
