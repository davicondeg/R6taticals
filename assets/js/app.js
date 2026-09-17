const state = {
  bombSiteFlows: {},
  maps: [],
  query: "",
  selectedBombSiteId: null,
  selectedMapId: null,
  selectedSide: null,
  selectedGroupSize: null,
  selectedTacticId: null,
  bannedOperatorNames: [],
  banMode: false,
  selectedOperators: [],
  operatorSheets: {},
  tactics: [],
};

const elements = {
  backToMaps: document.querySelector("#back-to-maps"),
  backToSides: document.querySelector("#back-to-sides"),
  groupBack: document.querySelector("#group-back-to-sides"),
  groupSection: document.querySelector("#grupo"),
  groupOptions: document.querySelector("#group-options"),
  groupMap: document.querySelector("#group-map-name"),
  groupSide: document.querySelector("#group-side-name"),
  groupStatus: document.querySelector("#group-selection-status"),
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
let operatorViewVersion = 0;

const sideLabels = {
  attack: "Ataque",
  defense: "Defesa",
};

const defaultDocumentTitle = document.title;
const groupLabels = ["Solo", "Duo", "Trio", "Quarteto", "Squad full"];

function renderGroupOptions() {
  elements.groupOptions.replaceChildren(...groupLabels.map((label, index) => {
    const size = index + 1;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "group-option";
    button.dataset.groupSize = size;
    button.setAttribute("aria-pressed", String(state.selectedGroupSize === size));
    button.classList.toggle("is-selected", state.selectedGroupSize === size);
    button.innerHTML = `
      <span class="group-option__count" aria-hidden="true">0${size}<span>/ 05</span></span>
      <span class="group-option__players" aria-hidden="true">${Array.from({ length: 5 }, (_, slot) => `<svg class="${slot < size ? "is-active" : ""}" viewBox="0 0 24 32"><circle cx="12" cy="7" r="5"/><path d="M3 30V21a9 9 0 0 1 18 0v9Z"/></svg>`).join("")}</span>
      <strong>${label}</strong>
      <span class="group-option__description">${size === 1 ? "Você no comando do seu jogo." : size === 5 ? "Equipe completa. Todos conectados." : `Você e mais ${size - 1} ${size === 2 ? "amigo" : "amigos"}.`}</span>
      <span class="group-option__action">${size} ${size === 1 ? "jogador" : "jogadores"}<span aria-hidden="true">↗</span></span>`;
    button.addEventListener("click", () => selectGroup(size));
    return button;
  }));
}

function showGroupSelection() {
  elements.operatorSection.hidden = true;
  elements.tacticsSection.hidden = true;
  elements.tacticDetailSection.hidden = true;
  const map = state.maps.find((map) => map.id === state.selectedMapId);
  elements.groupMap.textContent = map.name;
  elements.groupSide.textContent = sideLabels[state.selectedSide];
  elements.sideSection.hidden = true;
  elements.bombSection.hidden = true;
  elements.groupSection.hidden = false;
  elements.body.classList.remove("is-bomb-view");
  elements.groupStatus.textContent = "Escolha uma das cinco opções para continuar.";
  renderGroupOptions();
  elements.skipLink.href = "#grupo";
  elements.skipLink.textContent = "Ir para a escolha do grupo";
  document.title = `${map.name} — Escolha o grupo | R6 Hub`;
  window.scrollTo({ top: 0, behavior: "smooth" });
  (elements.groupOptions.querySelector('[aria-pressed="true"]') || elements.groupOptions.firstElementChild).focus({ preventScroll: true });
}

async function selectGroup(size) {
  state.selectedOperators = [];
  state.selectedGroupSize = size;
  state.selectedBombSiteId = null;
  renderGroupOptions();
  elements.groupOptions.children[size - 1].focus({ preventScroll: true });
  elements.groupStatus.textContent = `${groupLabels[size - 1]} selecionado. Carregando bomb sites…`;
  const mapId = state.selectedMapId;
  const side = state.selectedSide;
  await bombSiteFlowsReady;
  if (elements.groupSection.hidden || state.selectedGroupSize !== size || state.selectedMapId !== mapId || state.selectedSide !== side) return;
  const map = state.maps.find((map) => map.id === mapId);
  const flow = state.bombSiteFlows[mapId];
  if (!flow) {
    elements.groupStatus.textContent = `${groupLabels[size - 1]} selecionado. Os bomb sites de ${map.name} serão adicionados em uma próxima etapa.`;
    return;
  }
  openBombSiteSelection(map, flow);
}

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
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
  state.selectedGroupSize = null;
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

function selectSide(side) {
  if (!sideLabels[side]) {
    return;
  }

  if (state.selectedSide !== side) {
    state.selectedGroupSize = null;
    state.selectedOperators = [];
  }
  state.selectedSide = side;
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

  elements.sideStatus.textContent = `${sideLabels[side]} selecionado para ${selectedMap.name}.`;
  showGroupSelection();
}

function openBombSiteSelection(selectedMap, flow) {
  elements.operatorSection.hidden = true;
  elements.bombTitle.textContent = "Escolha o bomb site";
  document.querySelector("#bomb-map-name").textContent = selectedMap.name;
  document.querySelector("#site-map-image").src = selectedMap.image;
  elements.bombSideContext.textContent = sideLabels[state.selectedSide] + " / " + groupLabels[state.selectedGroupSize - 1];
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
  elements.groupSection.hidden = true;
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
  await tacticsReady;
  const map = state.maps.find((item) => item.id === state.selectedMapId);
  const site = state.bombSiteFlows[state.selectedMapId]?.sites.find((item) => item.id === state.selectedBombSiteId);
  if (!map || !site) return;
  elements.bombSection.hidden = true;
  elements.operatorSection.hidden = true;
  elements.tacticDetailSection.hidden = true;
  elements.tacticsSection.hidden = false;
  document.querySelector("#tactics-map-name").textContent = map.name;
  document.querySelector("#tactics-context").textContent = sideLabels[state.selectedSide] + " / " + groupLabels[state.selectedGroupSize - 1];
  document.querySelector("#tactics-site").textContent = "Bombsite · " + site.name;
  const available = state.tactics.filter((tactic) => tactic.mapId === state.selectedMapId
    && tactic.side === state.selectedSide
    && tactic.groupSize === state.selectedGroupSize
    && (tactic.bombSiteIds.includes("*") || tactic.bombSiteIds.includes(state.selectedBombSiteId)));
  elements.tacticsList.replaceChildren(...available.map((tactic, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tactic-card";
    button.dataset.tacticId = tactic.id;
    button.innerHTML = `<span class="tactic-card__number">TÁTICA ${String(index + 1).padStart(2, "0")}</span><strong>${tactic.name}</strong><span class="tactic-card__meta">${sideLabels[tactic.side]} · ${tactic.groupSize} jogadores</span><span class="tactic-card__action">Abrir plano <span aria-hidden="true">↗</span></span>`;
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
  document.querySelector("#tactic-detail-context").textContent = sideLabels[state.selectedSide] + " / " + groupLabels[state.selectedGroupSize - 1];
  document.querySelector("#tactic-detail-site").textContent = "Bombsite · " + site.name;
  document.querySelector("#tactic-operator-count").textContent = tactic.operators.length + " operadores";
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
    const card = document.createElement("button");
    card.type = "button";
    card.className = "tactic-operator";
    card.classList.toggle("is-replacement", Boolean(operator.replacementFor));
    card.dataset.banEnabled = String(state.banMode);
    card.setAttribute("aria-label", state.banMode ? "Banir " + operator.name : operator.name);
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
    assignment.textContent = operator.assignment;
    visual.append(portrait, slot);
    body.append(name, assignment);
    card.append(visual, body);
    card.addEventListener("click", () => selectBannedOperator(tactic, operator));
    return card;
  }));
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
  document.querySelector("#operators-context").textContent = sideLabels[state.selectedSide] + " / " + groupLabels[state.selectedGroupSize - 1];
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
  elements.groupSection.hidden = true;
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
  elements.groupSection.hidden = true;
  const selectedMapId = state.selectedMapId;
  elements.sideSection.hidden = true;
  elements.bombSection.hidden = true;
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
  elements.backToSides.addEventListener("click", showGroupSelection);
  elements.groupBack.addEventListener("click", showSideSelection);
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
      showGroupSelection();
      return;
    }

    if (event.key === "Escape" && !elements.groupSection.hidden) {
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
    const response = await fetch("./data/bomb-sites.json?v=selection-21");
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
    const response = await fetch("./data/maps.json");
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
    const response = await fetch("./data/tactics.json?v=selection-26", { cache: "no-store" });
    if (!response.ok) throw new Error("Falha ao carregar táticas: " + response.status);
    state.tactics = await response.json();
  } catch (error) {
    console.error(error);
    state.tactics = [];
  }
}

bindEvents();
operatorsReady = loadOperators();
tacticsReady = loadTactics();
bombSiteFlowsReady = loadBombSiteFlows();
loadMaps();
