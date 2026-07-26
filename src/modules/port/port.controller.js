const portService = require("./port.service");

const sendDatabaseError = (res, error, fallback) => {
  if (error.code === "P2002") {
    return res.status(409).json({ success: false, message: "A port with this name and country already exists" });
  }
  return res.status(500).json({ success: false, message: fallback });
};

exports.getAllPorts = async (req, res) => {
  try {
    const result = await portService.getAllPorts(req.query);
    return res.json({ success: true, message: "Ports retrieved successfully", data: result.ports, pagination: result.pagination });
  } catch (error) {
    return sendDatabaseError(res, error, "Failed to retrieve ports");
  }
};

exports.getPortById = async (req, res) => {
  try {
    const port = await portService.getPortById(req.params.id);
    if (!port) return res.status(404).json({ success: false, message: "Port not found" });
    return res.json({ success: true, message: "Port retrieved successfully", data: port });
  } catch (error) {
    return sendDatabaseError(res, error, "Failed to retrieve port");
  }
};

exports.createPort = async (req, res) => {
  try {
    const port = await portService.createPort(req.body);
    return res.status(201).json({ success: true, message: "Port created successfully", data: port });
  } catch (error) {
    return sendDatabaseError(res, error, "Failed to create port");
  }
};

exports.updatePort = async (req, res) => {
  try {
    const port = await portService.updatePort(req.params.id, req.body);
    return res.json({ success: true, message: "Port updated successfully", data: port });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Port not found" });
    return sendDatabaseError(res, error, "Failed to update port");
  }
};

exports.deletePort = async (req, res) => {
  try {
    await portService.deletePort(req.params.id);
    return res.json({ success: true, message: "Port deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Port not found" });
    return sendDatabaseError(res, error, "Failed to delete port");
  }
};
