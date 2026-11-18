import prisma from "@/lib/prisma";
import { getUser } from "@/utils/authentication";
import { getWelcomeEligibilityDate } from "@/utils/welcomeMessage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }
  if (user.role !== "ADMIN" && !user.privileges.includes("users:read")) {
    return NextResponse.json({ message: "You do not have permission to view clients" }, { status: 403 });
  }

  const pageNumber = Number(request.nextUrl.searchParams.get("pageNumber") ?? "1");
  const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? "25");
  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100
  ) {
    return NextResponse.json(
      { message: "pageNumber must be positive and pageSize must be between 1 and 100" },
      { status: 400 },
    );
  }

  const where = { role: "CUSTOMER" };
  const [totalCount, clients] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { CreatedAt: "desc" },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        status: true,
        CreatedAt: true,
        lastLogin: true,
        receivedWelcomeMessage: { select: { id: true } },
      },
    }),
  ]);

  const eligibleAfter = getWelcomeEligibilityDate();
  return NextResponse.json({
    clients: clients.map(({ receivedWelcomeMessage, ...client }) => ({
      ...client,
      eligibleForWelcome:
        client.status === "ACTIVE" &&
        client.CreatedAt >= eligibleAfter &&
        receivedWelcomeMessage === null,
      hasReceivedWelcome: receivedWelcomeMessage !== null,
    })),
    pagination: {
      pageNumber,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  });
}
