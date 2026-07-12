const { z } = require("zod");

const createFleetSchema = z.object({
    companyId: z.string().uuid(),

    name: z
        .string()
        .trim()
        .min(2)
        .max(100),

    description: z
        .string()
        .optional(),

    managedByUserId: z.string(),

    createdByUserId: z.string()
});

const updateFleetSchema = z.object({
    name: z.string().trim().min(2).max(100).optional(),

    description: z.string().optional(),

    managedByUserId: z.string().uuid().optional()
});

module.exports = {
    createFleetSchema,
    updateFleetSchema
};