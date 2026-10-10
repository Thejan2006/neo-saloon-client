import prisma from "@/lib/prisma";
import  { NextRequest, NextResponse } from "next/server";
import z from "zod";
import getPaginationInfo from "@/utils/pageInfoRetrieval";
import { ProductStatus } from "@/app/generated/prisma/enums";
import ProductUpdateRequestSchema from "@/types/dto/ProductUpdateRequest";

// get product by id
export async function GET(request: NextRequest){

   const id = request.nextUrl.searchParams.get("id") || ""

   if(!id){
      return NextResponse.json({message: "Product id is required"}, {status: 400}) // check if id is provided

   }
    const product = await prisma.product.findUnique({
        where: {
            id: id
        }
    })
    if(!product){
        return NextResponse.json({message: "Product not found"}, {status: 404})
    }
    return NextResponse.json(product)
    if(product.status === ProductStatus.DELETED){
        return NextResponse.json({message: "Product is deleted"}, {status: 400})


    }

    if(product.status === ProductStatus.INACTIVE){

        const hasprivilege = await isprivileged(request, "product:read") // only privileged users can read disabled products

        if(!hasprivilege){  // check if user has privilege to read disabled products
            return NextResponse.json({message: "You are not authorized to view this product"}, {status: 403})
        }
        return NextResponse.json({message: "Product is inactive"}, {status: 400})
    }

}