import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { isPrivileged } from "@/utils/authentication";
import ProductCreationRequestSchema, {
//   ProductStatusEnum,
} from "@/types/dto/ProductCreationRequest";


export async function GET(request: NextRequest) {
  const loginToken = request.cookies.get("login_token")?.value;
  const secretText = process.env.JOSE_SECRET_KEY;

  if (!loginToken || !secretText) {
    return new Response("Unauthorized", { status: 401 });
  }

  const secret = new TextEncoder().encode(secretText);

  try {
    const user = await jose.jwtVerify(loginToken, secret);
    console.log(user);

    return NextResponse.json({ user: user.payload });
  } catch (error) {
    return new Response("Unauthorized", { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  const hasPrivilege = await isPrivileged(request, "products:add");

  if (!hasPrivilege) {
    return NextResponse.json(
      { message: "You do not have the required privilege to add a product" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const parsedBody = ProductCreationRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { message: parsedBody.error.issues[0]?.message ?? "Invalid product data" },
        { status: 400 }
      );
    }

    const product = await (prisma as any).product.create({
      data: {
        sku: parsedBody.data.sku,
        name: parsedBody.data.name,
        altNames: parsedBody.data.altName,
        description: parsedBody.data.description,
        stock: parsedBody.data.stock,
        status: parsedBody.data.status, //as ProductStatusEnum
        price: parsedBody.data.price,
        compareAt: parsedBody.data.compareAt,
        brand: parsedBody.data.brand,
        model: parsedBody.data.model,
        media: {
          create: parsedBody.data.media,
        },
      },
    });

    return NextResponse.json(
      { message: "Product created successfully", product },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "Invalid product data" },
        { status: 400 }
      );
    }

    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


