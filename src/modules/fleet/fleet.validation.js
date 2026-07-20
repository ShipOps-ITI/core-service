const { z } = require("zod");

const createFleetSchema = z.object({
    companyId: z.number().int().positive(),

    name: z
        .string()
        .trim()
        .min(2)
        .max(100),

    description: z
        .string()
        .optional(),

    managedByUserId: z.number().int().positive(),

    createdByUserId: z.number().int().positive()
});

const updateFleetSchema = z.object({
    name: z.string().trim().min(2).max(100).optional(),

    description: z.string().optional()
});

module.exports = {
    createFleetSchema,
    updateFleetSchema
};
