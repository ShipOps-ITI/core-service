const prisma = require("../../database/prisma");

exports.getAllFleets = async () => {
    return prisma.fleet.findMany({
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

exports.getFleetById = async (id) => {
    return prisma.fleet.findUnique({
        where: { id },
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
    });
};

exports.createFleet = async (data) => {
    return prisma.fleet.create({
        data,
    });
};

exports.updateFleet = async (id, data) => {
    return prisma.fleet.update({
        where: { id },
        data,
    });
};

exports.deleteFleet = async (id) => {
    return prisma.fleet.delete({
        where: { id },
    });
};

exports.getFleetsByCompany = async (companyId) => {
    return prisma.fleet.findMany({
        where: {
            companyId,
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
