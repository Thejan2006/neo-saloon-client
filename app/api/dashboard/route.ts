import prisma from "@/lib/prisma";
import { getUser } from "@/utils/authentication";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }
  if (user.role !== "CUSTOMER") {
    return NextResponse.json({ message: "Client dashboard access required" }, { status: 403 });
  }

  const [account, welcomeMessage] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        firstname: true,
        lastname: true,
        email: true,
        CreatedAt: true,
      },
    }),
    prisma.welcomeMessage.findUnique({
      where: { recipientId: user.id },
      select: {
        content: true,
        createdAt: true,
        sender: {
          select: { firstname: true, lastname: true },
        },
      },
    }),
  ]);

  if (!account) {
    return NextResponse.json({ message: "Account not found" }, { status: 404 });
  }

  return NextResponse.json({
    client: account,
    welcomeMessage,
  });
}
