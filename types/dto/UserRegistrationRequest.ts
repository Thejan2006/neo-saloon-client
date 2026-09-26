import{z} from "zod";
const UserRegistrationRequest = z.object( // make user registration request validation schema using zod
    
    {

        email: z.string().email({ message: "Invalid email address" }),
        firstName: z.string().min(1, { message: "First name is required" }),
        lastName: z.string().min(1, { message: "Last name is required" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
        phone: z.string().optional(),
        profileImage: z.string().optional()
    }
);

