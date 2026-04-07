const STORAGE_KEY = "mama1-character-sheet";
const THEME_KEY = "mama1-theme";

function createLineLists() {
  const containers = [...document.querySelectorAll("[data-line-list]")];

  containers.forEach((container) => {
    const prefix = container.dataset.prefix;
    const count = Number(container.dataset.count || 0);
    const label = container.dataset.label || prefix;
    const indexed = container.dataset.indexed === "true";
    const resourceControls = container.dataset.resourceControls === "true";
    const secondaryPrefix = container.dataset.secondaryPrefix;
    const secondaryLabel = container.dataset.secondaryLabel || `${label} доп. поле`;
    const secondaryPlaceholder = container.dataset.secondaryPlaceholder || "";
    const secondaryTone = container.dataset.secondaryTone || "";
    const transferTarget = container.dataset.transferTarget || "";
    const transferStatePrefix = container.dataset.transferStatePrefix || `${prefix}Transfer`;
    const transferLabel = container.dataset.transferLabel || "Перенести";

    container.innerHTML = "";

    for (let index = 1; index <= count; index += 1) {
      const row = document.createElement("div");
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
      input.setAttribute("aria-label", `${label} ${index}`);

      row.append(srLabel, input);

      if (resourceControls) {
        row.classList.add("line-list__row--resource");

        const controls = document.createElement("div");
        controls.className = "resource-stepper";

        const decrementButton = document.createElement("button");
        decrementButton.type = "button";
        decrementButton.className = "resource-stepper__button";
        decrementButton.textContent = "-";
        decrementButton.dataset.resourceStepField = `${prefix}_${index}`;
        decrementButton.dataset.resourceStep = "-1";
        decrementButton.setAttribute("aria-label", `${label} ${index}: уменьшить количество`);

        const incrementButton = document.createElement("button");
        incrementButton.type = "button";
        incrementButton.className = "resource-stepper__button";
        incrementButton.textContent = "+";
        incrementButton.dataset.resourceStepField = `${prefix}_${index}`;
        incrementButton.dataset.resourceStep = "1";
        incrementButton.setAttribute("aria-label", `${label} ${index}: увеличить количество`);

        [decrementButton, incrementButton].forEach((button) => {
          button.addEventListener("click", () => {
            const fieldKey = button.dataset.resourceStepField;
            const step = Number.parseInt(button.dataset.resourceStep || "0", 10);
            stepResourceField(fieldKey, step);
          });
        });

        controls.append(decrementButton, incrementButton);
        row.append(controls);
      }

      if (transferTarget) {
        row.classList.add("line-list__row--transfer");

        const transferButton = document.createElement("button");
        transferButton.type = "button";
        transferButton.className = "line-list__transfer";
        transferButton.dataset.transferTarget = transferTarget;
        transferButton.dataset.transferStateKey = `${transferStatePrefix}_${index}`;
        transferButton.dataset.transferSourceField = `${prefix}_${index}`;
        transferButton.setAttribute("aria-label", `${transferLabel} ${index}`);
        transferButton.setAttribute("aria-pressed", "false");
        transferButton.title = transferLabel;

        transferButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          const stateKey = transferButton.dataset.transferStateKey;
          const nextState = !Boolean(state.fields[stateKey]);
          state.fields[stateKey] = nextState;
          transferButton.classList.toggle("is-active", nextState);
          transferButton.setAttribute("aria-pressed", String(nextState));
          return syncAndPersist("Ресурсы обновлены и сохранены.");
        });

        row.append(transferButton);
      }

      if (secondaryPrefix) {
        row.classList.add("line-list__row--meta");

        const metaSrLabel = document.createElement("span");
        metaSrLabel.className = "sr-only";
        metaSrLabel.textContent = `${secondaryLabel} ${index}`;

        const metaInput = document.createElement("input");
        metaInput.type = "text";
        metaInput.className = "line-list__meta-input";
        metaInput.dataset.field = `${secondaryPrefix}_${index}`;
        metaInput.placeholder = secondaryPlaceholder;
        metaInput.setAttribute("aria-label", `${secondaryLabel} ${index}`);

        if (secondaryTone) {
          metaInput.dataset[`${secondaryTone}Tone`] = "true";
        }

        row.append(metaSrLabel, metaInput);
      }

      container.append(row);
    }
  });
}

createLineLists();

function createTalentTrees() {
  const containers = [...document.querySelectorAll("[data-talent-tree]")];

  containers.forEach((container) => {
    const prefix = container.dataset.prefix || "talent";
    const count = Number(container.dataset.count || 0);
    const skillCount = Number(container.dataset.skillCount || 0);
    const label = container.dataset.label || "Талант";

    container.innerHTML = "";

    for (let talentIndex = 1; talentIndex <= count; talentIndex += 1) {
      const group = document.createElement("section");
      group.className = "talent-tree__group";
      group.dataset.talentIndex = String(talentIndex);

      const talentRow = document.createElement("div");
      talentRow.className = "talent-tree__talent-row";

      const talentLabel = document.createElement("span");
      talentLabel.className = "sr-only";
      talentLabel.textContent = `${label} ${talentIndex}`;

      const talentInput = document.createElement("input");
      talentInput.type = "text";
      talentInput.className = "line-list__input talent-tree__input";
      talentInput.dataset.field = `${prefix}_${talentIndex}`;
      talentInput.setAttribute("aria-label", `${label} ${talentIndex}`);

      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "talent-tree__add";
      addButton.dataset.talentIndex = String(talentIndex);
      addButton.setAttribute("aria-label", `${label} ${talentIndex}: добавить умение`);
      addButton.textContent = "+";

      addButton.addEventListener("click", () => {
        const countKey = `${prefix}_${talentIndex}_skillCount`;
        const currentCount = Number.parseInt(String(state.fields[countKey] || "0"), 10) || 0;
        const nextCount = Math.min(skillCount, currentCount + 1);

        state.fields[countKey] = String(nextCount);
        syncAndPersist("Умение добавлено и сохранено.");
      });

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "talent-tree__add talent-tree__remove";
      removeButton.dataset.talentIndex = String(talentIndex);
      removeButton.setAttribute("aria-label", `${label} ${talentIndex}: убрать умение`);
      removeButton.textContent = "-";

      removeButton.addEventListener("click", () => {
        const countKey = `${prefix}_${talentIndex}_skillCount`;
        const currentCount = Number.parseInt(String(state.fields[countKey] || "0"), 10) || 0;

        if (currentCount <= 0) {
          return;
        }

        const removedSkillKey = `${prefix}_${talentIndex}_skill_${currentCount}`;
        state.fields[countKey] = String(currentCount - 1);
        state.fields[removedSkillKey] = "";
        syncAndPersist("Умение удалено и сохранено.");
      });

      talentRow.append(talentLabel, talentInput, removeButton, addButton);

      const skills = document.createElement("div");
      skills.className = "talent-tree__skills";

      for (let skillIndex = 1; skillIndex <= skillCount; skillIndex += 1) {
        const skillRow = document.createElement("div");
        skillRow.className = "talent-tree__skill-row";
        skillRow.dataset.skillIndex = String(skillIndex);
        skillRow.hidden = true;

        const skillMark = document.createElement("span");
        skillMark.className = "talent-tree__skill-mark";
        skillMark.textContent = ">";
        skillMark.setAttribute("aria-hidden", "true");

        const skillLabel = document.createElement("span");
        skillLabel.className = "sr-only";
        skillLabel.textContent = `${label} ${talentIndex}, умение ${skillIndex}`;

        const skillInput = document.createElement("input");
        skillInput.type = "text";
        skillInput.className = "line-list__input line-list__input--compact talent-tree__skill-input";
        skillInput.dataset.field = `${prefix}_${talentIndex}_skill_${skillIndex}`;
        skillInput.setAttribute("aria-label", `${label} ${talentIndex}, умение ${skillIndex}`);

        skillRow.append(skillMark, skillLabel, skillInput);
        skills.append(skillRow);
      }

      group.append(talentRow, skills);
      container.append(group);
    }
  });
}

createTalentTrees();

function createEquipmentProperties() {
  const containers = [...document.querySelectorAll("[data-equipment-properties]")];

  containers.forEach((container) => {
    const count = Number(container.dataset.count || 0);
    const maxPairs = Number(container.dataset.maxPairs || 0);

    container.innerHTML = "";

    const header = document.createElement("div");
    header.className = "equipment-properties__header";
    header.innerHTML = `
      <span class="equipment-properties__head equipment-properties__head--large">Большое</span>
      <span class="equipment-properties__head equipment-properties__head--name">Название</span>
      <span class="equipment-properties__head equipment-properties__head--traits">Свойства</span>
    `;
    container.append(header);

    for (let equipmentIndex = 1; equipmentIndex <= count; equipmentIndex += 1) {
      const row = document.createElement("section");
      row.className = "equipment-properties__row";
      row.dataset.equipmentPropsIndex = String(equipmentIndex);
      row.hidden = true;

      const largeToggle = document.createElement("button");
      largeToggle.type = "button";
      largeToggle.className = "equipment-properties__toggle";
      largeToggle.dataset.equipmentPropsLargeKey = `equipmentTraitLarge_${equipmentIndex}`;
      largeToggle.setAttribute("aria-label", `Снаряжение ${equipmentIndex}: большое или двуручное`);
      largeToggle.setAttribute("aria-pressed", "false");

      largeToggle.addEventListener("click", () => {
        const stateKey = largeToggle.dataset.equipmentPropsLargeKey;
        const nextState = !Boolean(state.fields[stateKey]);
        state.fields[stateKey] = nextState;
        syncAndPersist("Свойства снаряжения обновлены и сохранены.");
      });

      const name = document.createElement("div");
      name.className = "equipment-properties__name";

      const traits = document.createElement("div");
      traits.className = "equipment-properties__traits";

      for (let pairIndex = 1; pairIndex <= maxPairs; pairIndex += 1) {
        const pair = document.createElement("div");
        pair.className = "equipment-properties__pair";
        pair.dataset.equipmentPropsPair = String(pairIndex);
        pair.hidden = true;

        const positiveInput = document.createElement("input");
        positiveInput.type = "text";
        positiveInput.className = "line-list__input line-list__input--compact equipment-properties__input";
        positiveInput.dataset.field = `equipmentTrait_${equipmentIndex}_positive_${pairIndex}`;
        positiveInput.setAttribute("aria-label", `Снаряжение ${equipmentIndex}: свойство ${pairIndex}`);

        const separator = document.createElement("span");
        separator.className = "equipment-properties__separator";
        separator.textContent = "но";

        const negativeInput = document.createElement("input");
        negativeInput.type = "text";
        negativeInput.className = "line-list__input line-list__input--compact equipment-properties__input";
        negativeInput.dataset.field = `equipmentTrait_${equipmentIndex}_negative_${pairIndex}`;
        negativeInput.setAttribute("aria-label", `Снаряжение ${equipmentIndex}: недостаток ${pairIndex}`);

        pair.append(positiveInput, separator, negativeInput);
        traits.append(pair);
      }

      row.append(largeToggle, name, traits);
      container.append(row);
    }
  });
}

createEquipmentProperties();

const fieldElements = [...document.querySelectorAll("[data-field]")];
const trackElements = [...document.querySelectorAll("[data-track]")];
const dynamicTrackElements = trackElements.filter((trackElement) => trackElement.dataset.trackLimitField);
const thresholdLists = [...document.querySelectorAll("[data-threshold-field]")];
const dynamicLineLists = [...document.querySelectorAll("[data-dynamic-limit-field]")];
const talentTreeContainers = [...document.querySelectorAll("[data-talent-tree]")];
const equipmentPropertiesContainers = [...document.querySelectorAll("[data-equipment-properties]")];
const saveStatus = document.getElementById("save-status");
const resetButton = document.getElementById("reset-sheet");
const themeToggleButton = document.getElementById("theme-toggle");
const exportJsonButton = document.getElementById("export-json");

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

function exportStateAsJson() {
  const payload = {
    exportedAt: new Date().toISOString(),
    theme: document.body.dataset.theme || "light",
    state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStamp = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `character-sheet-${dateStamp}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("JSON экспортирован.");
}

function persistState(message = "Черновик сохранен в браузере.") {
  if (writeStorage()) {
    setStatus(message);
  }
}

function reportRuntimeError(context, error) {
  console.error(`Runtime error in ${context}`, error);
}

function runSafe(context, action) {
  try {
    action();
    return true;
  } catch (error) {
    reportRuntimeError(context, error);
    return false;
  }
}

function syncUiState() {
  const syncTasks = [
    ["threshold lists", syncThresholdLists],
    ["dynamic lists", syncDynamicLineLists],
    ["dynamic tracks", syncDynamicTracks],
    ["talent tree", syncTalentTrees],
    ["equipment properties", syncEquipmentProperties],
    ["durability tones", syncDurabilityFields],
    ["resource transfer", syncResourceTransfers],
    ["resource controls", syncResourceControlStates],
  ];

  let synced = true;

  syncTasks.forEach(([context, action]) => {
    synced = runSafe(context, action) && synced;
  });

  return synced;
}

function syncAndPersist(successMessage = "Черновик сохранен в браузере.") {
  const synced = syncUiState();
  const message = synced
    ? successMessage
    : "Черновик сохранен, но часть автоматических обновлений не сработала. Проверь консоль браузера.";

  persistState(message);
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
      return syncAndPersist("Точка обновлена и сохранена.");
    });

    trackElement.append(button);
  });
}

function syncDynamicTracks() {
  dynamicTrackElements.forEach((trackElement) => {
    const trackName = trackElement.dataset.track;
    const fieldName = trackElement.dataset.trackLimitField;
    const buttons = [...trackElement.querySelectorAll(".track__dot")];
    const rawValue = fieldName
      ? state.fields[fieldName] ?? document.querySelector(`[data-field="${fieldName}"]`)?.value ?? ""
      : "";
    const visibleCount = Math.max(0, Math.min(buttons.length, Number.parseInt(String(rawValue), 10) || 0));

    if (Array.isArray(state.tracks[trackName])) {
      state.tracks[trackName] = state.tracks[trackName].map((isActive, index) => (
        index < visibleCount ? isActive : false
      ));
    }

    buttons.forEach((button, index) => {
      const isVisible = index < visibleCount;
      button.hidden = !isVisible;

      if (!isVisible) {
        button.classList.remove("is-active");
        button.setAttribute("aria-pressed", "false");
      }
    });
  });
}

function syncTalentTrees() {
  talentTreeContainers.forEach((container) => {
    const prefix = container.dataset.prefix || "talent";
    const skillCount = Number(container.dataset.skillCount || 0);
    const groups = [...container.querySelectorAll(".talent-tree__group")];

    groups.forEach((group) => {
      const talentIndex = group.dataset.talentIndex;
      const talentFieldKey = `${prefix}_${talentIndex}`;
      const countKey = `${prefix}_${talentIndex}_skillCount`;
      const talentValue = String(
        state.fields[talentFieldKey] ?? group.querySelector(`[data-field="${talentFieldKey}"]`)?.value ?? "",
      ).trim();
      const savedCount = Number.parseInt(String(state.fields[countKey] || "0"), 10) || 0;
      const filledCount = Math.max(
        0,
        ...Array.from({ length: skillCount }, (_, skillOffset) => {
          const skillFieldKey = `${prefix}_${talentIndex}_skill_${skillOffset + 1}`;
          return String(state.fields[skillFieldKey] || "").trim() ? skillOffset + 1 : 0;
        }),
      );
      const visibleCount = talentValue ? Math.max(savedCount, filledCount) : 0;
      const clampedCount = Math.max(0, Math.min(skillCount, visibleCount));
      const addButton = group.querySelector(".talent-tree__add:not(.talent-tree__remove)");
      const removeButton = group.querySelector(".talent-tree__remove");
      const skillRows = [...group.querySelectorAll(".talent-tree__skill-row")];

      state.fields[countKey] = String(clampedCount);

      if (addButton) {
        const canAdd = Boolean(talentValue) && clampedCount < skillCount;
        addButton.hidden = !canAdd;
        addButton.disabled = !canAdd;
      }

      if (removeButton) {
        const canRemove = Boolean(talentValue) && clampedCount > 0;
        removeButton.hidden = !canRemove;
        removeButton.disabled = !canRemove;
      }

      group.classList.toggle("is-empty", !talentValue);

      skillRows.forEach((row, skillOffset) => {
        const isVisible = Boolean(talentValue) && skillOffset < clampedCount;
        row.hidden = !isVisible;
      });
    });
  });
}

function syncThresholdLists() {
  thresholdLists.forEach((container) => {
    const fieldName = container.dataset.thresholdField;
    const rawValue = state.fields[fieldName] ?? document.querySelector(`[data-field="${fieldName}"]`)?.value ?? "";
    const multiplierFieldName = container.dataset.thresholdMultiplierField;
    const multiplierFieldValue = multiplierFieldName
      ? state.fields[multiplierFieldName] ?? document.querySelector(`[data-field="${multiplierFieldName}"]`)?.value ?? ""
      : "";
    const multiplier = Number.parseFloat(
      String(multiplierFieldValue || container.dataset.thresholdMultiplier || "1").replace(",", "."),
    );
    const sourceValue = Number.parseFloat(String(rawValue).replace(",", ".")) || 0;
    const threshold = Math.max(0, sourceValue * (Number.isFinite(multiplier) ? multiplier : 1));
    const fullThreshold = Math.floor(threshold);
    const hasPartialThreshold = threshold - fullThreshold >= 0.5;
    const indexes = [...container.querySelectorAll(".line-list__index")];

    indexes.forEach((indexElement) => {
      const index = Number.parseInt(indexElement.dataset.index || "0", 10);
      const isActive = index > 0 && index <= fullThreshold;
      const isPartial = hasPartialThreshold && index === fullThreshold + 1;
      const row = indexElement.closest(".line-list__row");

      indexElement.classList.toggle("is-active", isActive);
      indexElement.classList.toggle("is-partial", isPartial);
      row?.classList.toggle("is-threshold-active", isActive);
      row?.classList.toggle("is-threshold-partial", isPartial);
    });
  });
}

function calculateContainerLimit(container) {
  const fieldName = container.dataset.dynamicLimitField || container.dataset.thresholdField;
  const rawValue = state.fields[fieldName] ?? document.querySelector(`[data-field="${fieldName}"]`)?.value ?? "";
  const multiplierFieldName = container.dataset.dynamicLimitMultiplierField || container.dataset.thresholdMultiplierField;
  const multiplierFieldValue = multiplierFieldName
    ? state.fields[multiplierFieldName] ?? document.querySelector(`[data-field="${multiplierFieldName}"]`)?.value ?? ""
    : "";
  const multiplier = Number.parseFloat(
    String(multiplierFieldValue || container.dataset.dynamicLimitMultiplier || container.dataset.thresholdMultiplier || "1").replace(",", "."),
  );
  const sourceValue = Number.parseFloat(String(rawValue).replace(",", ".")) || 0;

  return Math.max(0, sourceValue * (Number.isFinite(multiplier) ? multiplier : 1));
}

function formatLimitValue(value) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function syncDynamicLineLists() {
  dynamicLineLists.forEach((container) => {
    const limit = calculateContainerLimit(container);
    const visibleCount = Math.max(0, Math.min(Number(container.dataset.count || 0), Math.ceil(limit)));
    const rows = [...container.querySelectorAll(".line-list__row")];
    const displayId = container.dataset.capacityDisplayId;
    const displayElement = displayId ? document.getElementById(displayId) : null;
    const hasPartial = limit > 0 && !Number.isInteger(limit);

    rows.forEach((row, index) => {
      const isVisible = index < visibleCount;
      const isEdgeRow = isVisible && hasPartial && index === visibleCount - 1;

      row.hidden = !isVisible;
      row.classList.toggle("is-limit-edge", isEdgeRow);
    });

    if (displayElement) {
      displayElement.textContent = `${formatLimitValue(limit)} мест`;
    }
  });
}

function getDurabilityColor(value) {
  const minValue = 1;
  const maxValue = 8;
  const clampedValue = Math.min(maxValue, Math.max(minValue, value));
  const progress = (clampedValue - minValue) / (maxValue - minValue);

  const start = { r: 140, g: 140, b: 140 };
  const end = { r: 255, g: 208, b: 92 };

  const red = Math.round(start.r + (end.r - start.r) * progress);
  const green = Math.round(start.g + (end.g - start.g) * progress);
  const blue = Math.round(start.b + (end.b - start.b) * progress);

  return `rgb(${red}, ${green}, ${blue})`;
}

function parseEquipmentCondition(value) {
  const match = String(value).trim().match(/^\s*(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)\s*$/);

  if (!match) {
    return {
      current: null,
      max: null,
    };
  }

  return {
    current: Number.parseFloat(match[1].replace(",", ".")),
    max: Number.parseFloat(match[2].replace(",", ".")),
  };
}

function syncDurabilityFields() {
  const durabilityFields = [...document.querySelectorAll("[data-durability-tone]")];

  durabilityFields.forEach((field) => {
    const match = String(field.value).trim().match(/^\s*\d+\s*\/\s*(\d+(?:[.,]\d+)?)\s*$/);

    if (!match) {
      field.classList.remove("is-toned");
      field.style.removeProperty("--durability-color");
      return;
    }

    const durabilityValue = Number.parseFloat(match[1].replace(",", "."));

    if (!Number.isFinite(durabilityValue)) {
      field.classList.remove("is-toned");
      field.style.removeProperty("--durability-color");
      return;
    }

    field.classList.add("is-toned");
    field.style.setProperty("--durability-color", getDurabilityColor(durabilityValue));
  });
}

function syncEquipmentProperties() {
  equipmentPropertiesContainers.forEach((container) => {
    const rows = [...container.querySelectorAll(".equipment-properties__row")];

    rows.forEach((row, rowIndex) => {
      const equipmentIndex = rowIndex + 1;
      const equipmentFieldKey = `equipment_${equipmentIndex}`;
      const conditionFieldKey = `equipmentCondition_${equipmentIndex}`;
      const equipmentRow = document.querySelector(`[data-field="${equipmentFieldKey}"]`)?.closest(".line-list__row");
      const equipmentName = String(
        state.fields[equipmentFieldKey] ?? document.querySelector(`[data-field="${equipmentFieldKey}"]`)?.value ?? "",
      ).trim();
      const conditionValue = String(
        state.fields[conditionFieldKey] ?? document.querySelector(`[data-field="${conditionFieldKey}"]`)?.value ?? "",
      ).trim();
      const parsedCondition = parseEquipmentCondition(conditionValue);
      const maxQuality = Math.max(0, Math.floor(parsedCondition.max || 0));
      const basePairCount = Math.max(0, maxQuality - 1);
      const largeStateKey = `equipmentTraitLarge_${equipmentIndex}`;
      const isLarge = Boolean(state.fields[largeStateKey]);
      const pairCount = Math.min(
        Number(container.dataset.maxPairs || 0),
        Math.max(0, basePairCount * (isLarge ? 2 : 1)),
      );
      const isVisible = Boolean(equipmentName) && basePairCount > 0 && !equipmentRow?.hidden;
      const toggle = row.querySelector(".equipment-properties__toggle");
      const nameElement = row.querySelector(".equipment-properties__name");
      const pairs = [...row.querySelectorAll(".equipment-properties__pair")];

      row.hidden = !isVisible;

      if (toggle) {
        toggle.classList.toggle("is-active", isLarge);
        toggle.setAttribute("aria-pressed", String(isLarge));
      }

      if (nameElement) {
        nameElement.textContent = equipmentName;
      }

      pairs.forEach((pair, pairIndex) => {
        pair.hidden = !isVisible || pairIndex >= pairCount;
      });
    });
  });
}

function getBodyMaxValue() {
  const rawValue = state.fields.bodyMax ?? document.querySelector('[data-field="bodyMax"]')?.value ?? "";
  return Math.max(0, Number.parseInt(String(rawValue), 10) || 0);
}

function parseResourceEntry(value) {
  const match = String(value).trim().match(/^(?:(\d+)\.\s*)?(.*?)(\d+)\s*\/\s*(\d+)\s*$/);

  if (!match) {
    return {
      slotIndex: null,
      name: String(value).trim(),
      amount: null,
      max: null,
    };
  }

  return {
    slotIndex: Number.parseInt(match[1], 10) || null,
    name: match[2].trim(),
    amount: Number.parseInt(match[3], 10),
    max: Number.parseInt(match[4], 10),
  };
}

function formatResourceEntry(name, amount, maxBody, slotIndex = null) {
  const trimmedName = String(name).trim();

  if (!trimmedName) {
    return "";
  }

  const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 1;
  const prefix = Number.isFinite(slotIndex) ? `${slotIndex}. ` : "";

  return `${prefix}${trimmedName} ${safeAmount}/${Math.max(0, maxBody)}`;
}

function syncTransferButtons() {
  const transferButtons = [...document.querySelectorAll("[data-transfer-target=\"resource\"]")];

  transferButtons.forEach((button) => {
    const stateKey = button.dataset.transferStateKey;
    if (!stateKey) {
      button.classList.remove("is-active");
      button.setAttribute("aria-pressed", "false");
      return;
    }

    const isActive = Boolean(state.fields[stateKey]);
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function getTransferredEquipmentItems() {
  const transferButtons = [...document.querySelectorAll("[data-transfer-target=\"resource\"]")];
  const items = [];

  transferButtons.forEach((button) => {
    const stateKey = button.dataset.transferStateKey;
    const sourceField = button.dataset.transferSourceField;
    if (!stateKey || !sourceField) {
      return;
    }

    const isActive = Boolean(state.fields[stateKey]);
    const text = String(
      state.fields[sourceField] ?? document.querySelector(`[data-field="${sourceField}"]`)?.value ?? "",
    ).trim();
    const slotIndex = Number.parseInt(sourceField.split("_").pop() || "0", 10) || null;
    const isHidden = button.closest(".line-list__row")?.hidden;

    if (isActive && text && !isHidden) {
      items.push({ name: text, slotIndex });
    }
  });

  return items.sort((left, right) => (left.slotIndex ?? 0) - (right.slotIndex ?? 0));
}

function syncResourceControlStates() {
  const steppers = [...document.querySelectorAll(".resource-stepper")];

  steppers.forEach((stepper) => {
    const buttons = [...stepper.querySelectorAll("[data-resource-step-field]")];
    const fieldKey = buttons[0]?.dataset.resourceStepField;
    const field = fieldKey ? document.querySelector(`[data-field="${fieldKey}"]`) : null;
    const parsed = parseResourceEntry(field?.value ?? "");
    const hasEntry = Boolean(parsed.name) && Number.isFinite(parsed.amount) && Number.isFinite(parsed.max);

    stepper.classList.toggle("is-empty", !hasEntry);

    buttons.forEach((button) => {
      const step = Number.parseInt(button.dataset.resourceStep || "0", 10);
      const nextAmount = (parsed.amount ?? 0) + step;
      button.disabled = !hasEntry || nextAmount < 0 || nextAmount > (parsed.max ?? 0);
    });
  });
}

function stepResourceField(fieldKey, step) {
  const field = document.querySelector(`[data-field="${fieldKey}"]`);

  if (!field) {
    return;
  }

  const parsed = parseResourceEntry(field.value);

  if (!parsed.name || !Number.isFinite(parsed.amount) || !Number.isFinite(parsed.max)) {
    return;
  }

  const nextAmount = Math.min(parsed.max, Math.max(0, parsed.amount + step));

  if (nextAmount === parsed.amount) {
    return;
  }

  const nextValue = formatResourceEntry(parsed.name, nextAmount, parsed.max, parsed.slotIndex);
  field.value = nextValue;
  state.fields[fieldKey] = nextValue;
  return syncAndPersist("Ресурс обновлен и сохранен.");
}

function syncResourceTransfers() {
  const resourceContainer = document.querySelector('[data-prefix="resource"]');
  const resourceInputs = resourceContainer
    ? [...resourceContainer.querySelectorAll("[data-field^=\"resource_\"]")]
    : [];
  const maxBody = getBodyMaxValue();
  const transferredItems = getTransferredEquipmentItems();
  const amountBySlotIndex = new Map();

  syncTransferButtons();

  resourceInputs.forEach((input) => {
    const existingEntry = parseResourceEntry(state.fields[input.dataset.field] ?? input.value ?? "");

    if (Number.isFinite(existingEntry.slotIndex) && Number.isFinite(existingEntry.amount)) {
      amountBySlotIndex.set(existingEntry.slotIndex, existingEntry.amount);
    }
  });

  resourceInputs.forEach((input, index) => {
    const nextResource = transferredItems[index] || null;
    const nextValue = nextResource
      ? formatResourceEntry(
          nextResource.name,
          amountBySlotIndex.get(nextResource.slotIndex),
          maxBody,
          nextResource.slotIndex,
        )
      : "";

    input.dataset.sourceSlotIndex = nextResource?.slotIndex ? String(nextResource.slotIndex) : "";
    input.value = nextValue;
    input.classList.toggle("is-generated", Boolean(nextValue));
    state.fields[input.dataset.field] = nextValue;
  });

  syncResourceControlStates();
}

function hydrateFields() {
  fieldElements.forEach((element) => {
    const key = element.dataset.field;
    const defaultValue = element.dataset.defaultValue || "";
    const handleFieldUpdate = () => {
      state.fields[key] = element.value;
      syncAndPersist();
    };

    element.value = state.fields[key] || defaultValue;

    element.addEventListener("input", handleFieldUpdate);
    element.addEventListener("change", handleFieldUpdate);
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

    Object.entries(parsed.links || {}).forEach(([key, value]) => {
      if (key.startsWith("equipmentResource_")) {
        state.fields[key] = Boolean(value);
      }
    });

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
    const defaultValue = element.dataset.defaultValue || "";
    element.value = defaultValue;
  });

  Object.keys(state.fields).forEach((key) => {
    state.fields[key] = "";
  });
  fieldElements.forEach((element) => {
    if (element.dataset.defaultValue) {
      state.fields[element.dataset.field] = element.dataset.defaultValue;
    }
  });

  trackElements.forEach((trackElement) => {
    const trackName = trackElement.dataset.track;
    const count = Number(trackElement.dataset.count || 0);
    state.tracks[trackName] = Array.from({ length: count }, () => false);
    createDots(trackElement);
  });

  return syncAndPersist("Лист очищен.");
}

loadState();
initializeTheme();
trackElements.forEach(createDots);
hydrateFields();
resetButton?.addEventListener("click", resetSheet);
themeToggleButton?.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  storeTheme(nextTheme);
});
exportJsonButton?.addEventListener("click", exportStateAsJson);
syncUiState();
window.addEventListener("beforeunload", () => {
  writeStorage();
});
