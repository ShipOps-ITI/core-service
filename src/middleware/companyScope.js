const getCompanyId = (req) => Number(req.user?.companyId);

const isAdmin = (req) => req.user?.role === "ADMIN";
const isFleetManager = (req) => req.user?.role === "FLEET_MANAGER";

const canAccessFleet = (req, fleet) =>
  canAccessCompany(req, fleet.companyId)
  && (!isFleetManager(req) || Number(fleet.managedByUserId) === Number(req.user?.userId));

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
  isFleetManager,
  getCompanyId,
  requireCompanyMembership,
  canAccessCompany,
  canAccessFleet,
  denyCompanyAccess,
};
