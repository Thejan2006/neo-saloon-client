import prisma from "@/lib/prisma";
import  { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import 'dotenv/config';


export async function POST(request: NextRequest) {
    const body = await request.json();
    // console.log("Received request body:", body);
    if (body.email == null) {  // check body have email if deos't have email return error
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const user = await prisma.user.findFirst( //this is fist user in the database

        {

            where: { email: body.email }
        }

    )


    if (user == null) {  // check user is null if null return error
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await compare(body.password, user.password); // check password is valid or not
    if (isPasswordValid) {
         // make token with jose (making id card)
         const sercretText = process.env.JOSE_SECRET_KEY ;
         const sercret = new TextEncoder().encode(sercretText);
         
         const token = await new jose.SignJWT( //  (token) is created with user details
            { email : user.email,
               firstname : user.firstname,
               lastname : user.lastname,
               role : user.role,
               privileges : user.privileges

            }

         ).setProtectedHeader({ alg: "HS256" }).sign(sercret);

        const response = NextResponse.json({
            
            message: "Login successful",
            role: user.role, 

        }
        );
       
        response.cookies.set({ // set cookie with token
             
            name: "login_token",
            value: token,
            httpOnly: true,// this cookie is only accessible by the server 
            secure: false, // set to true in production
            sameSite: "strict", // this cookie is only accessible by the same site
           } 
         )

    
    } else {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
} 