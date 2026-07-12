const shipService = require("./ship.service");

// GET /api/v1/ships
exports.getAllShips = async (req, res) => {
  try {
    const ships = await shipService.getAllShips();

    return res.status(200).json({
      success: true,
      message: "Ships retrieved successfully",
      data: ships,
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
    const ship = await shipService.createShip(req.body);

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
