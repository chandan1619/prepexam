import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      examId 
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !examId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Find the purchase record
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        examId: examId,
        orderId: razorpay_order_id,
        paymentStatus: "PENDING"
      }
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase record not found" }, { status: 404 });
    }

    // Update purchase status
    const updatedPurchase = await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        paymentId: razorpay_payment_id,
        paymentStatus: "SUCCESS",
        paymentMethod: "RAZORPAY"
      }
    });

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        examId: examId
      },
      include: {
        exam: {
          include: {
            modules: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      enrollment,
      purchase: updatedPurchase
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}