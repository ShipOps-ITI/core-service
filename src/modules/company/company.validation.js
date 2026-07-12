const { z } = require("zod");

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

  phone: z
    .string()
    .trim()
    .optional()
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
    .optional(),

  contactEmail: z
    .string()
    .trim()
    .email()
    .optional(),

  phone: z
    .string()
    .trim()
    .optional()
});

module.exports = {
  createCompanySchema,
  updateCompanySchema,
};