import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Name is too short").max(80).trim(),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number")
    .trim()
    .optional()
    .or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72)
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).trim().optional().or(z.literal("")),
  comment: z.string().min(5, "Please write a few words").max(2000).trim(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
