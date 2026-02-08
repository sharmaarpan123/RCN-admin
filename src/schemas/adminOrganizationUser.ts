import { z } from "zod";

/** Schema for POST /api/admin/organization/user/:organization_id (create org user). */
export const adminCreateUserSchema = z.object({
  params: z.object({
    organization_id: z.string().min(1, "Organization ID is required"),
  }),
  body: z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    dial_code: z.string().optional(),
    phone_number: z.string().optional(),
    fax_number: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export type AdminCreateUserBody = z.infer<typeof adminCreateUserSchema>["body"];
export type AdminCreateUserParams = z.infer<typeof adminCreateUserSchema>["params"];
