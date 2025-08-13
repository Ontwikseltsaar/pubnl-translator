"use strict";

const lightDark = {
  id: "light dark",
  image: "/icons/font-awesome/circle-half-stroke.svg",
  isDark: window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches,
  text: browser.i18n.getMessage("popupDefault")
};

const light = {
  id: "light",
  image: "/icons/font-awesome/sun.svg",
  isDark: false,
  text: browser.i18n.getMessage("popupLight")
};

const dark = {
  id: "dark",
  image: "/icons/font-awesome/moon.svg",
  isDark: true,
  text: browser.i18n.getMessage("popupDark")
};

const themes = [lightDark, light, dark];

function displayThemeFooter(theme) {
  document.getElementById("theme-button").innerText = theme.text;

  let themeImage = document.getElementById("theme-image");
  themeImage.src = theme.image;
  themeImage.alt = `${theme.text} theme`;
}

function setColorScheme(id) {
  document.documentElement.style.setProperty("color-scheme", id);
}

function displayThemeImages(isDark) {
  isDark ? document.body.classList.add("dark") : document.body.classList.remove("dark");
}

export function getNextTheme(id) {
  return themes[(themes.findIndex(theme => theme.id === id) + 1) % themes.length].id;
}

export function displayTheme(id, hasFooter) {
  const theme = themes.find(theme => theme.id === id);

  setColorScheme(theme.id);
  displayThemeImages(theme.isDark);

  if (hasFooter) {
    displayThemeFooter(theme);
  }
}
