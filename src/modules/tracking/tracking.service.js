// Experimental in-memory ship tracking service.
// This file is intentionally not registered in routes or app.js yet.
// Later, a controller can call updateShipLocation() and broadcast the event
// through Socket.IO, while PostgreSQL stores location history.

const latestLocations = new Map();
const subscribers = new Set();

const isValidCoordinate = (value, min, max) =>
  typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;

const notifySubscribers = (location) => {
  subscribers.forEach((subscriber) => subscriber(location));
};

const updateShipLocation = ({ shipId, latitude, longitude, speed, heading }) => {
  if (!shipId) {
    throw new Error("shipId is required");
  }

  if (!isValidCoordinate(latitude, -90, 90)) {
    throw new Error("latitude must be between -90 and 90");
  }

  if (!isValidCoordinate(longitude, -180, 180)) {
    throw new Error("longitude must be between -180 and 180");
  }

  const location = {
    shipId,
    latitude,
    longitude,
    speed: typeof speed === "number" ? speed : null,
    heading: typeof heading === "number" ? heading : null,
    recordedAt: new Date().toISOString(),
  };

  latestLocations.set(shipId, location);
  notifySubscribers(location);

  return location;
};

const getLatestLocation = (shipId) => latestLocations.get(shipId) || null;

const getAllLatestLocations = () => Array.from(latestLocations.values());

const subscribeToLocationUpdates = (subscriber) => {
  if (typeof subscriber !== "function") {
    throw new Error("subscriber must be a function");
  }

  subscribers.add(subscriber);

  return () => subscribers.delete(subscriber);
};

module.exports = {
  updateShipLocation,
  getLatestLocation,
  getAllLatestLocations,
  subscribeToLocationUpdates,
};
