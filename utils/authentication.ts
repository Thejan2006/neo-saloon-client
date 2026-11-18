import { NextRequest } from "next/server";
import * as jose from "jose";
import prisma from "@/lib/prisma";
import type { RequestUserType } from "@/types/requestUser";

const TOKEN_ISSUER = "neo-saloon-client";
const TOKEN_AUDIENCE = "neo-saloon-client";

export async function getUser(request: NextRequest): Promise<RequestUserType | null> {
  const loginToken = request.cookies.get("login_token")?.value;
  const secretText = process.env.JOSE_SECRET_KEY;

  if (!loginToken || !secretText) {
    return null;
  }

  let tokenData: jose.JWTVerifyResult;
  try {
    tokenData = await jose.jwtVerify(loginToken, new TextEncoder().encode(secretText), {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      algorithms: ["HS256"],
    });
  } catch {
    return null;
  }

  const userId = tokenData.payload.sub;
  if (!userId || tokenData.payload.id !== userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstname: true,
      lastname: true,
      role: true,
      status: true,
      privileges: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  const privileges = Array.isArray(user.privileges)
    ? user.privileges.filter((privilege): privilege is string => typeof privilege === "string")
    : [];

  return {
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    role: user.role,
    privileges,
  };
}

export async function isPrivileged(request: NextRequest, privilege: string): Promise<boolean> {
  const user: RequestUserType | null = await getUser(request);
  return user !== null && user.privileges.includes(privilege);
}