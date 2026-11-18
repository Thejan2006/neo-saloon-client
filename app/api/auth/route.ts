import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import "dotenv/config";
import { z } from "zod";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }).safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "A valid email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsedBody.data.email.trim().toLowerCase() },
  });

  const isPasswordValid = user ? await compare(parsedBody.data.password, user.password) : false;

  if (!user || user.status !== "ACTIVE" || !isPasswordValid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const secretText = process.env.JOSE_SECRET_KEY;
  if (!secretText) {
    return NextResponse.json({ error: "Server JWT secret missing" }, { status: 500 });
  }

  const secret = new TextEncoder().encode(secretText);

  const token = await new jose.SignJWT({
    id: user.id,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer("neo-saloon-client")
    .setAudience("neo-saloon-client")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const response = NextResponse.json({
    message: "Login successful",
    role: user.role,
  });

  response.cookies.set({
    name: "login_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}