import { NextFunction, Request, Response } from 'express';
import { z, ZodSchema } from 'zod';

export enum infoType {
    body = "body",
    params = "params",
    query = "query",
}
// Define the schema
export const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    email: z.string().email('Invalid email format')
});

export const userSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long").optional(),
    password: z.string().min(6, "Password must be at least 6 characters long").optional(),
    email: z.string().email('Invalid email format').optional()
});


export const loginSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6] characters long")
});

export const productSchema = z.object({
    name: z.string(),
    measure: z.enum(['kg' , 'gram' , 'piece']).default('piece'),
    price: z.number().default(0), 
});

export const productPatchSchema = z.object({
    name: z.string().optional(),
    measure: z.enum(['kg' , 'gram' , 'piece']).optional(),
    price: z.coerce.number().optional(), 
});

export const mealSchema = z.object({
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    dishId: z.number().nullish()
});

export const mealPatchSchema = z.object({
    name: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    dishId: z.number().nullish()
});

export const ingredientSchema = z.object({
    productId: z.coerce.number(),
    dishId: z.coerce.number(),
    quantity: z.coerce.number()
});

export const dishSchema = z.object({
    name: z.string(),
    recipe: z.string(),
    imageUrl: z.string()
});

export const dishPatchSchema = z.object({
    name: z.string().optional(),
    recipe: z.string().optional(),
    imageUrl: z.string().optional()
});

export const searchSchema = z.object({
    searchName: z.string().min(3, "must be at least 3 letters").optional(),
    cursor: z.coerce.number().optional(),
    limit: z.coerce.number().max(20, 'linit is too big').optional()
});

export const mealQuerySchema = z.object({
    startDate: z.string().refine((val) => {
        if (!val) return true; // Allow undefined/empty for optional fields
        // Accept ISO 8601 datetime strings or simple date format (YYYY-MM-DD)
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, {
        message: "startDate must be a valid date string (ISO 8601 or YYYY-MM-DD format)"
    }).optional(),
    endDate: z.string().refine((val) => {
        if (!val) return true; // Allow undefined/empty for optional fields
        // Accept ISO 8601 datetime strings or simple date format (YYYY-MM-DD)
        const date = new Date(val);
        return !isNaN(date.getTime());
    }, {
        message: "endDate must be a valid date string (ISO 8601 or YYYY-MM-DD format)"
    }).optional(),
    cursor: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100, 'limit cannot exceed 100').optional(),
    searchName: z.string().min(1, "searchName must be at least 1 character").optional()
}).refine((data) => {
    // If both dates are provided, ensure startDate is before or equal to endDate
    if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
    }
    return true;
}, {
    message: "startDate must be before or equal to endDate",
    path: ["endDate"]
});


export const idParamSchema = z.object({
    id: z.coerce.number()
});

export const ingredientIdsSchema = z.object({
    dishIdP: z.coerce.number().optional(),
    productIdP: z.coerce.number().optional()
});

export const mealIdsSchema = z.object({
    mealIds: z.array(z.coerce.number().int().positive()).min(1, "At least one meal ID is required").max(100, "Cannot process more than 100 meals at once")
});

export function validate (schema: ZodSchema, type: infoType) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = schema.parse(req[type]);
            req[type] = validatedData;
            next();
        } catch(err) {
            console.log(err);
            return res.status(400).json({
                error: err,
            })
        }
    }
}