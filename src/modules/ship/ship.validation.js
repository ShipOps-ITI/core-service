const { z } = require("zod");

const shipState = z.enum(["ACTIVE", "MAINTENANCE", "DOCKED", "AT_SEA"]);

const createShipSchema = z.object({
  companyId: z.string().uuid(),
  fleetId: z.string().uuid().nullable().optional(),
  name: z.string().min(2),
  imoNumber: z.string().nullable().optional(),
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
  companyId: z.string().uuid().optional(),
  fleetId: z.string().uuid().nullable().optional(),
  name: z.string().min(2).optional(),
  imoNumber: z.string().nullable().optional(),
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
