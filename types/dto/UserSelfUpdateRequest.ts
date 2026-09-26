import z   from "zod";

const UserSelfUpdateRequestSchema = z.object(
    {
        email: z.string().email({ message: "Invalid email address" }).optional(), // check if email is valid
        firstName: z.string().min(1, { message: "First name is required" }).max(50).optional(),
        lastName: z.string().min(1, { message: "Last name is required" }).max(50).optional(),
        phone: z.string().max(20).optional(),
        profileImage: z.string().url({ message: "Invalid profile image URL" }).optional(),
        password: z.never().optional(),
        role : z.never().optional(),
        privileges: z.never().optional(), // disallow privileges to be set during self-update
        status: z.never().optional(), // disallow status to be set during self-update
        id: z.never().optional() // disallow id to be set during self-update
    }
)


export type UserSelfUpdateRequestType = z.infer<typeof UserSelfUpdateRequestSchema>; // make a type for user self-update request validation schema using zod
export {UserSelfUpdateRequestSchema}