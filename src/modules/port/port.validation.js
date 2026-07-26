const { z } = require("zod");

const coordinates = {
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
};

const createPortSchema = z.object({
  name: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(100),
  ...coordinates,
});

const updatePortSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  country: z.string().trim().min(2).max(100).optional(),
  latitude: coordinates.latitude.optional(),
  longitude: coordinates.longitude.optional(),
});

module.exports = { createPortSchema, updatePortSchema };
