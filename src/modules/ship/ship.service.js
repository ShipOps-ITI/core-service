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
exports.getAllShips = async ({ skip, limit }) => {
  const [ships, total] = await prisma.$transaction([
    prisma.ship.findMany({
      skip,
      take: limit,
      include: shipInclude,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.ship.count(),
  ]);

  return { ships, total };
};

// Get ship by ID
exports.getShipById = async (id) => {
  return prisma.ship.findUnique({
    where: { id: Number(id) },
    include: shipInclude,
  });
};

// Get all ships for a company
exports.getShipsByCompany = async (companyId) => {
  return prisma.ship.findMany({
    where: { companyId: Number(companyId) },
    include: shipInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Get all ships in a fleet
exports.getShipsByFleet = async (fleetId) => {
  return prisma.ship.findMany({
    where: { fleetId: Number(fleetId) },
    include: shipInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
};

exports.getFleetById = async (id) => {
  return prisma.fleet.findUnique({
    where: { id: Number(id) },
    select: { id: true, companyId: true },
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
    where: { id: Number(id) },
    data,
    include: shipInclude,
  });
};

// Delete ship
exports.deleteShip = async (id) => {
  return prisma.ship.delete({
    where: { id: Number(id) },
  });
};
