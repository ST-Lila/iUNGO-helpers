import * as turf from "@turf/turf";

const GOOGLE_API_KEY = "AIzaSyC3YK0iOVvAwdUreV9s4qpIkAgLwawEuck";

async function getBoundsZona(zona) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      zona
    )}&key=${GOOGLE_API_KEY}`
  );
  const data = await res.json();
  return data.results?.[0]?.geometry?.bounds || null;
}

function boundsToPolygonWithBuffer(bounds, bufferMeters = 150) {
  const sw = bounds.southwest;
  const ne = bounds.northeast;

  const coordinates = [
    [
      [sw.lng, sw.lat],
      [ne.lng, sw.lat],
      [ne.lng, ne.lat],
      [sw.lng, ne.lat],
      [sw.lng, sw.lat],
    ],
  ];

  const polygon = turf.polygon(coordinates);
  return turf.buffer(polygon, bufferMeters, { units: "meters" });
}

async function getAddresses(direccionCompleta) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      direccionCompleta
    )}&key=${GOOGLE_API_KEY}`
  );
  const data = await res.json();
  return data.predictions || [];
}

async function getPlaceDetails(placeId) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`
  );
  const data = await res.json();
  const loc = data.result?.geometry?.location;
  const addr = data.result?.formatted_address;
  return loc && addr ? { lat: loc.lat, lng: loc.lng, direccion: addr } : null;
}

async function buscarDireccion(direccion, zona) {
  console.log(`🔎 Buscando zona: ${zona}`);
  // Busco el bound de la zona, por ejemplo: Zona 2, Mixco.
  const bounds = await getBoundsZona(zona);
  if (!bounds) return console.error("❌ No se encontró el bounds de la zona");

  // Creo un poligono con las coordenadas del bound obtenido y le agrego un "buffer" (margen extra)
  const poligonoBuffer = boundsToPolygonWithBuffer(bounds, 150);

  console.log(`🔎 Buscando coincidencias para: ${direccion}`);

  // Busco en Places, todas las direcciones que contengan "dirección", por ejemplo: 12 Avenida A 13-28
  const candidates = await getAddresses(direccion);
  if (candidates.length === 0)
    return console.log("❌ No se encontraron direcciones similares");

  // Por cada dirección de Place, busco en maps sus coordenadas
  for (const c of candidates) {
    const details = await getPlaceDetails(c.place_id);
    if (!details) continue;

    // y me fijo si se encuentra dentro del poligono creado
    const punto = turf.point([details.lng, details.lat]);
    const pertenece = turf.booleanPointInPolygon(punto, poligonoBuffer);

    if (pertenece) {
      console.log(`✅ Dirección encontrada: ${details.direccion}`);
      console.log(
        `🔗 https://www.google.com/maps?q=${details.lat},${details.lng}`
      );
      return;
    }
  }

  console.log(
    candidates,
    "⚠️ No se encontró ninguna dirección dentro del área especificada."
  );
}

const address = "Colonia monte verde, Guatemala";
const bound = "zona 4 mixco, Guatemala";

buscarDireccion(address, bound);
