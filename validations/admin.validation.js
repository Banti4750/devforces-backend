import { z } from "zod";

export const RoleEnum = z.enum(["USER", "ADMIN"]);


const strongPassword = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)");


const adminBaseSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: strongPassword,
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: RoleEnum.default("ADMIN"),
    profilePic: z.string().url("Invalid profile picture URL").optional(),
    isVerified: z.boolean().default(false),
    country: z.string().optional(),
    organization: z.string().optional(),
});


export const createAdminSchema = adminBaseSchema;


export const loginAdminSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
});


export const updateAdminSchema = adminBaseSchema.omit({ role: true }).partial();

