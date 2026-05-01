const fs = require("fs");
const path = require("path");

const memoryPath = path.join(__dirname, "..", "data", "memory.json");
const careEventsPath = path.join(__dirname, "..", "data", "care-events.json");
let runtimeMemories = null;
let runtimeCareEvents = null;

function readMemory() {
  if (runtimeMemories) return runtimeMemories;

  try {
    const raw = fs.readFileSync(memoryPath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function writeMemory(memories) {
  runtimeMemories = memories;

  try {
    fs.writeFileSync(memoryPath, JSON.stringify(memories, null, 2), "utf8");
  } catch (error) {
    console.warn("Memory file write unavailable; using runtime memory only:", error.message);
  }
}

function writeMemoryEvent(event) {
  const memories = readMemory();
  memories.unshift(event);
  writeMemory(memories.slice(0, 300));
}

function readCareEvents() {
  if (runtimeCareEvents) return runtimeCareEvents;

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
  runtimeCareEvents = events.slice(0, 300);

  try {
    fs.writeFileSync(careEventsPath, JSON.stringify(runtimeCareEvents, null, 2), "utf8");
  } catch (error) {
    console.warn("Care event file write unavailable; using runtime events only:", error.message);
  }
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
