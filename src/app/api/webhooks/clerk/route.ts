import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function validateRequest(request: Request) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await request.text();
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  return evt;
}

export async function POST(request: Request) {
  try {
    const evt = await validateRequest(request);

    if (!evt || evt instanceof Response) {
      return evt || new Response("Invalid webhook", { status: 400 });
    }

    const eventType = evt.type;
    console.log(`Webhook received: ${eventType}`);

    if (eventType === "user.created" && evt.data.object === "user") {
      const userData = evt.data as any;
      const { id, email_addresses, primary_email_address_id } = userData;

      // Get the primary email address
      const primaryEmail = email_addresses?.find(
        (email: any) => email.id === primary_email_address_id
      );

      if (!primaryEmail) {
        console.error("No primary email found for user:", id);
        return new Response("No primary email found", { status: 400 });
      }

      // Create user in your database
      try {
        const user = await prisma.user.create({
          data: {
            clerkId: id,
            email: primaryEmail.email_address,
            role: "user", // Default role for new users
          },
        });

        console.log("User created in database:", user);
        return NextResponse.json({ success: true, user });
      } catch (error) {
        console.error("Error creating user in database:", error);
        return new Response("Error creating user in database", { status: 500 });
      }
    }

    if (eventType === "user.updated" && evt.data.object === "user") {
      const userData = evt.data as any;
      const { id, email_addresses, primary_email_address_id } = userData;

      // Update user in your database if needed
      const primaryEmail = email_addresses?.find(
        (email: any) => email.id === primary_email_address_id
      );

      if (primaryEmail) {
        try {
          const user = await prisma.user.update({
            where: { clerkId: id },
            data: {
              email: primaryEmail.email_address,
            },
          });

          console.log("User updated in database:", user);
          return NextResponse.json({ success: true, user });
        } catch (error) {
          console.error("Error updating user in database:", error);
          return new Response("Error updating user in database", {
            status: 500,
          });
        }
      }
    }

    if (eventType === "user.deleted" && evt.data.object === "user") {
      const userData = evt.data as any;
      const { id } = userData;

      // Delete user from your database
      try {
        await prisma.user.delete({
          where: { clerkId: id },
        });

        console.log("User deleted from database:", id);
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error("Error deleting user from database:", error);
        return new Response("Error deleting user from database", {
          status: 500,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Webhook error", { status: 500 });
  }
}
