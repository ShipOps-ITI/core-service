// The controller should only:
// receive the request,
// call the service,
// return a response.


const companyService = require("./company.service");
const {
  isAdmin,
  getCompanyId,
  canAccessCompany,
  denyCompanyAccess,
} = require("../../middleware/companyScope");
const { getPagination, getPaginationMeta } = require("../../utils/pagination");

// GET /api/v1/companies
exports.getAllCompanies = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    let data;
    let total = 0;

    if (isAdmin(req)) {
      const result = await companyService.getAllCompanies({ skip, limit });
      data = result.companies;
      total = result.total;
    } else {
      data = [await companyService.getCompanyById(getCompanyId(req))].filter(Boolean);
      total = data.length;
    }

    return res.status(200).json({
      success: true,
      message: "Companies retrieved successfully",
      data,
      pagination: getPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve companies",
    });
  }
};

// GET /api/v1/companies/:id
exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await companyService.getCompanyById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (!canAccessCompany(req, company.id)) {
      return denyCompanyAccess(res);
    }

    return res.status(200).json({
      success: true,
      message: "Company retrieved successfully",
      data: company,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve company",
    });
  }
};

// POST /api/v1/companies
exports.createCompany = async (req, res) => {
  try {
    if (req.user.role === "COMPANY_ADMIN" && req.user.companyId) {
      return res.status(403).json({
        success: false,
        message: "Your account is already assigned to a company",
      });
    }

    const company = await companyService.createCompany(req.body);

    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create company",
    });
  }
};

// PUT /api/v1/companies/:id
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCompany = await companyService.getCompanyById(id);

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (!canAccessCompany(req, existingCompany.id)) {
      return denyCompanyAccess(res);
    }

    const updatedCompany = await companyService.updateCompany(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: updatedCompany,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update company",
    });
  }
};

// DELETE /api/v1/companies/:id
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCompany = await companyService.getCompanyById(id);

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (!canAccessCompany(req, existingCompany.id)) {
      return denyCompanyAccess(res);
    }

    await companyService.deleteCompany(id);

    return res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete company",
    });
  }
};
