const state = {
  bombSiteFlows: {},
  maps: [],
  query: "",
  selectedBombSiteId: null,
  selectedMapId: null,
  selectedSide: null,
  selectedGroupSize: 5,
  selectedTacticId: null,
  bannedOperatorNames: [],
  banMode: false,
  selectedOperators: [],
  operatorSheets: {},
  tactics: [],
  setupOperator: null,
  setupMapId: null,
  setupBombSiteId: null,
  setupVideo: null,
  brokenAngleVideos: [],
  brokenAngleVideoId: null,
};

const elements = {
  backToMaps: document.querySelector("#back-to-maps"),
  backToSides: document.querySelector("#back-to-sides"),
  body: document.body,
  bombList: document.querySelector("#bomb-site-list"),
  bombSection: document.querySelector("#bomb-site"),
  bombSideContext: document.querySelector("#bomb-side-context"),
  bombStatus: document.querySelector("#bomb-selection-status"),
  bombTitle: document.querySelector("#bomb-site-title"),
  tacticsSection: document.querySelector("#taticas"),
  tacticsList: document.querySelector("#tactics-list"),
  tacticsEmpty: document.querySelector("#tactics-empty"),
  tacticsStatus: document.querySelector("#tactics-status"),
  tacticDetailSection: document.querySelector("#detalhe-tatica"),
  operatorSection: document.querySelector("#operadores"),
  operatorGrid: document.querySelector("#operator-grid"),
  operatorStatus: document.querySelector("#operators-status"),
  clearSearch: document.querySelector("#clear-search"),
  emptyState: document.querySelector("#empty-state"),
  grid: document.querySelector("#maps-grid"),
  hero: document.querySelector("#inicio"),
  heroMapTotal: document.querySelector("#hero-map-total"),
  mapsSection: document.querySelector("#mapas"),
  setupsSection: document.querySelector("#setups"),
  setupDefenders: document.querySelector("#setup-defenders"),
  setupMaps: document.querySelector("#setup-maps"),
  setupBombs: document.querySelector("#setup-bombs"),
  setupVideos: document.querySelector("#setup-videos"),
  brokenAngleList: document.querySelector("#broken-angle-list"),
  brokenAnglePlayer: document.querySelector("#broken-angle-player"),
  search: document.querySelector("#map-search"),
  skipLink: document.querySelector(".skip-link"),
  sideMapCode: document.querySelector("#side-map-code"),
  sideMapName: document.querySelector("#side-map-name"),
  sideOptions: [...document.querySelectorAll("[data-side]")],
  sideSection: document.querySelector("#lado"),
  sideStatus: document.querySelector("#side-selection-status"),
  status: document.querySelector("#maps-status"),
};

let bombSiteFlowsReady;
let operatorsReady;
let tacticsReady;
let mapsReady;
let brokenAngleReady;
let operatorViewVersion = 0;

const sideLabels = {
  attack: "Ataque",
  defense: "Defesa",
};

const defaultDocumentTitle = document.title;
const fullSquadLabel = "Squad full";

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function getSetupCatalog() {
  const entries = [];
  const seen = new Set();

  state.tactics.filter((tactic) => tactic.side === "defense").forEach((tactic) => {
    Object.entries(tactic.operatorVideos || {}).forEach(([operator, videos]) => {
      const options = (Array.isArray(videos) ? videos : [videos]).map((option) => typeof option === "string" ? { video: option, title: operator } : option);
      options.forEach((option, index) => tactic.bombSiteIds.filter((siteId) => siteId !== "*").forEach((bombSiteId) => {
        const key = [operator, tactic.mapId, bombSiteId, option.video].join("|");
        if (seen.has(key)) return;
        seen.add(key);
        const map = state.maps.find((item) => item.id === tactic.mapId);
        const site = state.bombSiteFlows[tactic.mapId]?.sites.find((item) => item.id === bombSiteId);
        entries.push({ operator, mapId: tactic.mapId, mapName: map?.name || tactic.mapId, bombSiteId, bombSiteName: site?.name || bombSiteId, bombSiteImage: site?.image || map?.image || "", bombSiteImageAlt: site?.imageAlt || site?.name || bombSiteId, tacticName: tactic.name, video: option.video, videoTitle: option.title || `Setup ${index + 1}` });
      }));
    });
  });

  return entries;
}

function createSetupOption(label, meta, selected, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "setup-option";
  button.setAttribute("aria-pressed", String(selected));
  const title = document.createElement("strong");
  title.textContent = label;
  const detail = document.createElement("span");
  detail.textContent = meta;
  button.append(title, detail);
  button.addEventListener("click", onClick);
  return button;
}

function renderSetupOperators() {
  const catalog = getSetupCatalog();
  const operatorStage = document.querySelector("#setup-operator-stage");
  const bombStage = document.querySelector("#setup-bomb-stage");
  const videoStage = document.querySelector("#setup-video-stage");
  operatorStage.hidden = !state.setupBombSiteId;
  bombStage.hidden = Boolean(state.setupBombSiteId);
  videoStage.hidden = true;
  if (!state.setupBombSiteId) return;

  const entries = catalog.filter((entry) => entry.mapId === state.setupMapId && entry.bombSiteId === state.setupBombSiteId);
  const availableOperators = new Set(entries.map((entry) => entry.operator));
  document.querySelector("#setup-selected-bomb").textContent = entries[0]?.bombSiteName || state.setupBombSiteId;

  [["defense", elements.setupDefenders]].forEach(([side, grid]) => {
    const sheet = state.operatorSheets[side];
    if (!sheet) return;
    grid.style.setProperty("--portrait-sheet", `url("${new URL(sheet.image, document.baseURI).href}")`);
    grid.style.setProperty("--portrait-size", (sheet.width / 110 * 100) + "% " + (sheet.height / 184 * 100) + "%");
    const cards = [];
    sheet.rows.forEach((names, row) => names.forEach((operator, column) => {
      const available = availableOperators.has(operator);
      if (!available) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "setup-operator-card";
      button.setAttribute("aria-pressed", String(state.setupOperator === operator));
      button.setAttribute("aria-label", `Selecionar ${operator}`);
      button.title = operator;
      button.style.setProperty("--portrait-x", ((sheet.x[row] + column * 120) / (sheet.width - 110) * 100) + "%");
      button.style.setProperty("--portrait-y", (sheet.y[row] / (sheet.height - 184) * 100) + "%");
      const portrait = document.createElement("span");
      portrait.className = "operator-portrait";
      portrait.setAttribute("aria-hidden", "true");
      const name = document.createElement("strong");
      name.textContent = operator;
      button.append(portrait, name);
      button.addEventListener("click", () => {
        state.setupOperator = operator;
        state.setupVideo = null;
        renderSetupVideos();
      });
      cards.push(button);
    }));
    grid.replaceChildren(...cards);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#setup-operator-title").focus({ preventScroll: true });
}

function renderSetupMaps() {
  const catalog = getSetupCatalog();
  document.querySelector("#setups-video-total").textContent = String(new Set(catalog.map((entry) => entry.video)).size).padStart(2, "0");
  const entries = catalog;
  const maps = [...new Map(entries.map((entry) => [entry.mapId, state.maps.find((map) => map.id === entry.mapId)])).values()].filter(Boolean);
  elements.setupMaps.replaceChildren(...maps.map((map) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "setup-map-card";
    button.setAttribute("aria-pressed", String(state.setupMapId === map.id));
    const image = document.createElement("img");
    image.src = map.image;
    image.alt = "";
    image.decoding = "async";
    const overlay = document.createElement("span");
    overlay.className = "setup-map-card__overlay";
    const label = document.createElement("small");
    label.textContent = "Selecionar mapa";
    const name = document.createElement("strong");
    name.textContent = map.name;
    overlay.append(label, name);
    button.append(image, overlay);
    button.addEventListener("click", () => {
      state.setupMapId = map.id;
      state.setupBombSiteId = null;
      state.setupVideo = null;
      renderSetupBombs();
    });
    return button;
  }));
}

function showSetupMaps() {
  state.setupMapId = null;
  state.setupBombSiteId = null;
  state.setupOperator = null;
  state.setupVideo = null;
  document.querySelector("#setup-bomb-stage").hidden = true;
  document.querySelector("#setup-operator-stage").hidden = true;
  document.querySelector("#setup-video-stage").hidden = true;
  document.querySelector("#setup-broken-angle-stage").hidden = true;
  document.querySelector("#setup-map-view").hidden = false;
  renderSetupMaps();
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#setups-title").focus({ preventScroll: true });
}

function showSetupBombSites() {
  state.setupBombSiteId = null;
  state.setupOperator = null;
  state.setupVideo = null;
  elements.setupVideos.querySelectorAll("video").forEach((video) => {
    video.pause();
  });
  document.querySelector("#setup-operator-stage").hidden = true;
  document.querySelector("#setup-video-stage").hidden = true;
  renderSetupBombs();
}

function showSetupOperators() {
  state.setupOperator = null;
  state.setupVideo = null;
  elements.setupVideos.querySelectorAll("video").forEach((video) => {
    video.pause();
  });
  renderSetupOperators();
}

function renderSetupBombs() {
  const mapView = document.querySelector("#setup-map-view");
  const stage = document.querySelector("#setup-bomb-stage");
  const operatorStage = document.querySelector("#setup-operator-stage");
  const videoStage = document.querySelector("#setup-video-stage");
  stage.hidden = !state.setupMapId;
  mapView.hidden = Boolean(state.setupMapId);
  operatorStage.hidden = true;
  videoStage.hidden = true;
  if (!state.setupMapId) return;
  const selectedMap = state.maps.find((map) => map.id === state.setupMapId);
  document.querySelector("#setup-selected-map").textContent = selectedMap?.name || state.setupMapId;
  const entries = getSetupCatalog().filter((entry) => entry.mapId === state.setupMapId);
  const bombs = [...new Map(entries.map((entry) => [entry.bombSiteId, entry])).values()];
  elements.setupBombs.replaceChildren(...bombs.map((bomb) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "setup-bomb-card";
    button.setAttribute("aria-pressed", String(state.setupBombSiteId === bomb.bombSiteId));
    const image = document.createElement("img");
    image.src = bomb.bombSiteImage;
    image.alt = bomb.bombSiteImageAlt;
    image.decoding = "async";
    const overlay = document.createElement("span");
    overlay.className = "setup-bomb-card__overlay";
    const label = document.createElement("small");
    label.textContent = "Selecionar bombsite";
    const name = document.createElement("strong");
    name.textContent = bomb.bombSiteName;
    overlay.append(label, name);
    button.append(image, overlay);
    button.addEventListener("click", () => {
      state.setupBombSiteId = bomb.bombSiteId;
      state.setupOperator = null;
      state.setupVideo = null;
      renderSetupOperators();
    });
    return button;
  }));
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#setup-bomb-title").focus({ preventScroll: true });
}

function renderSetupVideos() {
  const stage = document.querySelector("#setup-video-stage");
  const operatorStage = document.querySelector("#setup-operator-stage");
  const entries = getSetupCatalog().filter((entry) => entry.operator === state.setupOperator && entry.mapId === state.setupMapId && entry.bombSiteId === state.setupBombSiteId);
  stage.hidden = entries.length === 0;
  if (!entries.length) return;
  operatorStage.hidden = true;
  document.querySelector("#setup-video-context").textContent = `${state.setupOperator} · ${entries[0].mapName} · ${entries[0].bombSiteName}`;
  const selectedEntry = entries.find((entry) => entry.video === state.setupVideo);

  if (entries.length > 1 && !selectedEntry) {
    document.querySelector("#setup-video-title").textContent = "Escolha o setup";
    elements.setupVideos.replaceChildren(...entries.map((entry, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "setup-video-option";
      const number = document.createElement("span");
      number.className = "setup-video-option__number";
      number.textContent = String(index + 1).padStart(2, "0");
      const title = document.createElement("strong");
      title.textContent = entry.videoTitle || `Setup ${index + 1}`;
      const description = document.createElement("span");
      description.textContent = "Selecionar e assistir";
      button.append(number, title, description);
      button.addEventListener("click", () => {
        state.setupVideo = entry.video;
        renderSetupVideos();
      });
      return button;
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector("#setup-video-title").focus({ preventScroll: true });
    return;
  }

  const entry = selectedEntry || entries[0];
  document.querySelector("#setup-video-title").textContent = entry.videoTitle || "Assistir setup";
  const content = [];
  if (entries.length > 1) {
    const backToOptions = document.createElement("button");
    backToOptions.type = "button";
    backToOptions.className = "side-selection__back setup-video__back";
    backToOptions.textContent = "← Voltar às opções";
    backToOptions.addEventListener("click", () => {
      elements.setupVideos.querySelector("video")?.pause();
      state.setupVideo = null;
      renderSetupVideos();
    });
    content.push(backToOptions);
  }

  const article = (() => {
    const article = document.createElement("article");
    article.className = "setup-video";
    const video = document.createElement("video");
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.defaultMuted = true;
    video.preload = "auto";
    video.src = entry.video;
    video.setAttribute("playsinline", "");
    video.addEventListener("canplay", () => {
      video.play().catch(() => {});
    }, { once: true });
    const caption = document.createElement("div");
    caption.className = "setup-video__caption";
    const title = document.createElement("strong");
    title.textContent = entry.videoTitle || entry.operator;
    const tactic = document.createElement("span");
    tactic.textContent = entry.tacticName;
    const speedControl = document.createElement("div");
    speedControl.className = "setup-video__speed";
    const speedLabel = document.createElement("span");
    speedLabel.textContent = "Velocidade";
    const speedButtons = document.createElement("span");
    speedButtons.className = "setup-video__speed-buttons";
    [0.5, 1, 1.25, 1.5, 2].forEach((rate) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${String(rate).replace(".", ",")}×`;
      button.setAttribute("aria-label", `Reproduzir em ${button.textContent}`);
      button.setAttribute("aria-pressed", String(rate === 1));
      button.addEventListener("click", () => {
        video.playbackRate = rate;
        speedButtons.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      });
      speedButtons.append(button);
    });
    speedControl.append(speedLabel, speedButtons);
    const details = document.createElement("span");
    details.className = "setup-video__details";
    details.append(title, tactic);
    caption.append(details, speedControl);
    article.append(video, caption);
    return article;
  })();
  content.push(article);
  elements.setupVideos.replaceChildren(...content);
  elements.setupVideos.querySelector("video")?.play().catch(() => {});
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#setup-video-title").focus({ preventScroll: true });
}

function showSetupVideoOptions() {
  elements.setupVideos.querySelector("video")?.pause();
  state.setupVideo = null;
  renderSetupVideos();
}

function renderBrokenAnglePlaylist() {
  const videos = state.brokenAngleVideos;
  document.querySelector("#broken-angle-total").textContent = String(videos.length).padStart(2, "0");
  if (!videos.length) {
    elements.brokenAngleList.replaceChildren();
    elements.brokenAnglePlayer.textContent = "Nenhum vídeo cadastrado.";
    return;
  }

  if (!videos.some((item) => item.id === state.brokenAngleVideoId)) {
    state.brokenAngleVideoId = videos[0].id;
  }
  const selected = videos.find((item) => item.id === state.brokenAngleVideoId);
  elements.brokenAngleList.replaceChildren(...videos.map((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "setup-video-option";
    button.setAttribute("aria-pressed", String(item.id === selected.id));
    const number = document.createElement("span");
    number.className = "setup-video-option__number";
    number.textContent = String(index + 1).padStart(2, "0");
    const title = document.createElement("strong");
    title.textContent = item.title;
    const description = document.createElement("span");
    description.textContent = item.description;
    button.append(number, title, description);
    button.addEventListener("click", () => {
      elements.brokenAnglePlayer.querySelector("video")?.pause();
      state.brokenAngleVideoId = item.id;
      renderBrokenAnglePlaylist();
    });
    return button;
  }));

  const article = document.createElement("article");
  article.className = "setup-video broken-angle-video";
  const video = document.createElement("video");
  video.controls = true;
  video.preload = "metadata";
  video.src = selected.video;
  video.setAttribute("playsinline", "");
  const caption = document.createElement("div");
  caption.className = "setup-video__caption";
  const details = document.createElement("span");
  details.className = "setup-video__details";
  const title = document.createElement("strong");
  title.textContent = selected.title;
  const description = document.createElement("span");
  description.textContent = selected.description;
  details.append(title, description);
  caption.append(details);
  article.append(video, caption);
  elements.brokenAnglePlayer.replaceChildren(article);
}

async function openBrokenAnglePlaylist() {
  await brokenAngleReady;
  [elements.hero, elements.mapsSection, elements.sideSection, elements.bombSection, elements.tacticsSection, elements.tacticDetailSection, elements.operatorSection].forEach((section) => { section.hidden = true; });
  elements.body.classList.remove("is-bomb-view");
  elements.setupsSection.hidden = false;
  document.querySelector("#setup-map-view").hidden = true;
  document.querySelector("#setup-bomb-stage").hidden = true;
  document.querySelector("#setup-operator-stage").hidden = true;
  document.querySelector("#setup-video-stage").hidden = true;
  document.querySelector("#setup-broken-angle-stage").hidden = false;
  elements.skipLink.href = "#setup-broken-angle-stage";
  elements.skipLink.textContent = "Ir para Broken Angle";
  document.title = "Broken Angle | R6 Hub";
  renderBrokenAnglePlaylist();
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#broken-angle-title").focus({ preventScroll: true });
}

function closeBrokenAnglePlaylist() {
  elements.brokenAnglePlayer.querySelector("video")?.pause();
  document.querySelector("#setup-broken-angle-stage").hidden = true;
  showMapSelection();
}

async function openSetups() {
  await Promise.all([mapsReady, tacticsReady, bombSiteFlowsReady, operatorsReady, brokenAngleReady]);
  [elements.hero, elements.mapsSection, elements.sideSection, elements.bombSection, elements.tacticsSection, elements.tacticDetailSection, elements.operatorSection].forEach((section) => { section.hidden = true; });
  elements.body.classList.remove("is-bomb-view");
  elements.setupsSection.hidden = false;
  state.setupOperator = null;
  state.setupMapId = null;
  state.setupBombSiteId = null;
  state.setupVideo = null;
  renderSetupMaps();
  document.querySelector("#setup-bomb-stage").hidden = true;
  document.querySelector("#setup-operator-stage").hidden = true;
  document.querySelector("#setup-video-stage").hidden = true;
  elements.skipLink.href = "#setups";
  elements.skipLink.textContent = "Ir para os setups";
  document.title = "Setups de operadores | R6 Hub";
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#setups-title").focus({ preventScroll: true });
}

function getVisibleMaps() {
  const normalizedQuery = normalizeText(state.query);

  if (!normalizedQuery) {
    return state.maps;
  }

  return state.maps.filter((map) => normalizeText(map.name).includes(normalizedQuery));
}

function createMapCard(map, index) {
  const isSelected = state.selectedMapId === map.id;
  const card = document.createElement("button");
  card.className = `map-card${isSelected ? " is-selected" : ""}`;
  card.type = "button";
  card.dataset.mapId = map.id;
  card.setAttribute("aria-label", `${isSelected ? "Mapa selecionado" : "Selecionar mapa"}: ${map.name}`);
  card.setAttribute("aria-pressed", String(isSelected));

  const image = document.createElement("img");
  image.className = "map-card__image";
  image.src = map.image;
  image.alt = "";
  image.decoding = "async";
  image.loading = "eager";
  if (index < 3) {
    image.fetchPriority = "high";
  }

  const top = document.createElement("span");
  top.className = "map-card__top";

  const tag = document.createElement("span");
  tag.className = "map-card__tag";
  tag.textContent = map.mode;

  const number = document.createElement("span");
  number.className = "map-card__number";
  number.textContent = String(map.order).padStart(2, "0");

  const content = document.createElement("span");
  content.className = "map-card__content";

  const title = document.createElement("h3");
  title.textContent = map.name;

  const action = document.createElement("span");
  action.className = "map-card__action";

  const actionText = document.createElement("span");
  actionText.textContent = isSelected ? "Mapa selecionado" : "Selecionar mapa";

  const arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  arrow.setAttribute("viewBox", "0 0 20 20");
  arrow.setAttribute("aria-hidden", "true");
  const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  arrowPath.setAttribute("d", isSelected ? "m4 10 4 4 8-8" : "M4 10h12m-5-5 5 5-5 5");
  arrow.append(arrowPath);

  top.append(tag, number);
  action.append(actionText, arrow);
  content.append(title, action);
  card.append(image, top, content);

  card.addEventListener("click", () => selectMap(map.id));
  return card;
}

function renderMaps() {
  const visibleMaps = getVisibleMaps();
  const fragment = document.createDocumentFragment();

  visibleMaps.forEach((map, index) => fragment.append(createMapCard(map, index)));
  elements.grid.replaceChildren(fragment);
  elements.grid.setAttribute("aria-busy", "false");
  elements.emptyState.hidden = visibleMaps.length > 0;
  elements.grid.hidden = visibleMaps.length === 0;

  if (state.query) {
    const resultLabel = visibleMaps.length === 1 ? "1 mapa encontrado" : `${visibleMaps.length} mapas encontrados`;
    elements.status.textContent = `${resultLabel} para “${state.query}”`;
    return;
  }

  elements.status.textContent = `${visibleMaps.length} mapas na seleção`;
}

function selectMap(mapId) {
  state.selectedMapId = mapId;
  state.selectedBombSiteId = null;
  state.selectedSide = null;
  state.selectedGroupSize = 5;
  state.selectedOperators = [];
  renderMaps();

  const selectedMap = state.maps.find((map) => map.id === state.selectedMapId);
  if (!selectedMap) {
    return;
  }

  elements.sideMapName.textContent = selectedMap.name;
  elements.sideMapCode.textContent = `R6H / MAPA ${String(selectedMap.order).padStart(2, "0")}`;
  elements.sideStatus.textContent = "Escolha ataque ou defesa para continuar.";
  elements.sideOptions.forEach((option) => {
    option.classList.remove("is-selected");
    option.setAttribute("aria-pressed", "false");
  });

  elements.hero.hidden = true;
  elements.mapsSection.hidden = true;
  elements.sideSection.hidden = false;
  elements.skipLink.href = "#lado";
  elements.skipLink.textContent = "Ir para a escolha do lado";
  document.title = `${selectedMap.name} — Escolha o lado | R6 Hub`;

  window.scrollTo({ top: 0, behavior: "smooth" });
  window.setTimeout(() => elements.sideOptions[0]?.focus({ preventScroll: true }), 220);
}

async function selectSide(side) {
  if (!sideLabels[side]) {
    return;
  }

  if (state.selectedSide !== side) {
    state.selectedOperators = [];
  }
  state.selectedSide = side;
  state.selectedGroupSize = 5;
  state.selectedBombSiteId = null;
  const selectedMap = state.maps.find((map) => map.id === state.selectedMapId);

  elements.sideOptions.forEach((option) => {
    const isSelected = option.dataset.side === side;
    option.classList.toggle("is-selected", isSelected);
    option.setAttribute("aria-pressed", String(isSelected));

    const action = option.querySelector(".side-option__action");
    if (action) {
      const label = sideLabels[option.dataset.side].toLocaleLowerCase("pt-BR");
      action.firstChild.textContent = isSelected ? `${sideLabels[side]} selecionado ` : `Selecionar ${label} `;
      action.querySelector("path")?.setAttribute("d", isSelected ? "m4 10 4 4 8-8" : "M4 10h12m-5-5 5 5-5 5");
    }
  });

  elements.sideStatus.textContent = `${sideLabels[side]} selecionado para ${selectedMap.name}. Carregando bomb sites…`;
  const mapId = state.selectedMapId;
  await bombSiteFlowsReady;
  if (state.selectedMapId !== mapId || state.selectedSide !== side) return;
  const flow = state.bombSiteFlows[mapId];
  if (!flow) {
    elements.sideStatus.textContent = `Os bomb sites de ${selectedMap.name} serão adicionados em uma próxima etapa.`;
    return;
  }
  openBombSiteSelection(selectedMap, flow);
}

function openBombSiteSelection(selectedMap, flow) {
  elements.operatorSection.hidden = true;
  elements.bombTitle.textContent = "Escolha o bomb site";
  document.querySelector("#bomb-map-name").textContent = selectedMap.name;
  document.querySelector("#site-map-image").src = selectedMap.image;
  elements.bombSideContext.textContent = sideLabels[state.selectedSide] + " / " + fullSquadLabel;
  elements.bombStatus.textContent = "Escolha um local de bomba para selecionar os operadores.";
  const floorLabels = { "B": "Subsolo", "1F": "Térreo", "2F": "1º andar", "3F": "2º andar", "1F / B": "Térreo / Subsolo" };
  elements.bombList.replaceChildren(...flow.sites.map((site, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "site-card";
    button.dataset.bombSiteId = site.id;
    button.setAttribute("aria-pressed", String(state.selectedBombSiteId === site.id));
    const floor = document.createElement("span");
    floor.className = "site-card__floor";
    floor.textContent = (floorLabels[site.floor] || site.floor) + " · " + site.floor;
    const badge = document.createElement("span");
    badge.className = "site-card__badge";
    badge.textContent = "A + B";
    badge.setAttribute("aria-hidden", "true");
    const name = document.createElement("strong");
    name.textContent = site.name;
    const callout = document.createElement("span");
    callout.className = "site-card__callout";
    callout.textContent = site.callout;
    const action = document.createElement("span");
    action.className = "site-card__action";
    action.textContent = "Selecionar bomb site ↗";
    if (site.image) {
      const media = document.createElement("span");
      media.className = "site-card__media";
      const image = document.createElement("img");
      image.src = site.image;
      image.alt = site.imageAlt || site.name;
      image.decoding = "async";
      image.addEventListener("error", () => {
        media.remove();
        button.classList.remove("site-card--pictured");
      }, {once:true});
      const caption = document.createElement("span");
      caption.className = "site-card__scene";
      caption.textContent = site.imageRoom || site.name;
      media.append(image, caption);
      button.classList.add("site-card--pictured");
      button.append(media);
    }
    button.append(floor, badge, name, callout, action);
    button.addEventListener("click", () => selectBombSite(site.id));
    return button;
  }));
  const imageCredit = document.querySelector("#site-image-credit");
  const sources = new Map();
  if (flow.imageSource) sources.set(flow.imageSource, flow.imageCredit);
  flow.sites.forEach((site) => {
    if (site.imageSource) sources.set(site.imageSource, site.imageCredit);
  });
  imageCredit.hidden = sources.size === 0;
  imageCredit.replaceChildren(...[...sources].map(([url, credit]) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Captura: " + credit;
    return link;
  }));
  elements.sideSection.hidden = true;
  elements.bombSection.hidden = false;
  elements.body.classList.remove("is-bomb-view");
  elements.skipLink.href = "#bomb-site";
  elements.skipLink.textContent = "Ir para a escolha do bomb site";
  document.title = selectedMap.name + " — Escolha o bomb site | R6 Hub";
  window.scrollTo({ top: 0, behavior: "smooth" });
  elements.bombTitle.focus({ preventScroll: true });
}

function selectBombSite(bombSiteId) {
  const site = state.bombSiteFlows[state.selectedMapId]?.sites.find((site) => site.id === bombSiteId);
  if (!site) return;
  if (state.selectedBombSiteId !== bombSiteId) state.selectedOperators = [];
  state.selectedBombSiteId = bombSiteId;
  state.selectedTacticId = null;
  state.bannedOperatorNames = [];
  state.banMode = false;
  showTacticSelection();
}

async function showTacticSelection() {
  await Promise.all([tacticsReady, operatorsReady]);
  const map = state.maps.find((item) => item.id === state.selectedMapId);
  const site = state.bombSiteFlows[state.selectedMapId]?.sites.find((item) => item.id === state.selectedBombSiteId);
  if (!map || !site) return;
  elements.bombSection.hidden = true;
  elements.operatorSection.hidden = true;
  elements.tacticDetailSection.hidden = true;
  elements.tacticsSection.hidden = false;
  document.querySelector("#tactics-map-name").textContent = map.name;
  document.querySelector("#tactics-context").textContent = sideLabels[state.selectedSide] + " / " + fullSquadLabel;
  document.querySelector("#tactics-site").textContent = "Bombsite · " + site.name;
  const available = state.tactics.filter((tactic) => tactic.mapId === state.selectedMapId
    && tactic.side === state.selectedSide
    && tactic.groupSize === state.selectedGroupSize
    && tactic.operators.length === tactic.groupSize
    && (tactic.bombSiteIds.includes("*") || tactic.bombSiteIds.includes(state.selectedBombSiteId)));
  elements.tacticsList.replaceChildren(...available.map((tactic, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tactic-card";
    button.dataset.tacticId = tactic.id;
    const number = document.createElement("span");
    number.className = "tactic-card__number";
    number.textContent = `TÁTICA ${String(index + 1).padStart(2, "0")}`;
    const title = document.createElement("strong");
    title.className = "tactic-card__title";
    title.textContent = tactic.name;
    const meta = document.createElement("span");
    meta.className = "tactic-card__meta";
    meta.textContent = `${sideLabels[tactic.side]} · ${tactic.groupSize} jogadores`;
    const lineup = document.createElement("span");
    lineup.className = "tactic-card__lineup";
    lineup.setAttribute("aria-label", "Composição: " + tactic.operators.map((operator) => operator.name).join(", "));
    const sheet = state.operatorSheets[tactic.side];
    if (sheet) {
      lineup.style.setProperty("--portrait-sheet", `url("${new URL(sheet.image, document.baseURI).href}")`);
      lineup.style.setProperty("--portrait-size", (sheet.width / 110 * 100) + "% " + (sheet.height / 184 * 100) + "%");
    }
    tactic.operators.forEach((operator) => {
      const item = document.createElement("span");
      item.className = "tactic-card__operator";
      const portrait = document.createElement("span");
      portrait.className = "operator-portrait";
      portrait.setAttribute("aria-hidden", "true");
      const position = sheet?.rows.flatMap((names, row) => names.map((name, column) => ({ name, row, column }))).find((entry) => entry.name === operator.name);
      if (sheet && position) {
        item.style.setProperty("--portrait-x", ((sheet.x[position.row] + position.column * 120) / (sheet.width - 110) * 100) + "%");
        item.style.setProperty("--portrait-y", (sheet.y[position.row] / (sheet.height - 184) * 100) + "%");
      }
      const name = document.createElement("span");
      name.className = "tactic-card__operator-name";
      name.textContent = operator.name;
      item.append(portrait, name);
      lineup.append(item);
    });
    const action = document.createElement("span");
    action.className = "tactic-card__action";
    action.append("Abrir plano ");
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    action.append(arrow);
    button.append(number, title, meta, lineup, action);
    button.addEventListener("click", () => showTacticDetail(tactic.id));
    return button;
  }));
  elements.tacticsEmpty.hidden = available.length > 0;
  elements.tacticsStatus.textContent = available.length === 1 ? "1 tática disponível para este contexto." : available.length + " táticas disponíveis para este contexto.";
  elements.skipLink.href = "#taticas";
  elements.skipLink.textContent = "Ir para a escolha da tática";
  document.title = map.name + " — Escolha a tática | R6 Hub";
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#tactics-title").focus({ preventScroll: true });
}

async function showTacticDetail(tacticId) {
  const tactic = state.tactics.find((item) => item.id === tacticId);
  const map = state.maps.find((item) => item.id === state.selectedMapId);
  const site = state.bombSiteFlows[state.selectedMapId]?.sites.find((item) => item.id === state.selectedBombSiteId);
  if (!tactic || !map || !site) return;
  state.selectedTacticId = tacticId;
  elements.tacticsSection.hidden = true;
  elements.tacticDetailSection.hidden = false;
  document.querySelector("#tactic-detail-title").textContent = tactic.name;
  document.querySelector("#tactic-detail-map").textContent = map.name;
  document.querySelector("#tactic-detail-context").textContent = sideLabels[state.selectedSide] + " / " + fullSquadLabel;
  document.querySelector("#tactic-detail-site").textContent = "Bombsite · " + site.name;
  document.querySelector("#tactic-operator-count").textContent = tactic.operators.length + " operadores";
  const description = document.querySelector("#tactic-description");
  const descriptionText = tactic.description || tactic.defenseDescription || "";
  description.hidden = !descriptionText;
  description.dataset.sideLabel = tactic.side === "attack" ? "ATAQUE" : "DEFESA";
  document.querySelector("#tactic-description-title").textContent = tactic.side === "attack" ? "Descrição do ataque" : "Descrição da defesa";
  document.querySelector("#tactic-description-text").textContent = descriptionText;
  renderTacticOverview(tactic);
  await operatorsReady;
  renderTacticLineup(tactic);
  updateBanInterface(tactic);
  elements.skipLink.href = "#detalhe-tatica";
  elements.skipLink.textContent = "Ir para os detalhes da tática";
  document.title = tactic.name + " — Plano tático | R6 Hub";
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelector("#tactic-detail-title").focus({ preventScroll: true });
}

function getDisplayedTacticOperators(tactic) {
  return tactic.operators.map((operator) => {
    let currentName = operator.name;
    const replacementChain = [];
    while (state.bannedOperatorNames.includes(currentName) && tactic.banReplacements?.[currentName]) {
      replacementChain.push(currentName);
      currentName = tactic.banReplacements[currentName];
    }
    return currentName === operator.name
      ? operator
      : { name: currentName, assignment: operator.assignment, replacementFor: replacementChain.at(-1) };
  });
}

function renderTacticOverview(tactic) {
  const overview = document.querySelector("#tactic-overview");
  const overviewImage = document.querySelector("#tactic-overview-image");
  const lineup = getDisplayedTacticOperators(tactic).map((operator) => operator.name).sort().join("|");
  const variant = tactic.overviewVariants?.find((item) => [...item.operators].sort().join("|") === lineup);
  const image = variant?.image || tactic.overviewImage;
  const alt = variant?.alt || tactic.overviewAlt;
  overview.hidden = !image;
  if (image) {
    overviewImage.src = image;
    overviewImage.alt = alt || "Visão geral da tática " + tactic.name;
  } else {
    overviewImage.removeAttribute("src");
    overviewImage.alt = "";
  }
}

function renderTacticLineup(tactic) {
  const sheet = state.operatorSheets[tactic.side];
  const operatorGrid = document.querySelector("#tactic-operator-grid");
  if (sheet) {
    operatorGrid.style.setProperty("--portrait-sheet", `url("${new URL(sheet.image, document.baseURI).href}")`);
    operatorGrid.style.setProperty("--portrait-size", (sheet.width / 110 * 100) + "% " + (sheet.height / 184 * 100) + "%");
  }
  const displayedOperators = getDisplayedTacticOperators(tactic);
  operatorGrid.replaceChildren(...displayedOperators.map((operator, index) => {
    const videoOptions = tactic.operatorVideos?.[operator.name];
    const firstVideo = Array.isArray(videoOptions) ? videoOptions[0] : videoOptions;
    const video = typeof firstVideo === "string" ? firstVideo : firstVideo?.video;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "tactic-operator";
    card.classList.toggle("is-replacement", Boolean(operator.replacementFor));
    card.classList.toggle("has-video", Boolean(video));
    card.dataset.banEnabled = String(state.banMode);
    card.setAttribute("aria-label", state.banMode ? "Banir " + operator.name : video ? "Assistir vídeo de " + operator.name : operator.name);
    const visual = document.createElement("div");
    visual.className = "tactic-operator__visual";
    const portrait = document.createElement("span");
    portrait.className = "operator-portrait";
    portrait.setAttribute("role", "img");
    portrait.setAttribute("aria-label", "Retrato de " + operator.name);
    const position = sheet?.rows.flatMap((names, row) => names.map((name, column) => ({ name, row, column }))).find((item) => item.name === operator.name);
    if (sheet && position) {
      portrait.style.setProperty("--portrait-x", ((sheet.x[position.row] + position.column * 120) / (sheet.width - 110) * 100) + "%");
      portrait.style.setProperty("--portrait-y", (sheet.y[position.row] / (sheet.height - 184) * 100) + "%");
    }
    const slot = document.createElement("span");
    slot.className = "tactic-operator__slot";
    slot.textContent = "JOGADOR " + String(index + 1).padStart(2, "0");
    const body = document.createElement("div");
    body.className = "tactic-operator__body";
    const name = document.createElement("strong");
    name.textContent = operator.name;
    const assignment = document.createElement("span");
    assignment.textContent = video && !state.banMode ? "Assistir vídeo ↗" : operator.assignment;
    visual.append(portrait, slot);
    body.append(name, assignment);
    card.append(visual, body);
    card.addEventListener("click", () => {
      if (state.banMode) {
        selectBannedOperator(tactic, operator);
        return;
      }
      if (video) window.location.assign(new URL(video, document.baseURI).href);
    });
    return card;
  }));
  const opponentSheet = state.operatorSheets[tactic.side === "attack" ? "defense" : "attack"];
  (tactic.recommendedBans || []).forEach((operatorName) => {
    const card = document.createElement("div");
    card.className = "tactic-operator tactic-operator--recommended-ban";
    card.setAttribute("aria-label", operatorName + ", ban recomendado");
    const visual = document.createElement("div");
    visual.className = "tactic-operator__visual";
    const portrait = document.createElement("span");
    portrait.className = "operator-portrait";
    portrait.setAttribute("role", "img");
    portrait.setAttribute("aria-label", "Retrato de " + operatorName);
    const position = opponentSheet?.rows.flatMap((names, row) => names.map((name, column) => ({ name, row, column }))).find((item) => item.name === operatorName);
    if (opponentSheet && position) {
      portrait.style.setProperty("--portrait-sheet", `url("${new URL(opponentSheet.image, document.baseURI).href}")`);
      portrait.style.setProperty("--portrait-size", (opponentSheet.width / 110 * 100) + "% " + (opponentSheet.height / 184 * 100) + "%");
      portrait.style.setProperty("--portrait-x", ((opponentSheet.x[position.row] + position.column * 120) / (opponentSheet.width - 110) * 100) + "%");
      portrait.style.setProperty("--portrait-y", (opponentSheet.y[position.row] / (opponentSheet.height - 184) * 100) + "%");
    }
    const badge = document.createElement("span");
    badge.className = "tactic-operator__slot";
    badge.textContent = "BAN RECOMENDADO";
    const body = document.createElement("div");
    body.className = "tactic-operator__body";
    const name = document.createElement("strong");
    name.textContent = operatorName;
    const description = document.createElement("span");
    description.textContent = "Prioridade de banimento";
    visual.append(portrait, badge);
    body.append(name, description);
    card.append(visual, body);
    operatorGrid.append(card);
  });
}

function updateBanInterface(tactic) {
  renderTacticOverview(tactic);
  const toggle = document.querySelector("#tactic-ban-toggle");
  const clear = document.querySelector("#tactic-ban-clear");
  const banner = document.querySelector("#tactic-ban-banner");
  toggle.setAttribute("aria-pressed", String(state.banMode));
  const banCount = state.bannedOperatorNames.length;
  const lastBanned = state.bannedOperatorNames.at(-1);
  toggle.disabled = banCount >= 3 && !state.banMode;
  toggle.textContent = state.banMode ? "Cancelar seleção" : banCount ? "Banir outro operador" : "Banir operador";
  clear.hidden = banCount === 0;
  banner.hidden = banCount === 0;
  if (banCount) {
    document.querySelector("#tactic-banned-name").textContent = state.bannedOperatorNames.map((name) => name + " banido").join(" · ");
    document.querySelector("#tactic-replacement-name").textContent = tactic.banReplacements[lastBanned] + " entrou na formação";
  }
  document.querySelector("#tactic-ban-status").textContent = state.banMode
    ? "Selecione na formação o operador que deseja banir. " + banCount + " de 3 usados."
    : banCount >= 3
      ? "Limite de 3 banimentos atingido."
      : banCount
      ? banCount + " de 3 banimentos usados. " + lastBanned + " foi substituído por " + tactic.banReplacements[lastBanned] + "."
      : "Escolha Banir operador para ajustar a composição.";
}

function toggleBanMode() {
  const tactic = state.tactics.find((item) => item.id === state.selectedTacticId);
  if (!tactic) return;
  state.banMode = !state.banMode;
  renderTacticLineup(tactic);
  updateBanInterface(tactic);
}

function selectBannedOperator(tactic, operator) {
  if (!state.banMode) return;
  const originalName = operator.name;
  if (state.bannedOperatorNames.length >= 3) {
    state.banMode = false;
    updateBanInterface(tactic);
    return;
  }
  const replacement = tactic.banReplacements?.[originalName];
  if (!replacement) {
    document.querySelector("#tactic-ban-status").textContent = "Ainda não há substituto cadastrado para " + originalName + ".";
    return;
  }
  if (!state.bannedOperatorNames.includes(originalName)) state.bannedOperatorNames.push(originalName);
  state.banMode = false;
  renderTacticLineup(tactic);
  updateBanInterface(tactic);
}

function clearBannedOperator() {
  const tactic = state.tactics.find((item) => item.id === state.selectedTacticId);
  if (!tactic) return;
  state.bannedOperatorNames = [];
  state.banMode = false;
  renderTacticLineup(tactic);
  updateBanInterface(tactic);
}

async function showOperatorSelection() {
  const version = ++operatorViewVersion;
  const map = state.maps.find((map) => map.id === state.selectedMapId);
  const site = state.bombSiteFlows[map.id].sites.find((site) => site.id === state.selectedBombSiteId);
  elements.bombSection.hidden = true;
  elements.operatorSection.hidden = false;
  elements.skipLink.href = "#operadores";
  elements.skipLink.textContent = "Ir para a escolha dos operadores";
  document.title = map.name + " — Escolha os operadores | R6 Hub";
  document.querySelector("#operators-map-name").textContent = map.name;
  document.querySelector("#operators-context").textContent = sideLabels[state.selectedSide] + " / " + fullSquadLabel;
  document.querySelector("#operators-site").textContent = site.name;
  document.querySelector("#operators-description").textContent = "Selecione " + state.selectedGroupSize + (state.selectedGroupSize === 1 ? " operador para jogar esta rodada." : " operadores, um para cada jogador do grupo.");
  document.querySelector("#operator-search").value = "";
  document.querySelector("#operators-empty").hidden = true;
  elements.operatorGrid.replaceChildren();
  elements.operatorStatus.textContent = "Carregando operadores…";
  document.querySelector("#lineup-summary").hidden = true;
  document.querySelector("#operators-count").textContent = "";
  window.scrollTo({top:0, behavior:"smooth"});
  document.querySelector("#operators-title").focus({preventScroll:true});
  await operatorsReady;
  if (elements.operatorSection.hidden || version !== operatorViewVersion) return;
  const sheet = state.operatorSheets[state.selectedSide];
  if (!sheet) {
    elements.operatorStatus.textContent = "Não foi possível carregar os operadores. Atualize a página para tentar novamente.";
    return;
  }
  const portraitSheetUrl = new URL(sheet.image, document.baseURI).href;
  elements.operatorGrid.style.setProperty("--portrait-sheet", 'url("' + portraitSheetUrl + '")');
  elements.operatorGrid.style.setProperty("--portrait-size", (sheet.width / 110 * 100) + "% " + (sheet.height / 184 * 100) + "%");
  sheet.rows.forEach((names, row) => names.forEach((name, column) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "operator-card";
    card.dataset.operatorName = name;
    card.setAttribute("aria-label", "Selecionar " + name);
    card.style.setProperty("--portrait-x", ((sheet.x[row] + column * 120) / (sheet.width - 110) * 100) + "%");
    card.style.setProperty("--portrait-y", (sheet.y[row] / (sheet.height - 184) * 100) + "%");
    const portrait = document.createElement("span");
    portrait.className = "operator-portrait";
    portrait.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "operator-name";
    label.textContent = name;
    card.append(portrait, label);
    card.addEventListener("click", () => {
      const index = state.selectedOperators.indexOf(name);
      if (index >= 0) state.selectedOperators.splice(index, 1);
      else if (state.selectedOperators.length < state.selectedGroupSize) state.selectedOperators.push(name);
      else {
        elements.operatorStatus.textContent = "Seu grupo está completo. Desmarque um operador para escolher outro.";
        return;
      }
      updateOperatorSelection();
    });
    elements.operatorGrid.append(card);
  }));
  updateOperatorSelection();
}

function updateOperatorSelection() {
  const count = state.selectedOperators.length;
  const complete = count === state.selectedGroupSize;
  elements.operatorGrid.querySelectorAll("button").forEach((card) => {
    const selected = state.selectedOperators.includes(card.dataset.operatorName);
    card.setAttribute("aria-pressed", String(selected));
    card.setAttribute("aria-label", (selected ? "Desmarcar " : "Selecionar ") + card.dataset.operatorName);
    card.setAttribute("aria-disabled", String(complete && !selected));
  });
  document.querySelector("#operators-count").textContent = count + " / " + state.selectedGroupSize + " selecionados";
  elements.operatorStatus.textContent = complete ? "Grupo completo. Você pode trocar um operador desmarcando o card selecionado." : "Falta selecionar " + (state.selectedGroupSize - count) + (state.selectedGroupSize - count === 1 ? " operador." : " operadores.");
  document.querySelector("#lineup-summary").hidden = !complete;
  document.querySelector("#lineup-names").textContent = state.selectedOperators.join(" · ");
}

function backToBombSites() {
  elements.tacticsSection.hidden = true;
  elements.tacticDetailSection.hidden = true;
  openBombSiteSelection(state.maps.find((map) => map.id === state.selectedMapId), state.bombSiteFlows[state.selectedMapId]);
}

function showSideSelection() {
  elements.operatorSection.hidden = true;
  elements.tacticsSection.hidden = true;
  elements.tacticDetailSection.hidden = true;
  const selectedSide = state.selectedSide;
  const selectedMap = state.maps.find((map) => map.id === state.selectedMapId);
  elements.bombSection.hidden = true;
  elements.sideSection.hidden = false;
  elements.body.classList.remove("is-bomb-view");
  elements.skipLink.href = "#lado";
  elements.skipLink.textContent = "Ir para a escolha do lado";
  document.title = `${selectedMap.name} — Escolha o lado | R6 Hub`;

  window.scrollTo({ top: 0, behavior: "smooth" });
  window.setTimeout(() => {
    document.querySelector(`[data-side="${CSS.escape(selectedSide)}"]`)?.focus({ preventScroll: true });
  }, 220);
}

function showMapSelection() {
  elements.operatorSection.hidden = true;
  elements.tacticsSection.hidden = true;
  elements.tacticDetailSection.hidden = true;
  const selectedMapId = state.selectedMapId;
  elements.sideSection.hidden = true;
  elements.bombSection.hidden = true;
  elements.setupsSection.hidden = true;
  elements.hero.hidden = false;
  elements.mapsSection.hidden = false;
  elements.body.classList.remove("is-bomb-view");
  elements.skipLink.href = "#mapas";
  elements.skipLink.textContent = "Ir para os mapas";
  document.title = defaultDocumentTitle;

  elements.mapsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => {
    document.querySelector(`[data-map-id="${CSS.escape(selectedMapId)}"]`)?.focus({ preventScroll: true });
  }, 220);
}

function clearSearch() {
  state.query = "";
  elements.search.value = "";
  renderMaps();
  elements.search.focus();
}

function bindEvents() {
  document.querySelector("#open-setups").addEventListener("click", openSetups);
  document.querySelector("#open-broken-angle").addEventListener("click", openBrokenAnglePlaylist);
  document.querySelector("#back-from-broken-angle").addEventListener("click", closeBrokenAnglePlaylist);
  document.querySelector("#back-from-setups").addEventListener("click", showMapSelection);
  document.querySelector("#back-to-setup-maps").addEventListener("click", showSetupMaps);
  document.querySelector("#back-to-setup-bombs").addEventListener("click", showSetupBombSites);
  document.querySelector("#back-to-setup-operators").addEventListener("click", showSetupOperators);
  document.querySelector("#back-to-bombs").addEventListener("click", backToBombSites);
  document.querySelector("#back-to-bomb-sites").addEventListener("click", backToBombSites);
  document.querySelector("#back-to-tactics").addEventListener("click", showTacticSelection);
  document.querySelector("#tactic-ban-toggle").addEventListener("click", toggleBanMode);
  document.querySelector("#tactic-ban-clear").addEventListener("click", clearBannedOperator);
  document.querySelector("#operator-search").addEventListener("input", (event) => {
    const query = normalizeText(event.target.value).replace(/ø/g, "o");
    const cards = [...elements.operatorGrid.children];
    cards.forEach((card) => { card.hidden = !normalizeText(card.dataset.operatorName).replace(/ø/g, "o").includes(query); });
    document.querySelector("#operators-empty").hidden = cards.some((card) => !card.hidden);
  });
  elements.search.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderMaps();
  });

  elements.clearSearch.addEventListener("click", clearSearch);
  elements.backToMaps.addEventListener("click", showMapSelection);
  elements.backToSides.addEventListener("click", showSideSelection);
  elements.sideOptions.forEach((option) => {
    option.addEventListener("click", () => selectSide(option.dataset.side));
  });

  document.addEventListener("keydown", (event) => {
    const targetIsField = event.target.matches("input, textarea, select, [contenteditable='true']");

    if (event.key === "/" && !targetIsField && !elements.mapsSection.hidden) {
      event.preventDefault();
      elements.search.focus();
    }

    if (event.key === "Escape" && document.activeElement === elements.search && elements.search.value) {
      clearSearch();
    }

    if (event.key === "Escape" && !elements.setupsSection.hidden) {
      if (!document.querySelector("#setup-broken-angle-stage").hidden) closeBrokenAnglePlaylist();
      else if (!document.querySelector("#setup-video-stage").hidden && state.setupVideo) showSetupVideoOptions();
      else if (!document.querySelector("#setup-video-stage").hidden) showSetupOperators();
      else if (!document.querySelector("#setup-operator-stage").hidden) showSetupBombSites();
      else if (!document.querySelector("#setup-bomb-stage").hidden) showSetupMaps();
      else showMapSelection();
      return;
    }

    if (event.key === "Escape" && !elements.operatorSection.hidden) {
      backToBombSites();
      return;
    }

    if (event.key === "Escape" && !elements.tacticDetailSection.hidden) {
      showTacticSelection();
      return;
    }

    if (event.key === "Escape" && !elements.tacticsSection.hidden) {
      backToBombSites();
      return;
    }

    if (event.key === "Escape" && !elements.bombSection.hidden) {
      showSideSelection();
      return;
    }

    if (event.key === "Escape" && !elements.sideSection.hidden) {
      showMapSelection();
    }
  });
}

async function loadBombSiteFlows() {
  try {
    const response = await fetch("./data/bomb-sites.json?v=selection-28", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Falha ao carregar bomb sites: ${response.status}`);
    }

    state.bombSiteFlows = await response.json();
  } catch (error) {
    console.error(error);
    state.bombSiteFlows = {};
  }
}

async function loadMaps() {
  try {
    const response = await fetch("./data/maps.json?v=selection-28", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Falha ao carregar mapas: ${response.status}`);
    }

    const maps = await response.json();
    state.maps = maps.sort((first, second) => first.order - second.order);
    elements.heroMapTotal.textContent = String(state.maps.length).padStart(2, "0");
    renderMaps();
  } catch (error) {
    console.error(error);
    elements.grid.setAttribute("aria-busy", "false");
    elements.grid.innerHTML = `
      <p class="error-message">
        Não foi possível carregar os mapas. Abra o projeto por um servidor local para acessar os dados JSON.
      </p>
    `;
    elements.status.textContent = "Erro ao carregar mapas";
  }
}

async function loadOperators() {
  try {
    const response = await fetch("./data/operators.json?v=selection-21");
    if (!response.ok) throw new Error("Falha ao carregar operadores: " + response.status);
    state.operatorSheets = await response.json();
  } catch (error) { console.error(error); }
}

async function loadTactics() {
  try {
    const response = await fetch("./data/tactics.json?v=selection-29", { cache: "no-store" });
    if (!response.ok) throw new Error("Falha ao carregar táticas: " + response.status);
    state.tactics = await response.json();
  } catch (error) {
    console.error(error);
    state.tactics = [];
  }
}

async function loadBrokenAnglePlaylist() {
  try {
    const response = await fetch("./data/broken-angle.json?v=playlist-1", { cache: "no-store" });
    if (!response.ok) throw new Error("Falha ao carregar a playlist Broken Angle: " + response.status);
    state.brokenAngleVideos = await response.json();
  } catch (error) {
    console.error(error);
    state.brokenAngleVideos = [];
  }
}

bindEvents();
operatorsReady = loadOperators();
tacticsReady = loadTactics();
bombSiteFlowsReady = loadBombSiteFlows();
mapsReady = loadMaps();
brokenAngleReady = loadBrokenAnglePlaylist();
