import { NextRequest } from "next/server";
import * as jose from "jose";

async function GetUser(request: NextRequest) {

    const loginToken = request.cookies.get("login_token")?.value; // get cookie from request
      const sercretText = process.env.JOSE_SECRET_KEY ;
      const sercret = new TextEncoder().encode(sercretText);

      try {
         const user = await jose.jwtVerify( // verify token with secret key
        
         loginToken || "",
         sercret
    
    ); 
    return user.payload; 
} catch (error) {
    console.error("Error verifying token:", error);
    return null; // Return null if token verification fails
  }


}
