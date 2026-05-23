const SVG_NS = "http://www.w3.org/2000/svg";

const mapSvg = document.querySelector("#vestland-map");
const mapSurface = document.querySelector(".map-surface");
const mapTooltip = document.querySelector("#map-tooltip");
const metricList = document.querySelector("#metric-list");
const resetButton = document.querySelector("#reset-button");
const mapTitle = document.querySelector("#map-title");
const mapNote = document.querySelector("#map-note");
const tableTitle = document.querySelector("#table-title");
const tableNote = document.querySelector("#table-note");
const tableBody = document.querySelector("#table-body");
const summaryTitle = document.querySelector("#summary-title");
const summaryGood = document.querySelector("#summary-good");
const summaryMedium = document.querySelector("#summary-medium");
const summaryBad = document.querySelector("#summary-bad");
const summaryNote = document.querySelector("#summary-note");

const VIEW_WIDTH = 820;
const VIEW_HEIGHT = 1180;
const MAP_PADDING = 22;
const MIN_ZOOM = 0.82;
const MAX_ZOOM = 2.8;

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
  Askøy: [-14, -6],
  Aurland: [16, 4],
  Austrheim: [-10, 8],
  Austevoll: [-20, 16],
  Bergen: [6, 10],
  Bjørnafjorden: [14, 14],
  Bømlo: [-14, 14],
  Eidfjord: [16, -8],
  Fedje: [-28, -4],
  Fitjar: [-6, 10],
  Kinn: [-10, -14],
  Kvam: [16, 10],
  Lærdal: [18, 8],
  Modalen: [12, -8],
  Osterøy: [14, -6],
  Samnanger: [18, 10],
  Solund: [-26, -6],
  Stord: [4, 12],
  Sveio: [-8, 18],
  Tysnes: [8, 14],
  Ulvik: [18, -4],
  Vaksdal: [12, 0],
  Øygarden: [-24, -4],
  Årdal: [22, 0]
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
    title: "Arbeidsledighet",
    description: "Helt ledige i prosent av arbeidsstyrken. Tall fra NAV for april 2026.",
    format: value => `${formatDecimal(value)} %`,
    thresholds: { good: "Under 2,5 %", medium: "2,5 % til og med 5,0 %", bad: "Over 5,0 %" },
    source: "NAV Hovedtall om arbeidsmarkedet, april 2026"
  },
  ufore: {
    title: "Uføretrygdede",
    description: "Uføretrygdede i prosent av befolkningen. Tall fra SSB for 2024.",
    format: value => `${formatDecimal(value)} %`,
    thresholds: {
      good: "Lav andel i Vestland",
      medium: "Middels andel i Vestland",
      bad: "Høy andel i Vestland"
    },
    source: "SSB tabell 11695, 2024"
  },
  saksbehandlingstid: {
    title: "Saksbehandlingstid private planer",
    description: "Samlet tid fra oppstartsmøte til endelig vedtak i kommunestyret. Tall fra SSB for 2025, supplert med 2024/2023 der 2025 mangler.",
    format: value => `${Math.round(value)} dager`,
    thresholds: { good: "Under 400 dager", medium: "400 til 999 dager", bad: "Over 999 dager" },
    source: "SSB tabell 12671, 2025"
  },
  gebyrPrivatePlaner: {
    title: "Gebyr private planer",
    description: "Gebyr for privat forslag til detaljreguleringsplan. Tall fra SSB for 2025.",
    format: value => `${formatWholeNumber(value)} kr`,
    thresholds: { good: "Opp til 100 000 kr", medium: "100 000 til 150 000 kr", bad: "Over 150 000 kr" },
    source: "SSB tabell 12671, 2025"
  },
  sykefravaer: {
    title: "Sykefravær",
    description: "Legemeldt sykefraværsprosent. Tall fra SSB for 4. kvartal 2025.",
    format: value => `${formatDecimal(value)} %`,
    thresholds: { good: "Under 5,5 %", medium: "5,5 til 6,4 %", bad: "6,5 % eller høyere" },
    source: "SSB tabell 12451, 2025K4"
  },
  befolkningsvekst: {
    title: "Befolkningsvekst i prosent de siste tre årene",
    description: "Endring i folketall siste tre år.",
    format: value => `${value.toFixed(1).replace(".", ",")} %`,
    thresholds: { good: "Over 2,5 %", medium: "0 % til 2,5 %", bad: "Under 0 %" }
  },
  driftsresultat: {
    title: "Driftsresultat kommunen",
    tooltipTitle: "Driftsresultat",
    description: "Netto driftsresultat i prosent av brutto driftsinntekter. Tall fra SSB for 2025.",
    format: value => `${formatDecimal(value)} %`,
    thresholds: { good: "2,0 % eller mer", medium: "0,0 % til 1,9 %", bad: "Under 0,0 %" },
    source: "SSB tabell 12134, 2025"
  },
  eiendomsskatt: {
    title: "Eiendomsskatt",
    description: "Promillesats eller tilsvarende nivå.",
    format: value => `${value.toFixed(1).replace(".", ",")} ‰`,
    thresholds: { good: "Under 2,0 ‰", medium: "2,0 ‰ til 4,0 ‰", bad: "Over 4,0 ‰" }
  }
};

function buildMetricValues() {
  return municipalityOrder.reduce((accumulator, municipalityName, index) => {
    accumulator[municipalityName] = {
      arbeidsledige: getNavArbeidsledighetValue(municipalityName),
      ufore: getSsbUforeValue(municipalityName) ?? createValue(index, 6.1, 0.43, 14.9),
      saksbehandlingstid: getSsbPrivatePlanerValue(municipalityName, "saksbehandlingstid"),
      gebyrPrivatePlaner: getSsbPrivatePlanerValue(municipalityName, "gebyrPrivatePlaner"),
      sykefravaer: getSsbSykefravaerValue(municipalityName),
      befolkningsvekst: createGrowthValue(index),
      driftsresultat: getSsbDriftsresultatValue(municipalityName, createOperatingValue(index)),
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

function getNavArbeidsledighetValue(municipalityName) {
  return window.NAV_ARBEIDSLEDIGHET_2026_APRIL?.municipalities?.[municipalityName]?.value ?? null;
}

function getSsbUforeValue(municipalityName) {
  return window.SSB_UFORETRYGD_2024?.municipalities?.[municipalityName]?.value;
}

function getSsbDriftsresultatValue(municipalityName, fallbackValue) {
  const data = window.SSB_DRIFTSRESULTAT_2025?.municipalities;
  if (!data || !Object.prototype.hasOwnProperty.call(data, municipalityName)) {
    return fallbackValue;
  }

  return data[municipalityName].value;
}

function getSsbPrivatePlanerValue(municipalityName, metricKey) {
  return window.SSB_PRIVATE_PLANER_2025?.municipalities?.[municipalityName]?.[metricKey] ?? null;
}

function getSsbSykefravaerValue(municipalityName) {
  return window.SSB_SYKEFRAVAER_2025K4?.municipalities?.[municipalityName]?.value ?? null;
}

function buildBreakpoints(metricKey) {
  const values = municipalityOrder
    .map(name => metricValues[name]?.[metricKey])
    .filter(value => value !== null && value !== undefined)
    .sort((left, right) => left - right);

  if (!values.length) {
    return null;
  }

  return {
    goodMax: values[Math.floor((values.length - 1) / 3)],
    mediumMax: values[Math.floor((values.length - 1) * 2 / 3)]
  };
}

const metricValues = buildMetricValues();
metricValues.Austrheim.befolkningsvekst = null;
metricValues.Austevoll.eiendomsskatt = null;

const uforeBreakpoints = buildBreakpoints("ufore");
if (uforeBreakpoints) {
  metrics.ufore.thresholds = {
    good: `Lav andel, til og med ${formatDecimal(uforeBreakpoints.goodMax)} %`,
    medium: `Over ${formatDecimal(uforeBreakpoints.goodMax)} % til ${formatDecimal(uforeBreakpoints.mediumMax)} %`,
    bad: `Over ${formatDecimal(uforeBreakpoints.mediumMax)} %`
  };
}

const municipalitySource = window.VESTLAND_LAND_GEOJSON || window.VESTLAND_GEOJSON;
const municipalityFeatures = (municipalitySource?.features || [])
  .filter(feature => municipalityOrder.includes(feature.properties.kommunenavn))
  .sort((left, right) =>
    municipalityOrder.indexOf(left.properties.kommunenavn) -
    municipalityOrder.indexOf(right.properties.kommunenavn)
  );

const projection = buildProjection(municipalityFeatures);
const projectedMunicipalities = municipalityFeatures.map(feature => {
  const geometry = projectGeometry(feature.geometry, projection);
  const mainRing = largestRing(geometry);
  return {
    ...feature,
    projectedGeometry: geometry,
    path: geometryToPath(geometry),
    centroid: ringCentroid(mainRing),
    area: ringArea(mainRing)
  };
});

let activeMetricKey = null;
let selectedMunicipality = null;
let searchTerm = "";
let mapContent = null;
let zoomLevel = 1;
let panX = 0;
let panY = 0;
let pinchStartDistance = null;
let pinchStartZoom = 1;
let pinchStartCenter = null;
let pinchStartPan = { x: 0, y: 0 };
let suppressMapClick = false;
const activeMapPointers = new Map();

mapSvg.setAttribute("viewBox", `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`);
mapSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");

renderMetricButtons();
renderMap();
renderTable();
updateSummary();

resetButton.addEventListener("click", () => {
  activeMetricKey = null;
  selectedMunicipality = null;
  searchTerm = "";
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  updateUI();
  updateMapTransform();
});

mapSurface.addEventListener("pointerdown", handleMapPointerDown, { passive: false });
mapSurface.addEventListener("pointermove", handleMapPointerMove, { passive: false });
mapSurface.addEventListener("pointerup", handleMapPointerEnd);
mapSurface.addEventListener("pointercancel", handleMapPointerEnd);

function renderMetricButtons() {
  Object.entries(metrics).forEach(([metricKey, metric]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "metric-button";
    button.dataset.metric = metricKey;
    button.innerHTML = `
      <span>
        <span class="metric-button__title">${metric.title}</span>
        <span class="metric-button__meta">${metric.description}</span>
      </span>
      <span class="metric-button__indicator" aria-hidden="true"></span>
    `;
    button.addEventListener("click", () => {
      activeMetricKey = activeMetricKey === metricKey ? null : metricKey;
      selectedMunicipality = null;
      updateUI();
    });
    metricList.appendChild(button);
  });
}

function renderMap() {
  mapSvg.innerHTML = "";

  mapContent = document.createElementNS(SVG_NS, "g");
  mapContent.setAttribute("class", "map-content");
  mapSvg.appendChild(mapContent);

  const municipalityGroup = document.createElementNS(SVG_NS, "g");
  municipalityGroup.setAttribute("class", "municipality-layer");
  mapContent.appendChild(municipalityGroup);

  projectedMunicipalities.forEach(feature => {
    const name = feature.properties.kommunenavn;
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", feature.path);
    path.setAttribute("class", "municipality");
    path.setAttribute("fill-rule", "evenodd");
    path.dataset.name = name;
    path.setAttribute("tabindex", "0");

    path.addEventListener("pointerenter", event => {
      showMapTooltip(event, name);
    });

    path.addEventListener("pointermove", event => {
      moveMapTooltip(event);
    });

    path.addEventListener("pointerleave", () => {
      hideMapTooltip();
    });

    path.addEventListener("mouseenter", event => {
      showMapTooltip(event, name);
    });

    path.addEventListener("mousemove", event => {
      moveMapTooltip(event);
    });

    path.addEventListener("mouseleave", () => {
      hideMapTooltip();
    });

    path.addEventListener("click", event => {
      if (suppressMapClick) {
        event.preventDefault();
        return;
      }

      showMapTooltip(event, name);
      selectedMunicipality = selectedMunicipality === name ? null : name;
      updateMapStyles();
      updateSummary();
    });

    path.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectedMunicipality = selectedMunicipality === name ? null : name;
        updateMapStyles();
        updateSummary();
      }
    });

    municipalityGroup.appendChild(path);
  });

  const labelGroup = document.createElementNS(SVG_NS, "g");
  labelGroup.setAttribute("class", "label-layer");
  mapContent.appendChild(labelGroup);

  projectedMunicipalities.forEach(feature => {
    const name = feature.properties.kommunenavn;
    const [offsetX, offsetY] = labelOffsets[name] || [0, 0];
    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("x", (feature.centroid[0] + offsetX).toFixed(1));
    label.setAttribute("y", (feature.centroid[1] + offsetY).toFixed(1));
    label.setAttribute("class", labelClass(feature.area));
    label.dataset.name = name;
    label.textContent = labelShortNames[name] || name;
    labelGroup.appendChild(label);
  });

  updateMapStyles();
  updateMapTransform();
}

function renderTable() {
  tableBody.innerHTML = "";

  municipalityOrder.forEach(name => {
    const row = document.createElement("tr");
    const metricData = activeMetricKey ? getMetricEntry(name, activeMetricKey) : null;
    row.innerHTML = `
      <td>${name}</td>
      <td>${metricData ? formatMetricValue(activeMetricKey, metricData.value, name) : "Velg statistikk"}</td>
      <td>${metricData ? renderStatusPill(metricData.status) : "Ingen valgt"}</td>
    `;
    tableBody.appendChild(row);
  });
}

function updateUI() {
  mapTitle.textContent = activeMetricKey ? metrics[activeMetricKey].title : "Velg en statistikk";
  mapNote.textContent = activeMetricKey
    ? buildThresholdText(activeMetricKey)
    : "Kommunene starter nøytralt. Fjorder og sjø vises i blått mellom landflatene.";
  tableTitle.textContent = activeMetricKey ? metrics[activeMetricKey].title : "Ingen statistikk valgt";
  tableNote.textContent = activeMetricKey
    ? buildMetricDescription(activeMetricKey)
    : "Velg en statistikk for å se tall per kommune.";

  updateButtonState();
  updateMapStyles();
  renderTable();
  updateSummary();
  refreshVisibleMapTooltip();
}

function updateButtonState() {
  metricList.querySelectorAll(".metric-button").forEach(button => {
    button.classList.toggle("is-active", button.dataset.metric === activeMetricKey);
  });
}

function updateMapStyles() {
  mapSvg.querySelectorAll(".municipality").forEach(path => {
    const name = path.dataset.name;
    const metricData = activeMetricKey ? getMetricEntry(name, activeMetricKey) : null;
    const isMatch = matchesSearch(name);
    const isSelected = selectedMunicipality === name;

    path.style.fill = metricData ? statusToColor(metricData.status) : "var(--land)";
    path.style.opacity = isMatch ? "1" : "0.22";
    path.setAttribute("aria-label", buildMunicipalityTooltipText(name).replace("\n", ", "));
    path.classList.toggle("is-selected", isSelected);
  });

  mapSvg.querySelectorAll(".municipality-label").forEach(label => {
    label.style.opacity = matchesSearch(label.dataset.name) ? "1" : "0.2";
    label.classList.toggle("is-selected", selectedMunicipality === label.dataset.name);
  });
}

function updateMapTransform() {
  if (!mapContent) {
    return;
  }

  const centerX = VIEW_WIDTH / 2;
  const centerY = VIEW_HEIGHT / 2;
  mapContent.setAttribute(
    "transform",
    `translate(${centerX + panX} ${centerY + panY}) scale(${zoomLevel}) translate(${-centerX} ${-centerY})`
  );
}

function handleMapPointerDown(event) {
  if (event.pointerType !== "touch") {
    return;
  }

  activeMapPointers.set(event.pointerId, {
    x: event.clientX,
    y: event.clientY
  });

  if (mapSurface.setPointerCapture) {
    try {
      mapSurface.setPointerCapture(event.pointerId);
    } catch {
      // Some browsers can reject capture after a touch has already ended.
    }
  }

  if (activeMapPointers.size === 2) {
    event.preventDefault();
    hideMapTooltip();
    pinchStartDistance = getPinchDistance();
    pinchStartZoom = zoomLevel;
    pinchStartCenter = getPinchCenter();
    pinchStartPan = { x: panX, y: panY };
    suppressMapClick = true;
  }
}

function handleMapPointerMove(event) {
  if (event.pointerType !== "touch" || !activeMapPointers.has(event.pointerId)) {
    return;
  }

  activeMapPointers.set(event.pointerId, {
    x: event.clientX,
    y: event.clientY
  });

  if (activeMapPointers.size < 2 || !pinchStartDistance) {
    return;
  }

  event.preventDefault();
  suppressMapClick = true;

  const nextDistance = getPinchDistance();
  if (!nextDistance) {
    return;
  }

  zoomLevel = clampZoom(pinchStartZoom * (nextDistance / pinchStartDistance));
  updatePanFromPinchCenter();
  updateMapTransform();
}

function handleMapPointerEnd(event) {
  if (event.pointerType !== "touch") {
    return;
  }

  activeMapPointers.delete(event.pointerId);

  if (mapSurface.releasePointerCapture) {
    try {
      mapSurface.releasePointerCapture(event.pointerId);
    } catch {
      // Capture may already have been released by the browser.
    }
  }

  if (activeMapPointers.size < 2) {
    pinchStartDistance = null;
    pinchStartCenter = null;
    pinchStartZoom = zoomLevel;
    pinchStartPan = { x: panX, y: panY };
    window.setTimeout(() => {
      suppressMapClick = false;
    }, 140);
  }
}

function getPinchDistance() {
  const points = Array.from(activeMapPointers.values());
  if (points.length < 2) {
    return null;
  }

  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
}

function getPinchCenter() {
  const points = Array.from(activeMapPointers.values());
  if (points.length < 2) {
    return null;
  }

  return {
    x: (points[0].x + points[1].x) / 2,
    y: (points[0].y + points[1].y) / 2
  };
}

function updatePanFromPinchCenter() {
  const nextCenter = getPinchCenter();
  if (!pinchStartCenter || !nextCenter) {
    return;
  }

  const surfaceRect = mapSurface.getBoundingClientRect();
  const svgUnitsPerPixelX = VIEW_WIDTH / surfaceRect.width;
  const svgUnitsPerPixelY = VIEW_HEIGHT / surfaceRect.height;

  panX = pinchStartPan.x + (nextCenter.x - pinchStartCenter.x) * svgUnitsPerPixelX;
  panY = pinchStartPan.y + (nextCenter.y - pinchStartCenter.y) * svgUnitsPerPixelY;
}

function clampZoom(value) {
  return Math.min(Math.max(value, MIN_ZOOM), MAX_ZOOM);
}

function updateSummary() {
  const counts = countStatuses(activeMetricKey);
  const title = selectedMunicipality || (activeMetricKey ? metrics[activeMetricKey].title : "Vestland");

  summaryTitle.textContent = title;
  summaryGood.textContent = counts.good;
  summaryMedium.textContent = counts.medium;
  summaryBad.textContent = counts.bad;
  summaryNote.textContent = activeMetricKey
    ? `Fordeling for ${metrics[activeMetricKey].title.toLowerCase()} i Vestland-kommunene.`
    : "Velg en statistikk for å se fordelingen mellom kommunene.";

}

function countStatuses(metricKey) {
  const counts = { good: 0, medium: 0, bad: 0, missing: 0 };
  if (!metricKey) {
    return counts;
  }

  municipalityOrder.forEach(name => {
    const status = getMetricEntry(name, metricKey).status;
    counts[status] += 1;
  });

  return counts;
}

function labelClass(area) {
  if (area < 220) {
    return "municipality-label municipality-label--tiny";
  }

  if (area < 560) {
    return "municipality-label municipality-label--small";
  }

  return "municipality-label";
}

function matchesSearch(name) {
  return !searchTerm || name.toLowerCase().includes(searchTerm);
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
    if (value > 5) return "bad";
    if (value >= 2.5) return "medium";
    return "good";
  }

  if (metricKey === "ufore") {
    if (!uforeBreakpoints) return "missing";
    if (value <= uforeBreakpoints.goodMax) return "good";
    if (value <= uforeBreakpoints.mediumMax) return "medium";
    return "bad";
  }

  if (metricKey === "sykefravaer") {
    if (value < 5.5) return "good";
    if (value < 6.5) return "medium";
    return "bad";
  }

  if (metricKey === "befolkningsvekst") {
    if (value > 2.5) return "good";
    if (value >= 0) return "medium";
    return "bad";
  }

  if (metricKey === "driftsresultat") {
    if (value >= 2) return "good";
    if (value >= 0) return "medium";
    return "bad";
  }

  if (metricKey === "saksbehandlingstid") {
    if (value < 400) return "good";
    if (value <= 999) return "medium";
    return "bad";
  }

  if (metricKey === "gebyrPrivatePlaner") {
    if (value <= 100000) return "good";
    if (value <= 150000) return "medium";
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

function formatMetricValue(metricKey, value, municipalityName = null) {
  if (value === null || value === undefined) {
    return "Mangler data";
  }

  const formattedValue = metrics[metricKey].format(value);
  const sourceYear = getMetricSourceYear(metricKey, municipalityName);

  if (sourceYear && sourceYear !== 2025) {
    return `${formattedValue} (${sourceYear})`;
  }

  return formattedValue;
}

function showMapTooltip(event, name) {
  if (!mapTooltip) {
    return;
  }

  mapTooltip.dataset.name = name;
  updateMapTooltipContent(name);
  mapTooltip.classList.add("is-visible");
  moveMapTooltip(event);
}

function moveMapTooltip(event) {
  if (!mapTooltip?.classList.contains("is-visible") || !mapSurface) {
    return;
  }

  const surfaceRect = mapSurface.getBoundingClientRect();
  const tooltipOffset = 14;
  const maxX = surfaceRect.width - mapTooltip.offsetWidth - 10;
  const maxY = surfaceRect.height - mapTooltip.offsetHeight - 10;
  const nextX = event.clientX - surfaceRect.left + tooltipOffset;
  const nextY = event.clientY - surfaceRect.top + tooltipOffset;
  const clampedX = Math.min(Math.max(10, nextX), Math.max(10, maxX));
  const clampedY = Math.min(Math.max(10, nextY), Math.max(10, maxY));

  mapTooltip.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
}

function hideMapTooltip() {
  if (!mapTooltip) {
    return;
  }

  mapTooltip.classList.remove("is-visible");
  delete mapTooltip.dataset.name;
}

function refreshVisibleMapTooltip() {
  if (!mapTooltip?.classList.contains("is-visible") || !mapTooltip.dataset.name) {
    return;
  }

  updateMapTooltipContent(mapTooltip.dataset.name);
}

function updateMapTooltipContent(name) {
  const tooltipLines = buildMunicipalityTooltipLines(name);
  const title = document.createElement("strong");
  const detail = document.createElement("span");

  title.textContent = tooltipLines.title;
  detail.textContent = tooltipLines.detail;
  mapTooltip.setAttribute("aria-label", `${tooltipLines.title}. ${tooltipLines.detail}`);
  mapTooltip.replaceChildren(title, detail);
}

function buildMunicipalityTooltipText(name) {
  const tooltipLines = buildMunicipalityTooltipLines(name);
  return `${tooltipLines.title}\n${tooltipLines.detail}`;
}

function buildMunicipalityTooltipLines(name) {
  if (!activeMetricKey) {
    return {
      title: name,
      detail: "Velg statistikk for tall"
    };
  }

  const metricTitle = metrics[activeMetricKey].tooltipTitle || metrics[activeMetricKey].title;
  const metricValue = formatTooltipMetricValue(activeMetricKey, getMetricEntry(name, activeMetricKey).value, name);

  return {
    title: name,
    detail: `${metricTitle} ${metricValue}`
  };
}

function formatTooltipMetricValue(metricKey, value, municipalityName = null) {
  const formattedValue = formatMetricValue(metricKey, value, municipalityName);
  return formattedValue
    .replace(" %", " prosent")
    .replace(" ‰", " promille");
}

function getMetricSourceYear(metricKey, municipalityName) {
  if (metricKey !== "saksbehandlingstid" || !municipalityName) {
    return null;
  }

  const row = window.SSB_PRIVATE_PLANER_2025?.municipalities?.[municipalityName];
  if (!row || row.saksbehandlingstid === null || row.saksbehandlingstid === undefined) {
    return null;
  }

  return row.saksbehandlingstidYear || 2025;
}

function renderStatusPill(status) {
  return `<span class="status-pill status-pill--${status}">${thresholdsText[status]}</span>`;
}

function buildThresholdText(metricKey) {
  const metric = metrics[metricKey];
  const sourceText = metric.source ? ` Kilde: ${metric.source}.` : "";
  return `Grønn: ${metric.thresholds.good}. Gul: ${metric.thresholds.medium}. Rød: ${metric.thresholds.bad}.${sourceText}`;
}

function buildMetricDescription(metricKey) {
  const metric = metrics[metricKey];
  const sourceText = metric.source ? ` Kilde: ${metric.source}.` : "";
  return `${metric.description}${sourceText}`;
}

function formatDecimal(value) {
  return new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
}

function formatWholeNumber(value) {
  return new Intl.NumberFormat("nb-NO", {
    maximumFractionDigits: 0
  }).format(value);
}

function statusToColor(status) {
  if (status === "good") return "var(--good)";
  if (status === "medium") return "var(--medium)";
  if (status === "bad") return "var(--bad)";
  return "var(--missing)";
}

function buildProjection(features) {
  const lonLatPoints = [];
  features.forEach(feature => collectCoordinates(feature.geometry.coordinates, lonLatPoints));

  const latitudes = lonLatPoints.map(point => point[1]);
  const centerLatitude = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
  const projectedPoints = lonLatPoints.map(([lon, lat]) => [projectedX(lon, centerLatitude), projectedY(lat)]);
  const xValues = projectedPoints.map(point => point[0]);
  const yValues = projectedPoints.map(point => point[1]);
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
    centerLatitude,
    minX,
    maxY,
    offsetX,
    offsetY,
    scale
  };
}

function projectedX(longitude, centerLatitude) {
  return (longitude * Math.PI / 180) * Math.cos(centerLatitude * Math.PI / 180);
}

function projectedY(latitude) {
  return latitude * Math.PI / 180;
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
    (projectedX(longitude, projection.centerLatitude) - projection.minX) * projection.scale + projection.offsetX,
    (projection.maxY - projectedY(latitude)) * projection.scale + projection.offsetY
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
