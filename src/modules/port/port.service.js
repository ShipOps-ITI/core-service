const prisma = require("../../database/prisma");

exports.getAllPorts = async ({ page = 1, limit = 25, search = "" } = {}) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const query = String(search).trim();
  const where = {
    isActive: true,
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { country: { contains: query, mode: "insensitive" } },
        { countryCode: { contains: query, mode: "insensitive" } },
        { unLocode: { contains: query, mode: "insensitive" } },
      ],
    }),
  };

  const [ports, total] = await prisma.$transaction([
    prisma.port.findMany({
      where,
      orderBy: [{ country: "asc" }, { name: "asc" }],
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.port.count({ where }),
  ]);

  return {
    ports,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

exports.getPortById = (id) =>
  prisma.port.findUnique({ where: { id: Number(id) } });

exports.createPort = (data) => prisma.port.create({ data });

exports.updatePort = (id, data) =>
  prisma.port.update({ where: { id: Number(id) }, data });

exports.deletePort = (id) =>
  prisma.port.delete({ where: { id: Number(id) } });
