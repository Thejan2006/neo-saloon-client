import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { isPrivileged } from "@/utils/authentication";

export async function GET(request : NextRequest){

    const loginToken = request.cookies.get("login_token")?.value
    const secretText = process.env.JOSE_SECRET_KEY

    if (!loginToken || !secretText) {
        return new Response("Unauthorized", { status: 401 })
    }

    const secret = new TextEncoder().encode(secretText)

    const user = await jose.jwtVerify(
        loginToken,
        secret
    )

    console.log(user)

    //if 



    console.log("GET request received at /api/products");
}

    export async function POST(request : NextRequest){

    const hasPrivilege = await isPrivileged(request , "products:add")

    if(hasPrivilege){

        const body = await request.json()

        

    }else{
        return NextResponse.json({message : "You do not have the required privilege to add a product"} , {status : 403})
    }
}

