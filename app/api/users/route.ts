import prisma from "@/lib/prisma";
import { getUser, isPrivileged } from "@/utils/authentication";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRegistrationRequestSchema } from "@/types/dto/UserRegistrationRequest";
import { UserSelfUpdateRequestSchema } from "@/types/dto/UserSelfUpdateRequest";
import { UserUpdateByAdminRequestSchema } from "@/types/dto/UserUpdateByAdminRequest";
export async function GET(request : NextRequest){

    const havePrivilege = await isPrivileged(request, "users:read")



    if(!havePrivilege){
        return NextResponse.json(
            {
                message : "You do not have the privilege to view users"
            },
            {
                status : 403
            }
        )
    }

    const pageNumber = Number(request.nextUrl.searchParams.get("pageNumber") ?? "1")
    const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? "10")

    if (
        !Number.isInteger(pageNumber) ||
        pageNumber < 1 ||
        !Number.isInteger(pageSize) ||
        pageSize < 1
    ) {
        return NextResponse.json(
            { message: "pageNumber and pageSize must be positive integers" },
            { status: 400 }
        )
    }

    const userCount = await prisma.user.count() //999 
    
    const totalPages = Math.ceil( userCount / pageSize )

    if(userCount > 0 && pageNumber > totalPages){
        return NextResponse.json(
            {
                message : "Page number exceeds total pages",
                totalPages : totalPages
            },
            {
                status : 400
            }
        )
    }

    const users = await prisma.user.findMany({
        skip : (pageNumber - 1) * pageSize,
        take : pageSize,
        select : {
            id :true,
            email :true,
            phone :true,
            firstname :true,
            lastname :true,
            password : false,
            role :true,
            status :true,
            profileImage : true,
            CreatedAt : true,
            lastLogin : true,
            privileges : true
        }
    })

    return NextResponse.json(
        {
            message : "Users fetched successfully",
            users : users,
            pagination : {
                pageNumber : pageNumber,
                pageSize : pageSize,
                totalPages : totalPages,
                totalCount : userCount
            }
        }
    )
}

export async function POST(request : NextRequest){

    //email , firstName, lastName, password, phone(optional)
    try{

        const body = await request.json()
        const parsedBody = UserRegistrationRequestSchema.parse(body)

        const existingUser = await prisma.user.findUnique(
            {
                where : {
                    email : parsedBody.email
                }
            }
        )

        if(existingUser != null){
            return NextResponse.json(
                {
                    message : "User with this email already exists"
                },
                {
                    status : 409
                }
            )
        }

        const passwordHash = await bcrypt.hash(parsedBody.password, 12)

        await prisma.user.create({
            data :{
                email : parsedBody.email,
                firstname : parsedBody.firstName,
                lastname : parsedBody.lastName,
                password : passwordHash,
                phone : parsedBody.phone,
            }
        })

        return NextResponse.json(
            {
                message : "User created successfully"
            },
            {
                status : 201
            }
        )
    }catch(error){
        
        if(error instanceof z.ZodError){

            // console.log(error.issues[0]?.message ?? "Invalid input")

            return NextResponse.json(
                {
                    message : error.issues[0]?.message ?? "Invalid input", // if the error message is not available, return "Invalid input"
                },
                {
                    status : 400
                }
            )

        }

        console.log(error)
        return NextResponse.json(
            {
                message : "Invalid request body",
                error : error
            },
            {
                status : 400
            }
        )

    }

}

export async function PUT(request : NextRequest){

    const id = request.nextUrl.searchParams.get("id")

    if (!id) {
        return NextResponse.json(
            { message: "User id is required" },
            { status: 400 }
        )
    }

    const requestedUser = await getUser(request)

    if(requestedUser == null){
        return NextResponse.json(
            {
                message : "You are not logged in"
            },
            {
                status : 401
            }
        )
    }

    try{

        const body = await request.json()

        if(requestedUser.id == id){
            
            //never allow users to update their own role, status, privileges

            const parsedBody = UserSelfUpdateRequestSchema.parse(body)
            const user = await prisma.user.findUnique({
                where : {
                    id : id
                }
            })

            if(user == null){
                return NextResponse.json(
                    {
                        message : "User not found"
                    },
                    {
                        status : 404
                    }
                )
            }

            await prisma.user.update({

                where : {
                    id : id
                },
                data : {
                    email : parsedBody.email ?? user.email,
                    firstname : parsedBody.firstName ?? user.firstname,
                    lastname : parsedBody.lastName ?? user.lastname,
                    phone : parsedBody.phone ?? user.phone,
                    profileImage : parsedBody.profileImage ?? user.profileImage
                }

            })

            return NextResponse.json(
                {
                    message : "User updated successfully"
                }
            )

        }else{
            
            const havePrivilege = await isPrivileged(request, "users:edit")           

            if(!havePrivilege){
                return NextResponse.json(
                    {
                        message : "You do not have the privilege to edit other users"
                    },
                    {
                        status : 403
                    }
                )
            }

            const parsedBody = UserUpdateByAdminRequestSchema.parse(body)

            const user = await prisma.user.findUnique({
                where : {
                    id
                }
            })



            if(user == null){
                return NextResponse.json(
                    {
                        message : "User not found"
                    },
                    {
                        status : 404
                    }
                )
            }
            
            await prisma.user.update({
                where : {
                    id
                },
                data : {
                    email : parsedBody.email ?? user.email,
                    firstname : parsedBody.firstName ?? user.firstname,
                    lastname : parsedBody.lastName ?? user.lastname,
                    phone : parsedBody.phone ?? user.phone,
                    profileImage : parsedBody.profileImage ?? user.profileImage,
                    role : parsedBody.role ?? user.role,
                    status : parsedBody.status ?? user.status,
                    privileges : parsedBody.privileges
                }
            })

            return NextResponse.json(
                {
                    message : "User updated successfully"
                }
            )
            
        }

    }catch(error){

        if(error instanceof z.ZodError){
            return NextResponse.json(
                {
                    message : error.issues[0]?.message ?? "Invalid input",
                },
                {
                    status : 400
                }
            )
        }

        return NextResponse.json(
            {
                message : "Server error"
            },
            {
                status : 500
            }
        )
    }  
}
