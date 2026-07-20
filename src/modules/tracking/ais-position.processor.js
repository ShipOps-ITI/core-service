// Minimal tracking bridge.
// A future AIS provider worker calls processAisPosition() for each received message.
// This module is deliberately not imported by app.js, routes, or Ship CRUD code.

const prisma = require("../../database/prisma");

const processAisPosition = async ({ mmsi, latitude, longitude, reportedAt }) => {
  const mmsiNumber = String(mmsi || "");
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);
  const reportedAtDate = reportedAt ? new Date(reportedAt) : null;
  const lastAisUpdateAt = reportedAtDate && !Number.isNaN(reportedAtDate.getTime())
    ? reportedAtDate
    : new Date();

  if (!mmsiNumber || !Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
    return { matched: false, reason: "Invalid AIS position" };
  }

  const ship = await prisma.ship.findUnique({
    where: { mmsiNumber },
    select: { id: true, name: true },
  });

  if (!ship) {
    return { matched: false, reason: "No ShipOps ship has this MMSI" };
  }

  const updatedShip = await prisma.ship.update({
    where: { id: ship.id },
    data: {
      currentLatitude: parsedLatitude,
      currentLongitude: parsedLongitude,
      lastAisUpdateAt,
    },
    select: {
      id: true,
      name: true,
      currentLatitude: true,
      currentLongitude: true,
      lastAisUpdateAt: true,
    },
  });

  return { matched: true, ship: updatedShip };
};

module.exports = { processAisPosition };
