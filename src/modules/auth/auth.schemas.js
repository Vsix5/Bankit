import { z } from 'zod';

export const signupSchema = z.object({
    name: z.string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(30, {message: 'Name cannot exceed 30 characters'})
    .trim(),
    email: z.string()
    .email({ message: 'Please provide a valid email address'})
    .toLowerCase()
    .trim(),
    password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(100, { message: 'Password is to long' })
    .regex(/[A-Z]/, {message: 'Password must contain at least one uppercase letter'})
    .regex(/[0-9]/, { message: 'Password must contain at least one number'})
})

export const signinSchema = z.object({
    email: z.string({ required_error: 'Email is required'})
     .email('Invalid email format')
     .toLowerCase()
     .trim(),
     password: z.string({ required_error: 'Password is required'})
     .min(1, 'Password is required')
})