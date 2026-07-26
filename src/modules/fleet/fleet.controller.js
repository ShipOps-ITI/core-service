const fleetService = require("./fleet.service");
const {
  isAdmin,
  getCompanyId,
  canAccessCompany,
  denyCompanyAccess,
} = require("../../middleware/companyScope");

// GET /api/v1/fleets
exports.getAllFleets = async (req, res) => {
  try {
    const fleets = isAdmin(req)
      ? await fleetService.getAllFleets()
      : await fleetService.getFleetsByCompany(getCompanyId(req));

    return res.status(200).json({
      success: true,
      message: "Fleets retrieved successfully",
      data: fleets,
      pagination: getPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve fleets",
    });
  }
};

// GET /api/v1/fleets/:id
exports.getFleetById = async (req, res) => {
  try {
    const { id } = req.params;

    const fleet = await fleetService.getFleetById(id);

    if (!fleet) {
      return res.status(404).json({
        success: false,
        message: "Fleet not found",
      });
    }

    if (!canAccessCompany(req, fleet.companyId)) {
      return denyCompanyAccess(res);
    }

    return res.status(200).json({
      success: true,
      message: "Fleet retrieved successfully",
      data: fleet,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve fleet",
    });
  }
};

// POST /api/v1/fleets
exports.createFleet = async (req, res) => {
  try {
    const companyId = isAdmin(req) ? Number(req.body.companyId) : getCompanyId(req);

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Select a company before creating a fleet",
      });
    }

    const fleet = await fleetService.createFleet({
      ...req.body,
      companyId,
      managedByUserId: req.user.userId,
      createdByUserId: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Fleet created successfully",
      data: fleet,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create fleet",
    });
  }
};

// PUT /api/v1/fleets/:id
exports.updateFleet = async (req, res) => {
  try {
    const { id } = req.params;

    const existingFleet = await fleetService.getFleetById(id);

    if (!existingFleet) {
      return res.status(404).json({
        success: false,
        message: "Fleet not found",
      });
    }

    if (!canAccessCompany(req, existingFleet.companyId)) {
      return denyCompanyAccess(res);
    }

    const updatedFleet = await fleetService.updateFleet(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Fleet updated successfully",
      data: updatedFleet,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update fleet",
    });
  }
};

// DELETE /api/v1/fleets/:id
exports.deleteFleet = async (req, res) => {
  try {
    const { id } = req.params;

    const existingFleet = await fleetService.getFleetById(id);

    if (!existingFleet) {
      return res.status(404).json({
        success: false,
        message: "Fleet not found",
      });
    }

    if (!canAccessCompany(req, existingFleet.companyId)) {
      return denyCompanyAccess(res);
    }

    await fleetService.deleteFleet(id);

    return res.status(200).json({
      success: true,
      message: "Fleet deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete fleet",
    });
  }
};

// GET /api/v1/fleets/company/:companyId
exports.getFleetsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!canAccessCompany(req, companyId)) {
      return denyCompanyAccess(res);
    }

    const fleets = await fleetService.getFleetsByCompany(companyId);

    return res.status(200).json({
      success: true,
      message: "Company fleets retrieved successfully",
      data: fleets,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve company fleets",
    });
  }
};
