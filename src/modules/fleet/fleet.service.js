const prisma = require("../../database/prisma");

exports.getAllFleets = async ({ skip, limit }) => {
    const [fleets, total] = await prisma.$transaction([
      prisma.fleet.findMany({
        skip,
        take: limit,
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                },
            },
            _count: {
                select: {
                    ships: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
      }),
      prisma.fleet.count(),
    ]);

    return { fleets, total };
};

exports.getFleetById = async (id) => {
    return prisma.fleet.findUnique({
        where: { id: Number(id) },
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                },
            },
            _count: {
                select: {
                    ships: true,
                },
            },
            ships: {
                select: {
                    id: true,
                    name: true,
                    availabilityState: true,
                },
            },
        },
    });
};

exports.createFleet = async (data) => {
    return prisma.fleet.create({
        data,
    });
};

exports.updateFleet = async (id, data) => {
    return prisma.fleet.update({
        where: { id: Number(id) },
        data,
    });
};

exports.deleteFleet = async (id) => {
    return prisma.fleet.delete({
        where: { id: Number(id) },
    });
};

exports.getFleetsByCompany = async (companyId) => {
    return prisma.fleet.findMany({
        where: {
            companyId: Number(companyId),
        },
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                },
            },
            ships: {
                select: {
                    id: true,
                    name: true,
                    availabilityState: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

exports.getFleetsManagedByUser = async (companyId, userId) => {
    return prisma.fleet.findMany({
        where: { companyId: Number(companyId), managedByUserId: Number(userId) },
        include: {
            company: { select: { id: true, name: true } },
            ships: { select: { id: true, name: true, availabilityState: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};
