const { z } = require("zod");

const createFleetSchema = z.object({
    // Required by an Admin; ignored for a Fleet Manager because the company
    // comes from the authenticated user's token.
    companyId: z.number().int().positive().optional(),
    managedByUserId: z.number().int().positive().optional(),

    name: z
        .string()
        .trim()
        .min(2)
        .max(100),

    description: z.string().optional(),
});

const updateFleetSchema = z.object({
    name: z.string().trim().min(2).max(100).optional(),

    description: z.string().optional(),
    managedByUserId: z.number().int().positive().optional(),
});

module.exports = {
    createFleetSchema,
    updateFleetSchema
};
