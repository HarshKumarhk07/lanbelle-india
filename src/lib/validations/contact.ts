import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required").max(80).trim(),
  email: z.string().email("Enter a valid email").toLowerCase().trim(),
  subject: z.string().max(120).trim().optional().or(z.literal("")),
  message: z.string().min(10, "Please write a little more").max(2000).trim(),
});

export type ContactInput = z.infer<typeof contactSchema>;
