const fleetService = require("./fleet.service");
const { getPagination, getPaginationMeta } = require("../../utils/pagination");

// GET /api/v1/fleets
exports.getAllFleets = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { fleets, total } = await fleetService.getAllFleets({ skip, limit });

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
    const fleet = await fleetService.createFleet(req.body);

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
