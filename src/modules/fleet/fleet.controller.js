const fleetService = require("./fleet.service");
const {
  isAdmin,
  isFleetManager,
  getCompanyId,
  canAccessCompany,
  canAccessFleet,
  denyCompanyAccess,
} = require("../../middleware/companyScope");
const { verifyFleetManager } = require("../../services/authReference.service");
const { getPagination, getPaginationMeta } = require("../../utils/pagination");

// GET /api/v1/fleets
exports.getAllFleets = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    let data;
    let total = 0;

    if (isAdmin(req)) {
      const result = await fleetService.getAllFleets({ skip, limit });
      data = result.fleets;
      total = result.total;
    } else if (isFleetManager(req)) {
      data = await fleetService.getFleetsManagedByUser(getCompanyId(req), req.user.userId);
      total = data.length;
    } else {
      data = await fleetService.getFleetsByCompany(getCompanyId(req));
      total = data.length;
    }

    return res.status(200).json({
      success: true,
      message: "Fleets retrieved successfully",
      data,
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

    if (!canAccessFleet(req, fleet)) {
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

    const requestedManagerId = Number(req.body.managedByUserId);
    if (req.body.managedByUserId !== undefined && requestedManagerId !== Number(req.user.userId)) {
      const manager = await verifyFleetManager(requestedManagerId, companyId, req.headers.authorization);
      if (!manager.valid) return res.status(400).json({ success: false, message: manager.message });
    }

    const fleet = await fleetService.createFleet({
      ...req.body,
      companyId,
      managedByUserId: requestedManagerId || req.user.userId,
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

    if (!canAccessFleet(req, existingFleet)) {
      return denyCompanyAccess(res);
    }

    if (req.body.managedByUserId !== undefined) {
      if (isFleetManager(req)) {
        return res.status(403).json({ success: false, message: "Fleet Managers cannot change fleet assignments." });
      }
      const manager = await verifyFleetManager(Number(req.body.managedByUserId), existingFleet.companyId, req.headers.authorization);
      if (!manager.valid) return res.status(400).json({ success: false, message: manager.message });
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

    if (!canAccessFleet(req, existingFleet)) {
      return denyCompanyAccess(res);
    }

    const shipCount = existingFleet.ships?.length || 0;
    if (shipCount > 0) {
      return res.status(409).json({
        success: false,
        message: `This fleet has ${shipCount} ship record(s). Delete the ship records first before deleting this fleet.`,
      });
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

    const fleets = isFleetManager(req)
      ? await fleetService.getFleetsManagedByUser(companyId, req.user.userId)
      : await fleetService.getFleetsByCompany(companyId);

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
