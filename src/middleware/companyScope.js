const getCompanyId = (req) => Number(req.user?.companyId);

const isAdmin = (req) => req.user?.role === "ADMIN";

const requireCompanyMembership = (req, res, next) => {
  if (isAdmin(req)) return next();

  if (!Number.isInteger(getCompanyId(req)) || getCompanyId(req) <= 0) {
    return res.status(403).json({
      success: false,
      message: "Your account is not assigned to a company",
    });
  }

  next();
};

const canAccessCompany = (req, companyId) =>
  isAdmin(req) || getCompanyId(req) === Number(companyId);

const denyCompanyAccess = (res) =>
  res.status(403).json({
    success: false,
    message: "You do not have access to this company's data",
  });

module.exports = {
  isAdmin,
  getCompanyId,
  requireCompanyMembership,
  canAccessCompany,
  denyCompanyAccess,
};
