const { z } = require("zod");

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[\d\s().-]{7,25}$/, "Invalid phone number.")
  .refine(
    (phone) => {
      const digits = phone.replace(/\D/g, "").length;
      return digits >= 7 && digits <= 15;
    },
    "Phone number must contain between 7 and 15 digits."
  )
  .optional();

// Create Company Validation
const createCompanySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters.")
    .max(100, "Company name cannot exceed 100 characters."),

  country: z
    .string()
    .trim()
    .min(2, "Country is required."),

  contactEmail: z
    .string()
    .trim()
    .email("Invalid email address."),

  phone: phoneSchema,
});

// Update Company Validation
const updateCompanySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  country: z
    .string()
    .trim()
    .min(2, "Country is required.")
    .optional(),

  contactEmail: z
    .string()
    .trim()
    .email("Invalid email address.")
    .optional(),

  phone: phoneSchema
});

module.exports = {
  createCompanySchema,
  updateCompanySchema,
};
