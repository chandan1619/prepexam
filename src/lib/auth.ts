import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get the current user from Clerk and fetch their role from the DB
export async function getCurrentUserWithRole() {
  const { userId } = await  auth();
  if (!userId) throw new Error("Not authenticated");
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) throw new Error("User not found in DB");
  return user;
}

// Throws if the current user is not an admin
export async function requireAdmin() {
  const user = await getCurrentUserWithRole();
  if (user.role !== "admin") {
    throw new Error("Not authorized: Admins only");
  }
  return user;
}
