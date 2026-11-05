import z   from "zod";

const UserUpdateByAdminRequestSchema = z.object(
    {
        email: z.string().email({ message: "Invalid email address" }).optional(),
        firstName: z.string().min(1, { message: "First name is required" }).max(50).optional(),
        lastName: z.string().min(1, { message: "Last name is required" }).max(50).optional(),
        phone: z.string().max(20).optional(),
        profileImage: z.string().url({ message: "Invalid profile image URL" }).optional(),
        password: z.never().optional(),
        id: z.never().optional(),
        role: z.string().min(1).max(50).optional(),
        privileges: z.array(z.string()).optional(),
        status: z.string().min(1).max(50).optional(),
    }
)


export type UserUpdateByAdminRequestType = z.infer<typeof UserUpdateByAdminRequestSchema>; // make a type for user self-update request validation schema using zod
export {UserUpdateByAdminRequestSchema}