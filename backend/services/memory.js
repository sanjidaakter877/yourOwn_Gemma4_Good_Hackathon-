const fs = require("fs");
const path = require("path");

const memoryPath = path.join(__dirname, "..", "data", "memory.json");
const careEventsPath = path.join(__dirname, "..", "data", "care-events.json");

function readMemory() {
  try {
    const raw = fs.readFileSync(memoryPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function writeMemory(memories) {
  fs.writeFileSync(memoryPath, JSON.stringify(memories, null, 2), "utf8");
}

function writeMemoryEvent(event) {
  const memories = readMemory();
  memories.unshift(event);
  writeMemory(memories.slice(0, 300));
}

function readCareEvents() {
  try {
    const raw = fs.readFileSync(careEventsPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCareEvent(event) {
  const events = readCareEvents();
  events.unshift(event);
  fs.writeFileSync(careEventsPath, JSON.stringify(events.slice(0, 300), null, 2), "utf8");
}

function findRelevantMemories({
  memories,
  userName,
  speechText,
  locationName,
  nearbyPerson
}) {
  const lowerSpeech = String(speechText || "").toLowerCase();
  const lowerLocation = String(locationName || "").toLowerCase();
  const lowerNearby = String(nearbyPerson || "").toLowerCase();

  return memories
    .filter((item) => item.userName === userName)
    .filter((item) => {
      const personMatch =
        lowerNearby &&
        String(item.nearby_person || "")
          .toLowerCase()
          .includes(lowerNearby);

      const locationMatch =
        lowerLocation &&
        String(item.location_name || "")
          .toLowerCase()
          .includes(lowerLocation);

      const doctorMatch =
        lowerSpeech.includes("doctor") && item.speaker_role === "doctor";

      return personMatch || locationMatch || doctorMatch;
    })
    .slice(0, 3);
}

module.exports = {
  readMemory,
  writeMemoryEvent,
  readCareEvents,
  writeCareEvent,
  findRelevantMemories
};
