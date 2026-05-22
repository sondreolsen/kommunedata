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
const focusTitle = document.querySelector("#focus-title");
const focusMetric = document.querySelector("#focus-metric");
const focusCount = document.querySelector("#focus-count");
const focusGood = document.querySelector("#focus-good");
const focusBad = document.querySelector("#focus-bad");
const searchInput = document.querySelector("#municipality-search");
const homeButton = document.querySelector("#home-button");
const zoomInButton = document.querySelector("#zoom-in-button");
const zoomOutButton = document.querySelector("#zoom-out-button");

const municipalityOrder = [
  "Alver", "Askvoll", "Askøy", "Aurland", "Austevoll", "Austrheim", "Bergen",
  "Bjørnafjorden", "Bremanger", "Bømlo", "Eidfjord", "Etne", "Fedje", "Fitjar",
  "Fjaler", "Gloppen", "Gulen", "Hyllestad", "Høyanger", "Kinn", "Kvam",
  "Kvinnherad", "Luster", "Lærdal", "Masfjorden", "Modalen", "Osterøy",
  "Samnanger", "Sogndal", "Solund", "Stad", "Stord", "Stryn", "Sunnfjord",
  "Sveio", "Tysnes", "Ullensvang", "Ulvik", "Vaksdal", "Vik", "Voss",
  "Årdal", "Øygarden"
];

const thresholdsText = {
  good: "Grønn",
  medium: "Gul",
  bad: "Rød",
  missing: "Mangler data"
};

const metrics = {
  arbeidsledige: {
    title: "Arbeidsledige",
    description: "Andel registrerte ledige i kommunen.",
    format: value => `${value.toFixed(1).replace(".", ",")} %`,
    thresholds: {
      good: "Under 2,2 %",
      medium: "2,2 % til 3,0 %",
      bad: "Over 3,0 %"
    }
  },
  ufore: {
    title: "Uføre",
    description: "Andel uføre i kommunen.",
    format: value => `${value.toFixed(1).replace(".", ",")} %`,
    thresholds: {
      good: "Under 8,5 %",
      medium: "8,5 % til 11,0 %",
      bad: "Over 11,0 %"
    }
  },
  ungeUfore: {
    title: "Unge uføre",
    description: "Andel unge uføre i kommunen.",
    format: value => `${value.toFixed(1).replace(".", ",")} %`,
    thresholds: {
      good: "Under 2,4 %",
      medium: "2,4 % til 3,2 %",
      bad: "Over 3,2 %"
    }
  },
  saksbehandlingstid: {
    title: "Saksbehandlingstid private planer",
    description: "Antall dager for behandling av private planer.",
    format: value => `${Math.round(value)} dager`,
    thresholds: {
      good: "Under 120 dager",
      medium: "120 til 180 dager",
      bad: "Over 180 dager"
    }
  },
  sykefravaer: {
    title: "Sykefravær",
    description: "Andel sykefravær i kommunen.",
    format: value => `${value.toFixed(1).replace(".", ",")} %`,
    thresholds: {
      good: "Under 6,8 %",
      medium: "6,8 % til 8,0 %",
      bad: "Over 8,0 %"
    }
  },
  befolkningsvekst: {
    title: "Befolkningsvekst i prosent de siste tre årene",
    description: "Endring i folketall siste tre år.",
    format: value => `${value.toFixed(1).replace(".", ",")} %`,
    thresholds: {
      good: "Over 2,5 %",
      medium: "0 % til 2,5 %",
      bad: "Under 0 %"
    }
  },
  driftsresultat: {
    title: "Driftsresultat kommunen",
    description: "Netto driftsresultat i prosent.",
    format: value => `${value.toFixed(1).replace(".", ",")} %`,
    thresholds: {
      good: "Over 1,8 %",
      medium: "0 % til 1,8 %",
      bad: "Under 0 %"
    }
  },
  eiendomsskatt: {
    title: "Eiendomsskatt",
    description: "Promillesats eller tilsvarende nivå.",
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

let activeMetricKey = null;
let selectedMunicipality = null;
let searchTerm = "";
let municipalityLayer;
let boundaryLayer;
let map;
const layerByName = new Map();

const municipalityFeatures = (window.VESTLAND_GEOJSON?.features || [])
  .filter(feature => municipalityOrder.includes(feature.properties.kommunenavn))
  .sort((left, right) =>
    municipalityOrder.indexOf(left.properties.kommunenavn) -
    municipalityOrder.indexOf(right.properties.kommunenavn)
  );

renderMetricButtons();
renderTable();
initMap();
updateSummary();

resetButton.addEventListener("click", () => {
  activeMetricKey = null;
  selectedMunicipality = null;
  updateUI();
});

searchInput.addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLowerCase();
  updateMapStyles();
  zoomToSearchResult();
});

homeButton.addEventListener("click", () => fitVestlandBounds());
zoomInButton.addEventListener("click", () => map.zoomIn());
zoomOutButton.addEventListener("click", () => map.zoomOut());

function initMap() {
  if (!window.L) {
    mapTitle.textContent = "Leaflet kunne ikke lastes";
    mapNote.textContent = "Kartbiblioteket lastes fra CDN. Sjekk nettverkstilkobling og prøv igjen.";
    return;
  }

  map = L.map("vestland-map", {
    zoomControl: false,
    attributionControl: true,
    preferCanvas: true,
    minZoom: 6,
    maxZoom: 13
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 13,
    opacity: 0.38,
    attribution: "© OpenStreetMap"
  }).addTo(map);

  municipalityLayer = L.geoJSON({
    type: "FeatureCollection",
    features: municipalityFeatures
  }, {
    style: feature => municipalityStyle(feature),
    onEachFeature: bindMunicipalityFeature
  }).addTo(map);

  boundaryLayer = L.geoJSON(window.VESTLAND_BOUNDARIES, {
    interactive: false,
    style: feature => ({
      color: feature.properties.avgrensningstype === "Fylkesgrense" ? "#4a5568" : "#ffffff",
      weight: feature.properties.avgrensningstype === "Fylkesgrense" ? 2.2 : 1.1,
      opacity: feature.properties.avgrensningstype === "Fylkesgrense" ? 0.65 : 0.9,
      lineCap: "round",
      lineJoin: "round"
    })
  }).addTo(map);

  fitVestlandBounds();
}

function bindMunicipalityFeature(feature, layer) {
  const name = feature.properties.kommunenavn;
  layerByName.set(name, layer);

  layer.bindTooltip(name, {
    permanent: true,
    direction: "center",
    className: "municipality-tooltip"
  });

  layer.bindPopup(() => renderPopupContent(name), {
    className: "municipality-popup",
    maxWidth: 280
  });

  layer.on("click", () => {
    selectedMunicipality = name;
    updateSummary();
    updateMapStyles();
  });

  layer.on("mouseover", () => {
    layer.setStyle({ weight: 2.4, opacity: 1 });
    layer.bringToFront();
    boundaryLayer.bringToFront();
  });

  layer.on("mouseout", () => {
    updateMapStyles();
  });
}

function fitVestlandBounds() {
  if (!municipalityLayer) {
    return;
  }

  map.fitBounds(municipalityLayer.getBounds(), {
    paddingTopLeft: [24, 110],
    paddingBottomRight: [24, 24],
    animate: false
  });
}

function zoomToSearchResult() {
  if (!searchTerm) {
    return;
  }

  const match = municipalityOrder.find(name => name.toLowerCase().includes(searchTerm));
  const layer = match ? layerByName.get(match) : null;
  if (layer) {
    map.fitBounds(layer.getBounds(), { padding: [120, 120], maxZoom: 10 });
  }
}

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
    : "Kartet viser Vestland kommune for kommune. Velg statistikk for fargelegging.";
  tableTitle.textContent = activeMetricKey ? metrics[activeMetricKey].title : "Ingen statistikk valgt";
  tableNote.textContent = activeMetricKey
    ? `${metrics[activeMetricKey].description} Visningen kan senere kobles direkte mot lenker og definerte terskler.`
    : "Eksempeldata brukes i denne første versjonen.";

  updateButtonState();
  updateMapStyles();
  renderTable();
  updateSummary();
}

function updateButtonState() {
  metricList.querySelectorAll(".metric-button").forEach(button => {
    button.classList.toggle("is-active", button.dataset.metric === activeMetricKey);
  });
}

function updateMapStyles() {
  if (!municipalityLayer) {
    return;
  }

  municipalityLayer.eachLayer(layer => {
    layer.setStyle(municipalityStyle(layer.feature));
  });

  boundaryLayer?.bringToFront();
}

function municipalityStyle(feature) {
  const name = feature.properties.kommunenavn;
  const metricData = activeMetricKey ? getMetricEntry(name, activeMetricKey) : null;
  const isMatch = matchesSearch(name);
  const isSelected = selectedMunicipality === name;

  return {
    fillColor: metricData ? statusToColor(metricData.status) : "#dfe8f4",
    color: isSelected ? "#1f2f46" : "#ffffff",
    weight: isSelected ? 2.4 : 0.9,
    opacity: isMatch ? 1 : 0.28,
    fillOpacity: isMatch ? 0.72 : 0.18
  };
}

function matchesSearch(name) {
  if (!searchTerm) {
    return true;
  }

  return name.toLowerCase().includes(searchTerm);
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

  focusTitle.textContent = selectedMunicipality || "Vestland";
  focusMetric.textContent = activeMetricKey ? metrics[activeMetricKey].title : "Ingen valgt";
  focusCount.textContent = municipalityOrder.length;
  focusGood.textContent = counts.good;
  focusBad.textContent = counts.bad;
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

function renderPopupContent(name) {
  const metricData = activeMetricKey ? getMetricEntry(name, activeMetricKey) : null;
  const value = metricData ? formatMetricValue(activeMetricKey, metricData.value) : "Velg statistikk";
  const status = metricData ? thresholdsText[metricData.status] : "Ingen valgt";

  return `
    <div class="popup-card">
      <strong>${name} kommune</strong>
      <dl>
        <div>
          <dt>Statistikk</dt>
          <dd>${activeMetricKey ? metrics[activeMetricKey].title : "Ingen valgt"}</dd>
        </div>
        <div>
          <dt>Verdi</dt>
          <dd>${value}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>${status}</dd>
        </div>
      </dl>
    </div>
  `;
}
