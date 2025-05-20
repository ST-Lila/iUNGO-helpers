async function obtenerGeoJSON(zona, apiKey) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  const headers = { "Content-Type": "application/json" };
  const params = { key: apiKey };
  const body = {
    contents: [
      {
        parts: [
          {
            text: "Eres un servicio de geocodificación: recibes una ZONA de Guatemala y respondes SOLO un geojson con las coordenadas de esa zona. NUNCA Y BAJO NINGUN CONCEPTO deberás pasar un geojson que corresponda a otro sector",
          },
          { text: zona },
        ],
      },
    ],
  };

  try {
    const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json();
      console.error("Error al obtener el GeoJSON:", error);
      return null;
    }
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error("Error de red al obtener el GeoJSON:", error);
    return null;
  }
}

async function obtenerEnlaceGoogleMaps(direccion, geojsonZona, apiKey) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  const headers = { "Content-Type": "application/json" };
  const params = { key: apiKey };
  const body = {
    contents: [
      {
        parts: [
          {
            text: "Eres un servicio de geocodificación: recibes una dirección completa de Guatemala y un geojson con la ZONA en la que se encuentra esa dirección y respondes SOLO un enlace de Google Maps con layer map de las 2 direcciones que hagan match con los requerimientos. LIMITÁ SIEMPRE EN EL 100% DE LAS VECES tu búsqueda a la ZONA del geojson, NUNCA Y BAJO NINGUN CONCEPTO LAS DIRECCIONES DEVUELTAS PUEDEN ENCONTRARSE POR FUERA DE ESA ZONA. Prestá ESPECIAL atención a la ZONA, COLONIA o MUNICIPIO. Tené en cuenta que la numeración indica dos cosas: 1) número de la vía transversal más cercana (calle o avenida, según el eje) y 2) distancia desde esa intersección, en decenas de metros. Ejemplo: 4a Calle 9-12, Zona 1 Indica que: 1) Buscarás SOLO en la zona 1 de Guatemala. 2) Está SOBRE la 4a Calle. 3) A 12 metros desde la intersección con la 9a Avenida. 9-12 y 912 NO ES LO MISMO, DALE EXTREMA PRIORIDAD A LAS ZONAS Y COLONIAS, luego buscas la calle y altura.",
          },
          { text: `Dirección a buscar: ${JSON.stringify(direccion)}` },
          { text: `zona: \`\`\`json\n${geojsonZona}\n\`\`\`` },
        ],
      },
    ],
  };

  try {
    const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json();
      console.error("Error al obtener el enlace de Google Maps:", error);
      return null;
    }
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error("Error de red al obtener el enlace de Google Maps:", error);
    return null;
  }
}

async function main() {
  const apiKey = "AIzaSyDb6-qo0OMGvGNWbxnrsX2Ke07PHa74T_o";

  const zonaABuscarGeoJSON = "Zona 2 Mixco";
  const direccionABuscarMapa = {
    via: "7 Calle",
    numero: "14-67",
    colonia: "",
    municipio: "Mixco",
    referencia: "",
  };

  console.log("--- Obteniendo GeoJSON ---");
  const geojsonRespuesta = await obtenerGeoJSON(zonaABuscarGeoJSON, apiKey);
  if (geojsonRespuesta) {
    console.log("GeoJSON obtenido:");
    console.log(geojsonRespuesta);

    // console.log("\n--- Obteniendo enlace de Google Maps ---");
    // const enlaceMapa = await obtenerEnlaceGoogleMaps(
    //   direccionABuscarMapa,
    //   geojsonRespuesta,
    //   apiKey
    // );
    // if (enlaceMapa) {
    //   console.log("Enlace de Google Maps obtenido:");
    //   console.log(enlaceMapa);
    // }
  }
}

main();
