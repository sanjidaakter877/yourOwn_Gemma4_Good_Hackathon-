const { getNearestKnownPlace, matchKnownPlace, readPlaces } = require("./location");

function detectEnvironment(context) {
  const hasGps = typeof context.latitude === "number" && typeof context.longitude === "number";
  const gpsPlace = matchKnownPlace({
    latitude: context.latitude,
    longitude: context.longitude
  });
  const nearestKnownPlace = hasGps && !gpsPlace
    ? getNearestKnownPlace({
        latitude: context.latitude,
        longitude: context.longitude
      })
    : null;

  // Trust GPS if it matches a saved place, or if no saved places exist yet (places.json empty/default)
  // Only discard if coordinates are clearly nonsensical (0,0) or places exist but all are very far away
  const places = readPlaces ? readPlaces() : [];
  const hasRealPlaces = places.some(p => p.lat !== 40.7128); // not the default NYC placeholder
  const GPS_SANITY_LIMIT_M = hasRealPlaces ? 50000 : Infinity;
  const gpsIsReliable = hasGps && (
    gpsPlace !== null ||
    !hasRealPlaces || // no real places saved yet — trust GPS as-is
    (nearestKnownPlace && nearestKnownPlace.distance_meters <= GPS_SANITY_LIMIT_M)
  );

  const lowerRoom = context.room.toLowerCase();
  const lowerLocation = context.locationName.toLowerCase();
  const lowerObjects = context.objects.map((item) => String(item).toLowerCase());

  const likelyPlace = gpsPlace
    ? gpsPlace.name
    : gpsIsReliable
      ? "unknown location"
    : inferPlace({
        locationName: lowerLocation,
        room: lowerRoom,
        objects: lowerObjects,
        patient: context.patient
      });

  const likelyPeople = [];

  if (context.nearbyPerson) {
    likelyPeople.push(context.nearbyPerson);
  }

  const timeContext = buildTimeContext(context.timeOfDay);

  const routineHint = inferRoutine({
    timeOfDay: context.timeOfDay,
    room: lowerRoom,
    locationName: gpsPlace ? gpsPlace.name.toLowerCase() : lowerLocation,
    objects: lowerObjects,
    patient: context.patient
  });

  return {
    likely_place: likelyPlace,
    likely_people: likelyPeople,
    time_context: timeContext,
    routine_hint: routineHint,
    gps_status: gpsPlace
      ? "matched_known_place"
      : gpsIsReliable
        ? "unmatched_known_place"
        : "gps_unavailable",
    nearest_known_place: gpsIsReliable ? nearestKnownPlace : null,
    gps_match: gpsPlace
      ? {
          id: gpsPlace.id,
          name: gpsPlace.name,
          meaning: gpsPlace.meaning,
          distance_meters: gpsPlace.distanceMeters
        }
      : null
  };
}

function inferPlace({ locationName, room, objects, patient }) {
  if (locationName && locationName !== "unknown") return locationName;

  if (room.includes("bed")) return "bedroom";
  if (room.includes("bath")) return "bathroom";
  if (room.includes("kitchen")) return "kitchen";
  if (room.includes("living")) return "living room";
  if (room.includes("clinic")) return "clinic";

  if (objects.includes("remote") || objects.includes("sofa")) {
    return "living room";
  }

  if (objects.includes("kettle") || objects.includes("mug")) {
    return "kitchen";
  }

  if (objects.includes("pillow") || objects.includes("blanket")) {
    return "bedroom";
  }

  if (patient.knownPlaces && patient.knownPlaces.length > 0) {
    return patient.knownPlaces[0];
  }

  return "home";
}

function inferRoutine({ timeOfDay, room, locationName, objects, patient }) {
  const routines = patient.routines || {};

  if (locationName.includes("clinic")) return "appointment or checkup";
  if (locationName.includes("daughter")) return "family visit or resting";
  if (room.includes("kitchen") || objects.includes("plate")) {
    return "meal or snack time";
  }
  if (room.includes("bed") || objects.includes("pillow")) {
    return "resting or preparing for sleep";
  }

  return routines[timeOfDay] || "normal daily routine";
}

function buildTimeContext(timeOfDay) {
  const value = String(timeOfDay || "").toLowerCase();

  if (value === "morning") return "It is morning";
  if (value === "afternoon") return "It is afternoon";
  if (value === "evening") return "It is evening";
  if (value === "night") return "It is night";

  return `It is ${timeOfDay}`;
}

module.exports = {
  detectEnvironment
};
