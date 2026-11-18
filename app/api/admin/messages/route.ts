import prisma from "@/lib/prisma";
import { getUser } from "@/utils/authentication";
import { getWelcomeEligibilityDate } from "@/utils/welcomeMessage";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const welcomeMessageSchema = z.object({
  clientId: z.string().uuid(),
  content: z.string().trim().min(1, "Message is required").max(1000, "Message must be 1000 characters or fewer"),
});

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }
  if (user.role !== "ADMIN" && !user.privileges.includes("client-messages:send")) {
    return NextResponse.json({ message: "You do not have permission to send welcome messages" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = welcomeMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
  }

  const client = await prisma.user.findUnique({
    where: { id: parsed.data.clientId },
    select: { id: true, role: true, status: true, CreatedAt: true },
  });
  if (!client || client.role !== "CUSTOMER") {
    return NextResponse.json({ message: "Client not found" }, { status: 404 });
  }

  if (client.status !== "ACTIVE" || client.CreatedAt < getWelcomeEligibilityDate()) {
    return NextResponse.json({ message: "Welcome messages are only available for active clients who joined within the last 7 days" }, { status: 409 });
  }

  try {
    const welcomeMessage = await prisma.welcomeMessage.create({
      data: {
        recipientId: client.id,
        senderId: user.id,
        content: parsed.data.content,
      },
      select: { id: true, content: true, createdAt: true },
    });
    return NextResponse.json({ message: "Welcome message sent", welcomeMessage }, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ message: "This client has already received a welcome message" }, { status: 409 });
    }
    throw error;
  }
}
