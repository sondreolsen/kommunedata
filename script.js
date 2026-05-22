const mapSvg = document.querySelector("#vestland-map");
const metricList = document.querySelector("#metric-list");
const resetButton = document.querySelector("#reset-button");
const mapTitle = document.querySelector("#map-title");
const mapNote = document.querySelector("#map-note");
const tableTitle = document.querySelector("#table-title");
const tableNote = document.querySelector("#table-note");
const tableBody = document.querySelector("#table-body");

const municipalityOrder = [
  "Alver", "Askvoll", "Askøy", "Aurland", "Austevoll", "Austrheim", "Bergen",
  "Bjørnafjorden", "Bremanger", "Bømlo", "Eidfjord", "Etne", "Fedje", "Fitjar",
  "Fjaler", "Gloppen", "Gulen", "Hyllestad", "Høyanger", "Kinn", "Kvam",
  "Kvinnherad", "Luster", "Lærdal", "Masfjorden", "Modalen", "Osterøy",
  "Sogndal", "Solund", "Samnanger", "Stad", "Stord", "Stryn", "Sunnfjord",
  "Sveio", "Tysnes", "Ullensvang", "Ulvik", "Vaksdal", "Vik", "Voss",
  "Årdal", "Øygarden"
];

const displayNameFixes = {
  "AskÃ¸y": "Askøy",
  "BjÃ¸rnafjorden": "Bjørnafjorden",
  "BÃ¸mlo": "Bømlo",
  "HÃ¸yanger": "Høyanger",
  "LÃ¦rdal": "Lærdal",
  "OsterÃ¸y": "Osterøy",
  "Ã…rdal": "Årdal",
  "Ã˜ygarden": "Øygarden"
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
    unit: "%",
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
    unit: "%",
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
    unit: "%",
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
    unit: "dager",
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
    unit: "%",
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
    unit: "%",
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
    unit: "%",
    format: value => `${value.toFixed(1).replace(".", ",")} %`,
    thresholds: {
      good: "Over 1,8 %",
      medium: "0 % til 1,8 %",
      bad: "Under 0 %"
    }
  }
};

function buildMetricValues() {
  return municipalityOrder.reduce((acc, name, index) => {
    acc[name] = {
      arbeidsledige: createValue(index, 1.5, 0.26, 4.1),
      ufore: createValue(index, 6.2, 0.44, 14.8),
      ungeUfore: createValue(index, 1.3, 0.12, 4.3),
      saksbehandlingstid: Math.round(createValue(index, 68, 8.2, 260)),
      sykefravaer: createValue(index, 5.7, 0.18, 9.4),
      befolkningsvekst: createGrowthValue(index),
      driftsresultat: createOperatingValue(index)
    };
    return acc;
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

const metricValues = buildMetricValues();
metricValues.Fedje.arbeidsledige = null;
metricValues.Modalen.ufore = null;
metricValues.Solund.ungeUfore = null;
metricValues.Fedje.saksbehandlingstid = null;
metricValues.Ulvik.sykefravaer = null;
metricValues.Austrheim.befolkningsvekst = null;
metricValues.Lærdal.driftsresultat = null;

const geoFeatures = (window.VESTLAND_GEOJSON?.features || []).map(feature => ({
  ...feature,
  properties: {
    ...feature.properties,
    kommunenavn: formatName(feature.properties.kommunenavn)
  }
})).sort((a, b) =>
  municipalityOrder.indexOf(formatName(a.properties.kommunenavn)) -
  municipalityOrder.indexOf(formatName(b.properties.kommunenavn))
);

const bounds = computeBounds(geoFeatures);
const projectedFeatures = geoFeatures.map(feature => {
  const projectedGeometry = projectGeometry(feature.geometry);
  return {
    ...feature,
    projectedGeometry,
    path: geometryToPath(projectedGeometry),
    centroid: geometryCentroid(projectedGeometry)
  };
});

let activeMetricKey = null;

renderMetricButtons();
renderMap();
renderTable();

resetButton.addEventListener("click", () => {
  activeMetricKey = null;
  updateUI();
});

function renderMetricButtons() {
  const buttons = Object.entries(metrics).map(([key, metric]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "metric-button";
    button.dataset.metric = key;
    button.innerHTML = `
      <span class="metric-button__title">${metric.title}</span>
      <span class="metric-button__meta">${metric.description}</span>
    `;
    button.addEventListener("click", () => {
      activeMetricKey = activeMetricKey === key ? null : key;
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

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", feature.centroid[0]);
    label.setAttribute("y", feature.centroid[1]);
    label.setAttribute("class", "municipality-label");
    label.dataset.name = feature.properties.kommunenavn;
    label.textContent = feature.properties.kommunenavn;
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
    : "Kommunene starter uten farge. Tallene under er eksempeldata til vi kobler på ekte statistikk.";
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
    const name = path.dataset.name;
    const metricData = activeMetricKey ? getMetricEntry(name, activeMetricKey) : null;
    const fill = metricData ? statusToColor(metricData.status) : "var(--map-base)";
    path.style.fill = fill;
  });

  mapSvg.querySelectorAll(".municipality-label").forEach(label => {
    const name = label.dataset.name;
    const metricData = activeMetricKey ? getMetricEntry(name, activeMetricKey) : null;
    label.classList.toggle("is-dark", !metricData || metricData.status === "medium" || metricData.status === "missing");
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

function formatName(name) {
  return displayNameFixes[name] || name;
}

function computeBounds(features) {
  const allPoints = [];
  features.forEach(feature => collectPoints(feature.geometry.coordinates, allPoints));

  const lons = allPoints.map(point => point[0]);
  const lats = allPoints.map(point => point[1]);

  return {
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats)
  };
}

function collectPoints(coords, result) {
  if (typeof coords[0] === "number") {
    result.push(coords);
    return;
  }

  coords.forEach(item => collectPoints(item, result));
}

function projectPoint(point) {
  const padding = 36;
  const width = 720 - padding * 2;
  const height = 980 - padding * 2;
  const lonSpan = bounds.maxLon - bounds.minLon;
  const latSpan = bounds.maxLat - bounds.minLat;
  const scale = Math.min(width / lonSpan, height / latSpan);

  const x = (point[0] - bounds.minLon) * scale + padding;
  const y = (bounds.maxLat - point[1]) * scale + padding;
  return [x, y];
}

function projectGeometry(geometry) {
  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: geometry.coordinates.map(ring => ring.map(projectPoint))
    };
  }

  return {
    type: "MultiPolygon",
    coordinates: geometry.coordinates.map(polygon => polygon.map(ring => ring.map(projectPoint)))
  };
}

function geometryToPath(geometry) {
  if (geometry.type === "Polygon") {
    return polygonToPath(geometry.coordinates);
  }

  return geometry.coordinates.map(polygon => polygonToPath(polygon)).join(" ");
}

function polygonToPath(polygon) {
  return polygon.map(ring => {
    const commands = ring.map((point, index) => `${index === 0 ? "M" : "L"} ${point[0].toFixed(2)} ${point[1].toFixed(2)}`);
    return `${commands.join(" ")} Z`;
  }).join(" ");
}

function geometryCentroid(geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  let largestArea = -1;
  let centroid = [0, 0];

  polygons.forEach(polygon => {
    const ring = polygon[0];
    const area = polygonArea(ring);
    if (area > largestArea) {
      largestArea = area;
      centroid = polygonCentroid(ring);
    }
  });

  return centroid;
}

function polygonArea(ring) {
  let area = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

function polygonCentroid(ring) {
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
