const mapSvg = document.querySelector("#vestland-map");
const metricList = document.querySelector("#metric-list");
const resetButton = document.querySelector("#reset-button");
const mapTitle = document.querySelector("#map-title");
const mapNote = document.querySelector("#map-note");
const tableTitle = document.querySelector("#table-title");
const tableNote = document.querySelector("#table-note");
const tableBody = document.querySelector("#table-body");

const VIEW_WIDTH = 760;
const VIEW_HEIGHT = 980;
const MAP_PADDING = 26;

const municipalityOrder = [
  "Alver", "Askvoll", "Askøy", "Aurland", "Austevoll", "Austrheim", "Bergen",
  "Bjørnafjorden", "Bremanger", "Bømlo", "Eidfjord", "Etne", "Fedje", "Fitjar",
  "Fjaler", "Gloppen", "Gulen", "Hyllestad", "Høyanger", "Kinn", "Kvam",
  "Kvinnherad", "Luster", "Lærdal", "Masfjorden", "Modalen", "Osterøy",
  "Samnanger", "Sogndal", "Solund", "Stad", "Stord", "Stryn", "Sunnfjord",
  "Sveio", "Tysnes", "Ullensvang", "Ulvik", "Vaksdal", "Vik", "Voss",
  "Årdal", "Øygarden"
];

const labelOffsets = {
  Askøy: [-10, -6],
  Austrheim: [0, -10],
  Austevoll: [0, 14],
  Bergen: [0, 6],
  Bjørnafjorden: [22, 6],
  Bømlo: [0, 10],
  Eidfjord: [0, -6],
  Fedje: [0, -7],
  Fitjar: [12, 8],
  Kvam: [14, 10],
  Modalen: [0, -8],
  Osterøy: [17, -8],
  Samnanger: [22, 9],
  Stord: [12, 6],
  Sveio: [0, 10],
  Tysnes: [18, 12],
  Ulvik: [12, -2],
  Vaksdal: [12, 0],
  Øygarden: [-18, -2]
};

const labelShortNames = {
  Bjørnafjorden: "Bjørnafj."
};

const thresholdsText = {
  good: "Grønn",
  medium: "Gul",
  bad: "Rød",
  missing: "Mangler data"
};

const metrics = {
  arbeidsledige: {
    title: "Arbeidsledige",
    description: "Eksempeldata. Lavere andel er bedre.",
    format: value => `${value.toFixed(1).replace(".", ",")} %`,
    thresholds: {
      good: "Under 2,2 %",
      medium: "2,2 % til 3,0 %",
      bad: "Over 3,0 %"
    }
  },
  ufore: {
    title: "Uføre",
    description: "Eksempeldata. Lavere andel er bedre.",
    format: value => `${value.toFixed(1).replace(".", ",")} %`,
    thresholds: {
      good: "Under 8,5 %",
      medium: "8,5 % til 11,0 %",
      bad: "Over 11,0 %"
    }
  },
  ungeUfore: {
    title: "Unge uføre",
    description: "Eksempeldata. Lavere andel er bedre.",
    format: value => `${value.toFixed(1).replace(".", ",")} %`,
    thresholds: {
      good: "Under 2,4 %",
      medium: "2,4 % til 3,2 %",
      bad: "Over 3,2 %"
    }
  },
  saksbehandlingstid: {
    title: "Saksbehandlingstid private planer",
    description: "Eksempeldata. Lavere antall dager er bedre.",
    format: value => `${Math.round(value)} dager`,
    thresholds: {
      good: "Under 120 dager",
      medium: "120 til 180 dager",
      bad: "Over 180 dager"
    }
  },
  sykefravaer: {
    title: "Sykefravær",
    description: "Eksempeldata. Lavere andel er bedre.",
    format: value => `${value.toFixed(1).replace(".", ",")} %`,
    thresholds: {
      good: "Under 6,8 %",
      medium: "6,8 % til 8,0 %",
      bad: "Over 8,0 %"
    }
  },
  befolkningsvekst: {
    title: "Befolkningsvekst i prosent de siste tre årene",
    description: "Eksempeldata. Høyere vekst er bedre.",
    format: value => `${value.toFixed(1).replace(".", ",")} %`,
    thresholds: {
      good: "Over 2,5 %",
      medium: "0 % til 2,5 %",
      bad: "Under 0 %"
    }
  },
  driftsresultat: {
    title: "Driftsresultat kommunen",
    description: "Eksempeldata. Høyere resultat er bedre.",
    format: value => `${value.toFixed(1).replace(".", ",")} %`,
    thresholds: {
      good: "Over 1,8 %",
      medium: "0 % til 1,8 %",
      bad: "Under 0 %"
    }
  },
  eiendomsskatt: {
    title: "Eiendomsskatt",
    description: "Eksempeldata. Lavere nivå er bedre.",
    format: value => `${value.toFixed(1).replace(".", ",")} ‰`,
    thresholds: {
      good: "Under 2,0 ‰",
      medium: "2,0 ‰ til 4,0 ‰",
      bad: "Over 4,0 ‰"
    }
  }
};

function buildMetricValues() {
  return municipalityOrder.reduce((accumulator, municipalityName, index) => {
    accumulator[municipalityName] = {
      arbeidsledige: createValue(index, 1.4, 0.28, 4.4),
      ufore: createValue(index, 6.1, 0.43, 14.9),
      ungeUfore: createValue(index, 1.2, 0.13, 4.6),
      saksbehandlingstid: Math.round(createValue(index, 65, 8.5, 260)),
      sykefravaer: createValue(index, 5.6, 0.19, 9.7),
      befolkningsvekst: createGrowthValue(index),
      driftsresultat: createOperatingValue(index),
      eiendomsskatt: createTaxValue(index)
    };
    return accumulator;
  }, {});
}

function createValue(index, base, step, maxValue) {
  const wave = ((index * 7) % 9) * 0.17;
  return Math.min(base + index * step * 0.27 + wave, maxValue);
}

function createGrowthValue(index) {
  const value = -1.8 + index * 0.12 + (((index * 5) % 8) - 3) * 0.22;
  return Math.max(-4.2, Math.min(value, 5.8));
}

function createOperatingValue(index) {
  const value = -0.9 + index * 0.08 + (((index * 3) % 7) - 2) * 0.19;
  return Math.max(-3.1, Math.min(value, 4.9));
}

function createTaxValue(index) {
  const value = 0.8 + index * 0.09 + (((index * 4) % 7) - 2) * 0.21;
  return Math.max(0, Math.min(value, 6.5));
}

const metricValues = buildMetricValues();
metricValues.Fedje.arbeidsledige = null;
metricValues.Modalen.ufore = null;
metricValues.Solund.ungeUfore = null;
metricValues.Fedje.saksbehandlingstid = null;
metricValues.Ulvik.sykefravaer = null;
metricValues.Austrheim.befolkningsvekst = null;
metricValues.Lærdal.driftsresultat = null;
metricValues.Austevoll.eiendomsskatt = null;

const rawFeatures = (window.VESTLAND_GEOJSON?.features || [])
  .filter(feature => municipalityOrder.includes(feature.properties.kommunenavn))
  .sort((left, right) =>
    municipalityOrder.indexOf(left.properties.kommunenavn) -
    municipalityOrder.indexOf(right.properties.kommunenavn)
  );

const projection = buildProjection(rawFeatures, window.VESTLAND_BOUNDARIES?.features || []);
const projectedFeatures = rawFeatures.map(feature => {
  const geometry = projectGeometry(feature.geometry, projection);
  const mainRing = largestRing(geometry);
  return {
    ...feature,
    geometry,
    path: geometryToPath(geometry),
    centroid: ringCentroid(mainRing),
    area: ringArea(mainRing)
  };
});

const boundaryFeatures = (window.VESTLAND_BOUNDARIES?.features || []).map(feature => ({
  ...feature,
  projected: projectLineGeometry(feature.geometry, projection),
  kind: feature.properties.avgrensningstype
}));

let activeMetricKey = null;

mapSvg.setAttribute("viewBox", `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`);

renderMetricButtons();
renderMap();
renderTable();

resetButton.addEventListener("click", () => {
  activeMetricKey = null;
  updateUI();
});

function renderMetricButtons() {
  const buttons = Object.entries(metrics).map(([metricKey, metric]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "metric-button";
    button.dataset.metric = metricKey;
    button.innerHTML = `
      <span class="metric-button__title">${metric.title}</span>
      <span class="metric-button__meta">${metric.description}</span>
    `;
    button.addEventListener("click", () => {
      activeMetricKey = activeMetricKey === metricKey ? null : metricKey;
      updateUI();
    });
    metricList.appendChild(button);
    return button;
  });

  updateButtonState(buttons);
}

function renderMap() {
  mapSvg.innerHTML = "";

  projectedFeatures.forEach(feature => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", feature.path);
    path.setAttribute("class", "municipality");
    path.dataset.name = feature.properties.kommunenavn;
    path.setAttribute("tabindex", "0");
    path.setAttribute("aria-label", feature.properties.kommunenavn);
    mapSvg.appendChild(path);
  });

  boundaryFeatures.forEach(feature => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", lineToPath(feature.projected));
    path.setAttribute("class", feature.kind === "Fylkesgrense" ? "outer-boundary" : "boundary-line");
    mapSvg.appendChild(path);
  });

  projectedFeatures.forEach(feature => {
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const [offsetX, offsetY] = labelOffsets[feature.properties.kommunenavn] || [0, 0];
    label.setAttribute("x", (feature.centroid[0] + offsetX).toFixed(1));
    label.setAttribute("y", (feature.centroid[1] + offsetY).toFixed(1));
    label.setAttribute("class", "municipality-label");
    label.dataset.name = feature.properties.kommunenavn;

    if (feature.area < 240) {
      label.classList.add("municipality-label--tiny");
    } else if (feature.area < 540) {
      label.classList.add("municipality-label--small");
    }

    label.textContent = labelShortNames[feature.properties.kommunenavn] || feature.properties.kommunenavn;
    mapSvg.appendChild(label);
  });

  updateMapColors();
}

function renderTable() {
  tableBody.innerHTML = "";

  municipalityOrder.forEach(name => {
    const row = document.createElement("tr");
    const metricData = activeMetricKey ? getMetricEntry(name, activeMetricKey) : null;
    row.innerHTML = `
      <td>${name}</td>
      <td>${metricData ? formatMetricValue(activeMetricKey, metricData.value) : "Velg statistikk"}</td>
      <td>${metricData ? renderStatusPill(metricData.status) : "Ingen valgt"}</td>
    `;
    tableBody.appendChild(row);
  });
}

function updateUI() {
  mapTitle.textContent = activeMetricKey ? metrics[activeMetricKey].title : "Velg en statistikk";
  mapNote.textContent = activeMetricKey
    ? buildThresholdText(activeMetricKey)
    : "Kartet bruker nå de offisielle Vestland-filene du la i mappen. Tallene er fortsatt eksempeldata til vi kobler på ekte statistikk.";
  tableTitle.textContent = activeMetricKey ? metrics[activeMetricKey].title : "Ingen statistikk valgt";
  tableNote.textContent = activeMetricKey
    ? `${metrics[activeMetricKey].description} Visningen kan senere kobles direkte mot lenker og definerte terskler.`
    : "Eksempeldata brukes i denne første versjonen.";

  updateButtonState([...metricList.querySelectorAll(".metric-button")]);
  updateMapColors();
  renderTable();
}

function updateButtonState(buttons) {
  buttons.forEach(button => {
    button.classList.toggle("is-active", button.dataset.metric === activeMetricKey);
  });
}

function updateMapColors() {
  mapSvg.querySelectorAll(".municipality").forEach(path => {
    const municipalityName = path.dataset.name;
    const metricData = activeMetricKey ? getMetricEntry(municipalityName, activeMetricKey) : null;
    path.style.fill = metricData ? statusToColor(metricData.status) : "var(--map-base)";
  });

  mapSvg.querySelectorAll(".municipality-label").forEach(label => {
    const municipalityName = label.dataset.name;
    const metricData = activeMetricKey ? getMetricEntry(municipalityName, activeMetricKey) : null;
    const darkLabel = !metricData || metricData.status === "medium" || metricData.status === "missing";
    label.classList.toggle("is-dark", darkLabel);
  });
}

function getMetricEntry(name, metricKey) {
  const rawValue = metricValues[name]?.[metricKey];
  return {
    value: rawValue,
    status: getStatus(metricKey, rawValue)
  };
}

function getStatus(metricKey, value) {
  if (value === null || value === undefined) {
    return "missing";
  }

  if (metricKey === "arbeidsledige") {
    if (value < 2.2) return "good";
    if (value <= 3.0) return "medium";
    return "bad";
  }

  if (metricKey === "ufore") {
    if (value < 8.5) return "good";
    if (value <= 11.0) return "medium";
    return "bad";
  }

  if (metricKey === "ungeUfore") {
    if (value < 2.4) return "good";
    if (value <= 3.2) return "medium";
    return "bad";
  }

  if (metricKey === "sykefravaer") {
    if (value < 6.8) return "good";
    if (value <= 8.0) return "medium";
    return "bad";
  }

  if (metricKey === "befolkningsvekst") {
    if (value > 2.5) return "good";
    if (value >= 0) return "medium";
    return "bad";
  }

  if (metricKey === "driftsresultat") {
    if (value > 1.8) return "good";
    if (value >= 0) return "medium";
    return "bad";
  }

  if (metricKey === "eiendomsskatt") {
    if (value < 2.0) return "good";
    if (value <= 4.0) return "medium";
    return "bad";
  }

  if (value < 120) return "good";
  if (value <= 180) return "medium";
  return "bad";
}

function formatMetricValue(metricKey, value) {
  if (value === null || value === undefined) {
    return "Mangler data";
  }

  return metrics[metricKey].format(value);
}

function renderStatusPill(status) {
  return `<span class="status-pill status-pill--${status}">${thresholdsText[status]}</span>`;
}

function buildThresholdText(metricKey) {
  const metric = metrics[metricKey];
  return `Grønn: ${metric.thresholds.good}. Gul: ${metric.thresholds.medium}. Rød: ${metric.thresholds.bad}.`;
}

function statusToColor(status) {
  if (status === "good") return "var(--good)";
  if (status === "medium") return "var(--medium)";
  if (status === "bad") return "var(--bad)";
  return "var(--missing)";
}

function buildProjection(features, lineFeatures) {
  const lonLatPoints = [];
  features.forEach(feature => collectCoordinates(feature.geometry.coordinates, lonLatPoints));
  lineFeatures.forEach(feature => collectCoordinates(feature.geometry.coordinates, lonLatPoints));

  const mercatorPoints = lonLatPoints.map(([lon, lat]) => [lon, mercatorY(lat)]);
  const xValues = mercatorPoints.map(point => point[0]);
  const yValues = mercatorPoints.map(point => point[1]);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const scale = Math.min(
    (VIEW_WIDTH - MAP_PADDING * 2) / (maxX - minX),
    (VIEW_HEIGHT - MAP_PADDING * 2) / (maxY - minY)
  );
  const offsetX = (VIEW_WIDTH - (maxX - minX) * scale) / 2;
  const offsetY = (VIEW_HEIGHT - (maxY - minY) * scale) / 2;

  return {
    scale,
    minX,
    maxY,
    offsetX,
    offsetY
  };
}

function mercatorY(latitude) {
  const radians = latitude * (Math.PI / 180);
  return Math.log(Math.tan(Math.PI / 4 + radians / 2));
}

function collectCoordinates(coordinates, result) {
  if (!Array.isArray(coordinates)) {
    return;
  }

  if (typeof coordinates[0] === "number") {
    result.push(coordinates);
    return;
  }

  coordinates.forEach(item => collectCoordinates(item, result));
}

function projectPoint([longitude, latitude], projection) {
  return [
    (longitude - projection.minX) * projection.scale + projection.offsetX,
    (projection.maxY - mercatorY(latitude)) * projection.scale + projection.offsetY
  ];
}

function projectGeometry(geometry, projection) {
  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: geometry.coordinates.map(ring => ring.map(point => projectPoint(point, projection)))
    };
  }

  return {
    type: "MultiPolygon",
    coordinates: geometry.coordinates.map(
      polygon => polygon.map(ring => ring.map(point => projectPoint(point, projection)))
    )
  };
}

function projectLineGeometry(geometry, projection) {
  if (geometry.type === "LineString") {
    return {
      type: "LineString",
      coordinates: geometry.coordinates.map(point => projectPoint(point, projection))
    };
  }

  return {
    type: "MultiLineString",
    coordinates: geometry.coordinates.map(
      line => line.map(point => projectPoint(point, projection))
    )
  };
}

function geometryToPath(geometry) {
  if (geometry.type === "Polygon") {
    return polygonToPath(geometry.coordinates);
  }

  return geometry.coordinates.map(polygon => polygonToPath(polygon)).join(" ");
}

function polygonToPath(polygon) {
  return polygon
    .map(ring => {
      const commands = ring.map(
        (point, index) => `${index === 0 ? "M" : "L"} ${point[0].toFixed(2)} ${point[1].toFixed(2)}`
      );
      return `${commands.join(" ")} Z`;
    })
    .join(" ");
}

function lineToPath(geometry) {
  if (geometry.type === "LineString") {
    return lineCommands(geometry.coordinates);
  }

  return geometry.coordinates.map(line => lineCommands(line)).join(" ");
}

function lineCommands(line) {
  return line
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point[0].toFixed(2)} ${point[1].toFixed(2)}`)
    .join(" ");
}

function largestRing(geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  let biggestRing = polygons[0][0];
  let biggestArea = 0;

  polygons.forEach(polygon => {
    const ring = polygon[0];
    const area = ringArea(ring);
    if (area > biggestArea) {
      biggestArea = area;
      biggestRing = ring;
    }
  });

  return biggestRing;
}

function ringArea(ring) {
  let area = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

function ringCentroid(ring) {
  let areaFactor = 0;
  let x = 0;
  let y = 0;

  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    const factor = x1 * y2 - x2 * y1;
    areaFactor += factor;
    x += (x1 + x2) * factor;
    y += (y1 + y2) * factor;
  }

  if (!areaFactor) {
    return ring[0];
  }

  return [x / (3 * areaFactor), y / (3 * areaFactor)];
}
