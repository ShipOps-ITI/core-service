const trackingHealth = require("./tracking-health.service");
const shipService = require("../ship/ship.service");
const { isAdmin, isFleetManager, getCompanyId } = require("../../middleware/companyScope");

const STALE_AFTER_MS = 10 * 60 * 1000;

exports.getTrackingHealth = async (req, res) => {
  try {
    const ships = isAdmin(req)
      ? (await shipService.getAllShips({ skip: 0, limit: 1000 })).ships
      : await shipService.getShipsByCompany(getCompanyId(req), isFleetManager(req) ? req.user.userId : null);
    const now = Date.now();
    const withLocation = ships.filter((ship) => Number.isFinite(ship.currentLatitude) && Number.isFinite(ship.currentLongitude));
    const staleShips = withLocation.filter((ship) => !ship.lastAisUpdateAt || now - new Date(ship.lastAisUpdateAt).getTime() > STALE_AFTER_MS);
    const missingMmsiShips = ships.filter((ship) => !/^\d{9}$/.test(String(ship.mmsiNumber || "")));

    return res.json({
      success: true,
      data: {
        worker: await trackingHealth.getHealth(),
        alerts: {
          stalePositionCount: staleShips.length,
          noPositionCount: ships.length - withLocation.length,
          invalidOrMissingMmsiCount: missingMmsiShips.length,
          staleShips: staleShips.slice(0, 10).map((ship) => ({ id: ship.id, name: ship.name, lastAisUpdateAt: ship.lastAisUpdateAt })),
          missingMmsiShips: missingMmsiShips.slice(0, 10).map((ship) => ({ id: ship.id, name: ship.name })),
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to retrieve tracking health." });
  }
};
