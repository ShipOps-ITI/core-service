// Run separately with: npm run tracking:ais
// Required environment variable: AISSTREAM_API_KEY

require("dotenv").config();

const WebSocket = require("ws");
const prisma = require("../../database/prisma");
const { processAisPosition } = require("./ais-position.processor");

const AISSTREAM_URL = "wss://stream.aisstream.io/v0/stream";

const getPositionFromMessage = (aisMessage) => {
  if (aisMessage.MessageType !== "PositionReport") return null;

  const position = aisMessage.Message?.PositionReport;
  if (!position) return null;

  return {
    mmsi: position.UserID || aisMessage.MetaData?.MMSI,
    latitude: position.Latitude ?? aisMessage.MetaData?.latitude,
    longitude: position.Longitude ?? aisMessage.MetaData?.longitude,
  };
};

const getTrackedMmsis = async () => {
  const ships = await prisma.ship.findMany({
    where: { mmsiNumber: { not: null } },
    select: { mmsiNumber: true },
    take: 50,
  });

  return ships.map((ship) => ship.mmsiNumber);
};

const startAisWorker = async () => {
  const apiKey = process.env.AISSTREAM_API_KEY;

  if (!apiKey) {
    throw new Error("AISSTREAM_API_KEY is missing from .env");
  }

  const mmsiNumbers = await getTrackedMmsis();

  if (mmsiNumbers.length === 0) {
    throw new Error("No ships have an MMSI number. Add one in the Ships page first.");
  }

  let stopped = false;
  let socket;
  let receivedPositionCount = 0;
  const statusTimer = setInterval(() => {
    if (receivedPositionCount === 0) {
      console.warn("Waiting for AISStream position reports. The subscribed ships may not have coverage or a current AIS signal.");
    } else {
      console.log(`Received ${receivedPositionCount} AIS position report(s) in the last minute.`);
      receivedPositionCount = 0;
    }
  }, 60000);

  const connect = () => {
    socket = new WebSocket(AISSTREAM_URL);

    socket.on("open", () => {
      socket.send(JSON.stringify({
        APIKey: apiKey,
        BoundingBoxes: [[[-90, -180], [90, 180]]],
        FiltersShipMMSI: mmsiNumbers,
        FilterMessageTypes: ["PositionReport"],
      }));

      console.log(`AIS worker connected. Tracking ${mmsiNumbers.length} ship(s): ${mmsiNumbers.join(", ")}.`);
    });

    socket.on("message", async (rawMessage) => {
      try {
        const aisMessage = JSON.parse(rawMessage.toString());

        if (aisMessage.error) {
          console.error(`AISStream error: ${aisMessage.error}`);
          return;
        }

        const position = getPositionFromMessage(aisMessage);
        if (!position) return;

        receivedPositionCount += 1;
        const result = await processAisPosition(position);
        if (result.matched) {
          console.log(`Updated ${result.ship.name}: ${result.ship.currentLatitude}, ${result.ship.currentLongitude}`);
        }
      } catch (error) {
        console.error("Unable to process AIS message:", error.message);
      }
    });

    socket.on("error", (error) => {
      console.error("AISStream connection error:", error.message);
    });

    socket.on("close", (code) => {
      console.log(`AISStream connection closed (code ${code}).`);
      if (!stopped) {
        console.log("AISStream disconnected. Reconnecting in 5 seconds...");
        setTimeout(connect, 5000);
      }
    });
  };

  connect();

  return () => {
    stopped = true;
    clearInterval(statusTimer);
    socket?.close();
  };
};

if (require.main === module) {
  if (process.argv.includes("--help")) {
    console.log("Usage: npm run tracking:ais\nRequires AISSTREAM_API_KEY in .env and at least one Ship with an MMSI number.");
    process.exit(0);
  }

  startAisWorker()
    .then((stopWorker) => {
      process.on("SIGINT", async () => {
        stopWorker();
        await prisma.$disconnect();
        process.exit(0);
      });
    })
    .catch(async (error) => {
      console.error(`AIS worker could not start: ${error.message}`);
      await prisma.$disconnect();
      process.exit(1);
    });
}

module.exports = {
  getPositionFromMessage,
  getTrackedMmsis,
  startAisWorker,
};
