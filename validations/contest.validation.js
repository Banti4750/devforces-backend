import { z } from "zod";

// ===================== CREATE =====================
export const createContestSchema = z
    .object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        startTime: z.coerce.date({
            required_error: "Start time is required",
            invalid_type_error: "Invalid start time",
        }),
        endTime: z.coerce.date({
            required_error: "End time is required",
            invalid_type_error: "Invalid end time",
        }),
        duration: z.coerce
            .number()
            .int("Duration must be an integer")
            .positive("Duration must be a positive number"),
        isPublic: z.boolean().optional(), // defaults true in DB
    })
    .refine((data) => data.endTime > data.startTime, {
        message: "End time must be after start time",
        path: ["endTime"],
    });

// ===================== UPDATE =====================
export const updateContestSchema = createContestSchema.partial();
