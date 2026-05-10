const fs = require("fs");
const path = require("path");

const placesPath = path.join(__dirname, "..", "data", "places.json");

function readPlaces() {
  try {
    return JSON.parse(fs.readFileSync(placesPath, "utf8"));
  } catch {
    return [];
  }
}

function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const earthRadius = 6371000;
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function matchKnownPlace({ latitude, longitude }) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  const places = readPlaces();

  let bestMatch = null;

  for (const place of places) {
    const distanceMeters = getDistanceMeters(
      latitude,
      longitude,
      place.lat,
      place.lng
    );

    const isInside = distanceMeters <= place.radiusMeters;

    if (!bestMatch || distanceMeters < bestMatch.distanceMeters) {
      bestMatch = {
        ...place,
        distanceMeters: Math.round(distanceMeters),
        matched: isInside
      };
    }
  }

  if (!bestMatch || !bestMatch.matched) return null;

  return bestMatch;
}

function getNearestKnownPlace({ latitude, longitude }) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  const places = readPlaces();
  let nearest = null;

  for (const place of places) {
    const distanceMeters = getDistanceMeters(
      latitude,
      longitude,
      place.lat,
      place.lng
    );

    if (!nearest || distanceMeters < nearest.distanceMeters) {
      nearest = {
        id: place.id,
        name: place.name,
        meaning: place.meaning,
        distance_meters: Math.round(distanceMeters),
        radius_meters: place.radiusMeters
      };
    }
  }

  return nearest;
}

module.exports = {
  readPlaces,
  matchKnownPlace,
  getNearestKnownPlace
};
