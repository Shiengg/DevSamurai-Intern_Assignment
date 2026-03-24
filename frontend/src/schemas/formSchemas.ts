import { z } from "zod";

export const signUpSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.email('Please enter a valid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[a-z]/, 'Password must include at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must include at least one uppercase letter'),
})

export const signInSchema = z.object({
    email: z.email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export const createOrganizationSchema = z.object({
    name: z.string()
        .min(1, 'Organization name is required')
        .max(50, 'Organization name must be less than 50 characters')
        .trim()
})

export const renameUserSchema = z.object({
    display: z.string()
        .min(1, 'Display is required')
        .max(30, 'Display must be less than 30 characters')
        .trim()
})

export type CreateOrganizationForm = z.infer<typeof createOrganizationSchema>;
export type RenameUserForm = z.infer<typeof renameUserSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
export type SignInSchema = z.infer<typeof signInSchema>;