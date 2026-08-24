import { z } from "zod";

export const ContactUsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Full name must be at least 2 characters" })
    .max(100, { message: "Full name must not exceed 100 characters" })
    .regex(/^[A-Za-z][A-Za-z .'-]*$/, {
      message: "Name can only contain letters, spaces, dots, apostrophes and hyphens",
    }),

  mobileNum: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s-]{7,19}$/, {
      message: "Enter a valid mobile number (e.g. +91 98765 43210)",
    }),

  emailId: z
    .string()
    .trim()
    .min(1, { message: "E-mail address is required" })
    .email({ message: "Enter a valid e-mail address" })
    .max(150, { message: "E-mail must not exceed 150 characters" }),

  currentPosition: z
    .string()
    .min(1, { message: "Please select your current position" })
    .refine(
      (value) =>
        [
          "STUDENT",
          "DEVELOPER",
          "WORKING_PROFESSIONAL",
          "FREELANCER",
          "DEVOPS_ENGINEER",
          "TEST_ENGINEER",
          "QA_ENGINEER",
          "OTHER",
        ].includes(value),
      { message: "Please select a valid current position" }
    ),

  location: z
    .string()
    .trim()
    .max(150, { message: "Location must not exceed 150 characters" })
    .optional()
    .or(z.literal("")),
});
