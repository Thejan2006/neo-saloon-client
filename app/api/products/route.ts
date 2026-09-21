import { NextRequest } from "next/server";
import * as jose from "jose";

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