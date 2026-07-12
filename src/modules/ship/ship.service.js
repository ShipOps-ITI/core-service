const prisma = require("../../database/prisma");

const shipInclude = {
  company: {
    select: {
      id: true,
      name: true,
    },
  },
  fleet: {
    select: {
      id: true,
      name: true,
    },
  },
};

// Get all ships
exports.getAllShips = async () => {
  return prisma.ship.findMany({
    include: shipInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Get ship by ID
exports.getShipById = async (id) => {
  return prisma.ship.findUnique({
    where: { id },
    include: shipInclude,
  });
};

// Get all ships for a company
exports.getShipsByCompany = async (companyId) => {
  return prisma.ship.findMany({
    where: { companyId },
    include: shipInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Get all ships in a fleet
exports.getShipsByFleet = async (fleetId) => {
  return prisma.ship.findMany({
    where: { fleetId },
    include: shipInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Create ship
exports.createShip = async (data) => {
  return prisma.ship.create({
    data,
    include: shipInclude,
  });
};

// Update ship
exports.updateShip = async (id, data) => {
  return prisma.ship.update({
    where: { id },
    data,
    include: shipInclude,
  });
};

// Delete ship
exports.deleteShip = async (id) => {
  return prisma.ship.delete({
    where: { id },
  });
};
