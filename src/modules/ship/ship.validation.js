const { z } = require("zod");

const shipState = z.enum(["ACTIVE", "MAINTENANCE", "DOCKED", "AT_SEA"]);
const mmsiNumber = z.string().regex(/^\d{9}$/, "MMSI number must contain exactly 9 digits.").nullable().optional();

const createShipSchema = z.object({
  // Required by an Admin; ignored for a Fleet Manager because the company
  // comes from the authenticated user's token.
  companyId: z.number().int().positive().optional(),
  fleetId: z.number().int().positive(),
  name: z.string().min(2),
  imoNumber: z.string().nullable().optional(),
  mmsiNumber,
  flag: z.string(),
  capacityTonnage: z.number(),
  shipType: z.string().nullable().optional(),
  availabilityState: shipState.optional(),
  currentLatitude: z.number().nullable().optional(),
  currentLongitude: z.number().nullable().optional(),
  lengthMeters: z.number().nullable().optional(),
  widthMeters: z.number().nullable().optional(),
});

const updateShipSchema = z.object({
  fleetId: z.number().int().positive().optional(),
  name: z.string().min(2).optional(),
  imoNumber: z.string().nullable().optional(),
  mmsiNumber,
  flag: z.string().optional(),
  capacityTonnage: z.number().optional(),
  shipType: z.string().nullable().optional(),
  availabilityState: shipState.optional(),
  currentLatitude: z.number().nullable().optional(),
  currentLongitude: z.number().nullable().optional(),
  lengthMeters: z.number().nullable().optional(),
  widthMeters: z.number().nullable().optional(),
});

module.exports = {
  createShipSchema,
  updateShipSchema,
};
