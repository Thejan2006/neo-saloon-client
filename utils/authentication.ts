import { NextRequest } from "next/server";
import * as jose from "jose";
import type { RequestUserType } from "@/types/requestUser";

export async function getUser(request : NextRequest) : Promise<RequestUserType | null>{

    const loginToken = request.cookies.get("login_token")?.value
    const secretText = process.env.JOSE_SECRET_KEY

    if (!loginToken || !secretText) {
        return null
    }

    const secret = new TextEncoder().encode(secretText)

    try{

        const tokenData = await jose.jwtVerify(
            loginToken,
            secret
        )

        const user = tokenData.payload as unknown as RequestUserType

        return user

    }catch{

        return null

    }
}

export async function isPrivileged(request : NextRequest , privilege : string) : Promise<boolean>{

    const user:RequestUserType | null = await getUser(request)

    if(user == null){
        return false
    }

    return Array.isArray(user.privileges) && user.privileges.includes(privilege)
}