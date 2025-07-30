import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const courseSchema = z.object({
  title: z.string().min(3),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional(), // Allow empty description
  category: z.string().optional(),
  level: z.string().optional(),
  duration: z.string().optional(),
  priceInINR: z.coerce.number().int().min(0), // Coerce string to number
  imageUrl: z.string().url().optional().or(z.literal("")), // Allow empty string for imageUrl
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = courseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const {
      title,
      slug,
      description,
      category,
      level,
      duration,
      priceInINR,
      imageUrl,
    } = parsed.data;
    const exam = await prisma.exam.create({
      data: {
        title,
        slug,
        description: description || "",
        category: category || null,
        level: level || null,
        duration: duration || null,
        priceInINR,
        imageUrl: imageUrl || null,
        isPublished: true, // Set as published by default for admin-created courses
      },
    });
    return NextResponse.json({ exam });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
