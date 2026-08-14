const shipService = require("./ship.service");
const {
  isAdmin,
  getCompanyId,
  canAccessCompany,
  denyCompanyAccess,
} = require("../../middleware/companyScope");
const { getPagination, getPaginationMeta } = require("../../utils/pagination");

// GET /api/v1/ships
exports.getAllShips = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    let data;
    let total = 0;

    if (isAdmin(req)) {
      const result = await shipService.getAllShips({ skip, limit });
      data = result.ships;
      total = result.total;
    } else {
      data = await shipService.getShipsByCompany(getCompanyId(req));
      total = data.length;
    }

    return res.status(200).json({
      success: true,
      message: "Ships retrieved successfully",
      data,
      pagination: getPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve ships",
    });
  }
};

// GET /api/v1/ships/:id
exports.getShipById = async (req, res) => {
  try {
    const ship = await shipService.getShipById(req.params.id);

    if (!ship) {
      return res.status(404).json({
        success: false,
        message: "Ship not found",
      });
    }

    if (!canAccessCompany(req, ship.companyId)) {
      return denyCompanyAccess(res);
    }

    return res.status(200).json({
      success: true,
      message: "Ship retrieved successfully",
      data: ship,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve ship",
    });
  }
};

// POST /api/v1/ships
exports.createShip = async (req, res) => {
  try {
    const companyId = isAdmin(req) ? Number(req.body.companyId) : getCompanyId(req);

    if (!Number.isInteger(companyId) || companyId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Select a company before creating a ship",
      });
    }

    const fleet = await shipService.getFleetById(req.body.fleetId);

    if (!fleet || fleet.companyId !== companyId) {
      return res.status(400).json({
        success: false,
        message: "The selected fleet does not belong to your company",
      });
    }

    const ship = await shipService.createShip({
      ...req.body,
      companyId,
    });

    return res.status(201).json({
      success: true,
      message: "Ship created successfully",
      data: ship,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create ship",
    });
  }
};

// PUT /api/v1/ships/:id
exports.updateShip = async (req, res) => {
  try {
    const { id } = req.params;
    const existingShip = await shipService.getShipById(id);

    if (!existingShip) {
      return res.status(404).json({
        success: false,
        message: "Ship not found",
      });
    }

    if (!canAccessCompany(req, existingShip.companyId)) {
      return denyCompanyAccess(res);
    }

    if (req.body.fleetId) {
      const fleet = await shipService.getFleetById(req.body.fleetId);
      if (!fleet || fleet.companyId !== existingShip.companyId) {
        return res.status(400).json({
          success: false,
          message: "The selected fleet does not belong to this ship's company",
        });
      }
    }

    // Company ownership cannot be changed through a ship update.
    delete req.body.companyId;

    const ship = await shipService.updateShip(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Ship updated successfully",
      data: ship,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update ship",
    });
  }
};

// DELETE /api/v1/ships/:id
exports.deleteShip = async (req, res) => {
  try {
    const { id } = req.params;
    const existingShip = await shipService.getShipById(id);

    if (!existingShip) {
      return res.status(404).json({
        success: false,
        message: "Ship not found",
      });
    }

    if (!canAccessCompany(req, existingShip.companyId)) {
      return denyCompanyAccess(res);
    }

    await shipService.deleteShip(id);

    return res.status(200).json({
      success: true,
      message: "Ship deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete ship",
    });
  }
};

// GET /api/v1/ships/company/:companyId
exports.getShipsByCompany = async (req, res) => {
  try {
    if (!canAccessCompany(req, req.params.companyId)) {
      return denyCompanyAccess(res);
    }

    const ships = await shipService.getShipsByCompany(req.params.companyId);

    return res.status(200).json({
      success: true,
      message: "Company ships retrieved successfully",
      data: ships,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve company ships",
    });
  }
};

// GET /api/v1/ships/fleet/:fleetId
exports.getShipsByFleet = async (req, res) => {
  try {
    const fleet = await shipService.getFleetById(req.params.fleetId);
    if (!fleet) {
      return res.status(404).json({ success: false, message: "Fleet not found" });
    }

    if (!canAccessCompany(req, fleet.companyId)) {
      return denyCompanyAccess(res);
    }

    const ships = await shipService.getShipsByFleet(req.params.fleetId);

    return res.status(200).json({
      success: true,
      message: "Fleet ships retrieved successfully",
      data: ships,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve fleet ships",
    });
  }
};
