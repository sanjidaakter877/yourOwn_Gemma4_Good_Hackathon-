const { matchKnownPlace } = require("./location");

function detectEnvironment(context) {
  const gpsPlace = matchKnownPlace({
    latitude: context.latitude,
    longitude: context.longitude
  });

  const lowerRoom = context.room.toLowerCase();
  const lowerLocation = context.locationName.toLowerCase();
  const lowerObjects = context.objects.map((item) => String(item).toLowerCase());

  const likelyPlace = gpsPlace
    ? gpsPlace.name
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
