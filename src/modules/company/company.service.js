const prisma = require("../../database/prisma");

// Get all companies
exports.getAllCompanies = async () => {
  return await prisma.company.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Get company by ID
exports.getCompanyById = async (id) => {
  return await prisma.company.findUnique({
    where: {
      id: Number(id),
    },
  });
};

// Create a new company
exports.createCompany = async (data) => {
  return await prisma.company.create({
    data: {
      name: data.name,
      country: data.country,
      contactEmail: data.contactEmail,
      phone: data.phone,
    },
  });
};

// Update a company
exports.updateCompany = async (id, data) => {
  return await prisma.company.update({
    where: {
      id: Number(id),
    },
    data: {
      name: data.name,
      country: data.country,
      contactEmail: data.contactEmail,
      phone: data.phone,
    },
  });
};

// Delete a company
exports.deleteCompany = async (id) => {
  return await prisma.company.delete({
    where: {
      id: Number(id),
    },
  });
};
