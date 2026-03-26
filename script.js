const STORAGE_KEY = "mama1-character-sheet";
const THEME_KEY = "mama1-theme";

function createLineLists() {
  const containers = [...document.querySelectorAll("[data-line-list]")];

  containers.forEach((container) => {
    const prefix = container.dataset.prefix;
    const count = Number(container.dataset.count || 0);
    const label = container.dataset.label || prefix;
    const indexed = container.dataset.indexed === "true";

    container.innerHTML = "";

    for (let index = 1; index <= count; index += 1) {
      const row = document.createElement("label");
      row.className = "line-list__row";

      if (indexed) {
        const indexMark = document.createElement("span");
        indexMark.className = "line-list__index";
        indexMark.textContent = String(index);
        indexMark.dataset.index = String(index);
        row.append(indexMark);
      }

      const srLabel = document.createElement("span");
      srLabel.className = "sr-only";
      srLabel.textContent = `${label} ${index}`;

      const input = document.createElement("input");
      input.type = "text";
      input.className = "line-list__input";
      input.dataset.field = `${prefix}_${index}`;

      row.append(srLabel, input);
      container.append(row);
    }
  });
}

createLineLists();

const fieldElements = [...document.querySelectorAll("[data-field]")];
const trackElements = [...document.querySelectorAll("[data-track]")];
const thresholdLists = [...document.querySelectorAll("[data-threshold-field]")];
const saveStatus = document.getElementById("save-status");
const resetButton = document.getElementById("reset-sheet");
const themeToggleButton = document.getElementById("theme-toggle");

const state = {
  fields: {},
  tracks: {},
};

function setStatus(message) {
  if (saveStatus) {
    saveStatus.textContent = message;
  }
}

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (error) {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.warn("Не удалось сохранить тему", error);
  }
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = nextTheme;

  if (themeToggleButton) {
    const isDark = nextTheme === "dark";
    themeToggleButton.textContent = isDark ? "Светлая тема" : "Тёмная тема";
    themeToggleButton.setAttribute("aria-pressed", String(isDark));
  }
}

function initializeTheme() {
  const storedTheme = getStoredTheme();

  if (storedTheme === "light" || storedTheme === "dark") {
    applyTheme(storedTheme);
    return;
  }

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  applyTheme(prefersDark ? "dark" : "light");
}

function readStorage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Хранилище браузера недоступно", error);
    setStatus("Автосохранение недоступно в этом режиме браузера.");
    return null;
  }
}

function writeStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn("Не удалось сохранить лист в браузере", error);
    setStatus("Не получилось сохранить черновик в браузере.");
    return false;
  }
}

function persistState(message = "Черновик сохранен в браузере.") {
  if (writeStorage()) {
    setStatus(message);
  }
}

function createDots(trackElement) {
  const count = Number(trackElement.dataset.count || 0);
  const trackName = trackElement.dataset.track;
  const label = trackElement.dataset.label || "Трек";

  trackElement.innerHTML = "";

  if (!Array.isArray(state.tracks[trackName]) || state.tracks[trackName].length !== count) {
    state.tracks[trackName] = Array.from({ length: count }, () => false);
  }

  state.tracks[trackName].forEach((isActive, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "track__dot";
    button.setAttribute("aria-label", `${label}: отметка ${index + 1}`);
    button.setAttribute("aria-pressed", String(isActive));
    button.classList.toggle("is-active", isActive);

    button.addEventListener("click", () => {
      const currentCount = state.tracks[trackName].filter(Boolean).length;
      const clickedCount = index + 1;
      const nextCount = currentCount === clickedCount ? index : clickedCount;

      state.tracks[trackName] = state.tracks[trackName].map((_, dotIndex) => dotIndex < nextCount);
      createDots(trackElement);
      persistState("Точка обновлена и сохранена.");
    });

    trackElement.append(button);
  });
}

function syncThresholdLists() {
  thresholdLists.forEach((container) => {
    const fieldName = container.dataset.thresholdField;
    const rawValue = state.fields[fieldName] ?? document.querySelector(`[data-field="${fieldName}"]`)?.value ?? "";
    const threshold = Math.max(0, Number.parseInt(rawValue, 10) || 0);
    const indexes = [...container.querySelectorAll(".line-list__index")];

    indexes.forEach((indexElement) => {
      const index = Number.parseInt(indexElement.dataset.index || "0", 10);
      const isActive = index > 0 && index <= threshold;
      indexElement.classList.toggle("is-active", isActive);
      indexElement.closest(".line-list__row")?.classList.toggle("is-threshold-active", isActive);
    });
  });
}

function hydrateFields() {
  fieldElements.forEach((element) => {
    const key = element.dataset.field;
    element.value = state.fields[key] || "";

    element.addEventListener("input", () => {
      state.fields[key] = element.value;
      syncThresholdLists();
      persistState();
    });
  });
}

function loadState() {
  const saved = readStorage();

  if (!saved) {
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    Object.assign(state.fields, parsed.fields || {});
    Object.assign(state.tracks, parsed.tracks || {});
    setStatus("Черновик из браузера восстановлен.");
  } catch (error) {
    console.error("Не удалось загрузить сохраненный лист", error);
    setStatus("Сохраненный черновик поврежден. Начинаем с чистого листа.");
  }
}

function resetSheet() {
  const confirmed = window.confirm("Очистить все поля и все отмеченные точки?");

  if (!confirmed) {
    return;
  }

  fieldElements.forEach((element) => {
    element.value = "";
  });

  Object.keys(state.fields).forEach((key) => {
    state.fields[key] = "";
  });

  trackElements.forEach((trackElement) => {
    const trackName = trackElement.dataset.track;
    const count = Number(trackElement.dataset.count || 0);
    state.tracks[trackName] = Array.from({ length: count }, () => false);
    createDots(trackElement);
  });

  syncThresholdLists();
  persistState("Лист очищен.");
}

loadState();
initializeTheme();
trackElements.forEach(createDots);
hydrateFields();
syncThresholdLists();

resetButton?.addEventListener("click", resetSheet);
themeToggleButton?.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  storeTheme(nextTheme);
});
