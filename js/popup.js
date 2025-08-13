"use strict";

import { settings, status } from "./storage.js";
import { displayTheme, getNextTheme } from "./theme.js";
import { GoogleTranslateV1Translator } from "./translation-engines/google-translate-v1.js";

(async () => {
  const settingsAtOpen = {
    translationEnabled: settings.getTranslationEnabled(),
    targetLanguage: settings.getTargetLanguage()
  };

  document.getElementById("status-switch").addEventListener("change", async e => {
    await settings.setTranslationEnabled(e.target.checked);
    getActiveMessageName(null).then(messageName => {
      updateStatusText(browser.i18n.getMessage(messageName));
    });

    reloadNeeded().then(result => (result ? showStatusReload() : hideStatusReload()));
  });

  document.getElementById("target-languages-menu").addEventListener("change", e => {
    settings.setTargetLanguage(e.target.value).then(() => {
      reloadNeeded().then(result => (result ? showStatusReload() : hideStatusReload()));
    });
  });

  document.getElementById("notify-me-switch").addEventListener("change", e => {
    settings.setNotificationsEnabled(e.target.checked);
  });

  document.getElementById("theme-button").addEventListener("click", () => {
    settings.getTheme().then(theme => {
      const newTheme = getNextTheme(theme);

      settings.setTheme(newTheme).then(() => {
        displayTheme(newTheme, true);
      });
    });
  });

  async function reloadNeeded() {
    const translationEnabled = await settings.getTranslationEnabled();
    const targetLanguage = await settings.getTargetLanguage();
    return (
      (await settingsAtOpen.translationEnabled) !== translationEnabled ||
      (translationEnabled && (await settingsAtOpen.targetLanguage) !== targetLanguage)
    );
  }

  function disableTransitions() {
    document.body.classList.add("no-transition");
  }

  function triggerReflow() {
    document.body.offsetHeight;
  }

  function enableTransitions() {
    document.body.classList.remove("no-transition");
  }

  function showProgressBar() {
    document.getElementById("status-progress").style.visibility = "visible";
  }

  function hideProgressBar() {
    document.getElementById("status-progress").style.visibility = "hidden";
  }

  function updateProgressBar(percentage) {
    document.getElementById("status-progress").setAttribute("value", `${percentage}`);
    document.getElementById("status-progress").innerText = `${Math.round((percentage + Number.EPSILON) * 100) / 100}%`;
  }

  function updateStatusText(status) {
    document.getElementById("status-text").innerText = status;
  }

  function showStatusReload() {
    document.getElementById("status-reload").classList.remove("is-hidden");
  }

  function hideStatusReload() {
    document.getElementById("status-reload").classList.add("is-hidden");
  }

  async function getIdleMessageName() {
    return settings.getTranslationEnabled().then(enabled => (enabled ? "popupStatusReady" : "popupStatusOff"));
  }

  async function getActiveMessageName(isTranslatingOverride) {
    const isTranslating = isTranslatingOverride ?? (await status.getIsTranslating());

    return isTranslating ? "popupStatusTranslating" : await getIdleMessageName();
  }

  browser.runtime.onMessage.addListener(async m => {
    switch (m.type) {
      case "showProgress":
        m.value ? showProgressBar() : hideProgressBar();
        break;
      case "updateProgress":
        updateProgressBar(m.value);
        break;
      case "isTranslating":
        updateStatusText(browser.i18n.getMessage(await getActiveMessageName(m.value)));
        break;
      default:
        console.error(`Can't process message with type ${m.type} and value ${m.value}.`);
    }
  });

  async function updateStatus() {
    const showProgress = status.getShowProgress();
    const progress = status.getProgress();
    const messageName = getActiveMessageName(null);

    (await showProgress) ? showProgressBar() : hideProgressBar();
    updateProgressBar(await progress);
    updateStatusText(browser.i18n.getMessage(await messageName));
  }

  function createLanguageOption(language) {
    const option = document.createElement("option");

    option.value = language;
    option.innerText = new Intl.DisplayNames([browser.i18n.getUILanguage()], {
      type: "language",
      languageDisplay: "standard"
    }).of(language);

    return option;
  }

  function populateTargetLanguages() {
    const allTargetLanguages = GoogleTranslateV1Translator.getTargetLanguageList();
    let recognized = [];
    let unrecognized = [];

    for (const language of allTargetLanguages) {
      const option = createLanguageOption(language);

      if (option.innerText === language) {
        unrecognized.push(option);
      } else {
        recognized.push(option);
      }
    }

    recognized.sort((a, b) => a.innerText.localeCompare(b.innerText));
    unrecognized.sort((a, b) => a.innerText.localeCompare(b.innerText));

    let targetLanguagesElement = document.getElementById("target-languages-menu");
    targetLanguagesElement.replaceChildren(...recognized, ...unrecognized);
  }

  async function displayCurrentSettings() {
    disableTransitions();

    const translationEnabled = settings.getTranslationEnabled();
    const targetLanguage = settings.getTargetLanguage();
    const notificationsEnabled = settings.getNotificationsEnabled();

    document.getElementById("status-switch").checked = await translationEnabled;
    document.getElementById("target-languages-menu").querySelector(`option[value="${await targetLanguage}"]`).selected = true;
    document.getElementById("notify-me-switch").checked = await notificationsEnabled;

    triggerReflow();
    enableTransitions();
  }

  function displayVersion() {
    const version = browser.runtime.getManifest().version;
    const isUnlisted = (version.match(/\./g) || []).length === 3;
    document.getElementById("version-link").innerText = `v${isUnlisted ? version.substring(0, version.length - 2) : version}`;
  }

  function activatePage(e) {
    e.preventDefault();

    Array.from(document.getElementsByClassName("page")).forEach(panel => {
      panel.id === e.target.dataset.target ? panel.classList.remove("is-hidden") : panel.classList.add("is-hidden");
    });
  }

  const links = document.getElementsByTagName("a");
  Array.from(links).forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      browser.tabs.create({ url: e.target.href });
      window.close();
    });
  });

  const backButtons = document.querySelectorAll(".back-button");
  backButtons.forEach(button => {
    button.addEventListener("click", activatePage);
  });

  const aboutButton = document.getElementById("about-page-button");
  aboutButton.addEventListener("click", activatePage);

  document.getElementById("cached-subtitles-button").addEventListener("click", () => {
    browser.tabs.create({ url: "/html/cache.html" });
    window.close();
  });

  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.innerText = browser.i18n.getMessage(element.dataset.i18n);
  });

  document.getElementById("add-on-link").setAttribute("href", browser.i18n.getMessage("popupLeaveFeedbackURL"));

  populateTargetLanguages();
  await displayCurrentSettings();
  await updateStatus();
  displayVersion();
  displayTheme(await settings.getTheme(), true);
})();
