import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getUser, isPrivileged } from "@/utils/authentication";
import ProductCreationRequestSchema from "@/types/dto/ProductCreationRequest";


export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }
  return NextResponse.json({ user });
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

    const product = await prisma.product.create({
      data: {
        sku: parsedBody.data.sku,
        name: parsedBody.data.name,
        altNames: parsedBody.data.altNames,
        description: parsedBody.data.description,
        stock: parsedBody.data.stock,
        status: parsedBody.data.status,
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

