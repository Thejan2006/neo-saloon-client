import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined. Set it in your .env file.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
  {
    email: "admin@saloonneon.lk",
    firstname: "Admin",
    lastname: "Neon",
    password: "$2a$12$WozNlODji3/7Z3L8bgA9oO0G6IXLQT73/urxEWJYbD3kDnZ9shLZa", // this password should be hashed in a real application 
    role: "ADMIN",
    privileges:[]
  }
];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();