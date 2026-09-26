import{z} from "zod";
const UserRegistrationRequestSchema = z.object( // make user registration request validation schema using zod
    
    {

        email: z.string().email({ message: "Invalid email address" }), // check if email is valid
        firstName: z.string().min(1, { message: "First name is required" }).max(50),
        lastName: z.string().min(1, { message: "Last name is required" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
        phone: z.string().optional(),
        privileges: z.never(), // disallow privileges to be set during registration
        profileImage: z.string().optional()
    }
);

export type UserRegistrationRequestType = z.infer<typeof UserRegistrationRequestSchema>; // make a type for user registration request validation schema using zod
export {UserRegistrationRequestSchema}

 