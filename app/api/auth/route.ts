import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import "dotenv/config";

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (!body.password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { email: body.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isPasswordValid = await compare(body.password, user.password);

  if (!isPasswordValid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const secretText = process.env.JOSE_SECRET_KEY;
  if (!secretText) {
    return NextResponse.json({ error: "Server JWT secret missing" }, { status: 500 });
  }

  const secret = new TextEncoder().encode(secretText);

  const token = await new jose.SignJWT({
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    role: user.role,
    privileges: user.privileges,
  })
    .setProtectedHeader({ alg: "HS256" })
    .sign(secret);

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
  });

  return response;
}