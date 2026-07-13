// Standalone live-tracking demo. Run with:
// node src/modules/tracking/tracking.demo.js
// It starts only this demo on http://localhost:5051 and does not change ShipOps routes.

const express = require("express");
const path = require("path");
const trackingService = require("./tracking.service");

const demoShips = [
  { shipId: "demo-red-sea", name: "MV Red Sea Explorer", latitude: 22.4, longitude: 38.6, speed: 14.2, heading: 18 },
  { shipId: "demo-gulf", name: "MV Gulf Star", latitude: 25.1, longitude: 54.8, speed: 12.7, heading: 332 },
  { shipId: "demo-arabian", name: "MV Arabian Pearl", latitude: 18.8, longitude: 41.3, speed: 10.4, heading: 145 },
];

const createTrackingDemo = () => {
  const app = express();
  let timer;

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "tracking.demo.html"));
  });

  app.get("/api/locations", (req, res) => {
    res.json({ success: true, data: trackingService.getAllLatestLocations() });
  });

  app.get("/events", (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const unsubscribe = trackingService.subscribeToLocationUpdates((location) => {
      res.write(`data: ${JSON.stringify(location)}\n\n`);
    });

    req.on("close", unsubscribe);
  });

  const startSimulation = () => {
    demoShips.forEach((ship) => trackingService.updateShipLocation(ship));

    timer = setInterval(() => {
      demoShips.forEach((ship, index) => {
        ship.heading = (ship.heading + (index + 1) * 3) % 360;
        ship.latitude += Math.cos((ship.heading * Math.PI) / 180) * 0.018;
        ship.longitude += Math.sin((ship.heading * Math.PI) / 180) * 0.026;
        trackingService.updateShipLocation(ship);
      });
    }, 1000);
  };

  const stopSimulation = () => clearInterval(timer);

  return { app, startSimulation, stopSimulation };
};

if (require.main === module) {
  const { app, startSimulation, stopSimulation } = createTrackingDemo();
  const server = app.listen(5051, () => {
    startSimulation();
    console.log("Tracking demo running at http://localhost:5051");
  });

  process.on("SIGINT", () => {
    stopSimulation();
    server.close(() => process.exit(0));
  });
}

module.exports = { createTrackingDemo };
