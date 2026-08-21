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

exports.getShipStatistics = async (companyId = null) => {
  const where = companyId ? { companyId: Number(companyId) } : {};
  const [totalShips, shipsByStatus, latestShips] = await prisma.$transaction([
    prisma.ship.count({ where }),
    prisma.ship.groupBy({ by: ["availabilityState"], _count: { availabilityState: true }, where }),
    prisma.ship.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, name: true, availabilityState: true, lastAisUpdateAt: true },
    }),
  ]);

  const countFor = (state) => shipsByStatus.find((item) => item.availabilityState === state)?._count.availabilityState ?? 0;
  return {
    totalShips,
    shipsAtSea: countFor("AT_SEA"),
    shipsDocked: countFor("DOCKED"),
    shipsInMaintenance: countFor("MAINTENANCE"),
    shipsByStatus: shipsByStatus.map((item) => ({ status: item.availabilityState, count: item._count.availabilityState })),
    latestShips,
  };
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
