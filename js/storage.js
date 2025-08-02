"use strict";

function handleError(e) {
  console.error(e);
}

export const settings = {
  async getTranslationEnabled() {
    return browser.storage.local.get({ translationEnabled: true }).then(result => result.translationEnabled, handleError);
  },
  async getTargetLanguage() {
    return browser.storage.local.get({ targetLanguage: "en" }).then(result => result.targetLanguage, handleError);
  },
  async getNotificationsEnabled() {
    return browser.storage.local.get({ notificationsEnabled: true }).then(result => result.notificationsEnabled, handleError);
  },
  async getTheme() {
    return browser.storage.local.get({ theme: "light dark" }).then(result => result.theme, handleError);
  },
  async setTranslationEnabled(value) {
    return browser.storage.local.set({ translationEnabled: value }).catch(handleError);
  },
  async setTargetLanguage(value) {
    return browser.storage.local.set({ targetLanguage: value }).catch(handleError);
  },
  async setNotificationsEnabled(value) {
    return browser.storage.local.set({ notificationsEnabled: value }).catch(handleError);
  },
  async setTheme(value) {
    return browser.storage.local.set({ theme: value }).catch(handleError);
  }
};

export const status = {
  async getShowProgress() {
    return browser.storage.session.get({ statusShowProgress: false }).then(result => result.statusShowProgress, handleError);
  },
  async getProgress() {
    return browser.storage.session.get({ statusProgress: 0 }).then(result => result.statusProgress, handleError);
  },
  async getIsTranslating() {
    return browser.storage.session.get({ statusIsTranslating: false }).then(result => result.statusIsTranslating, handleError);
  },
  async setShowProgress(value) {
    return browser.storage.session.set({ statusShowProgress: value }).catch(handleError);
  },
  async setProgress(value) {
    return browser.storage.session.set({ statusProgress: value }).catch(handleError);
  },
  async setIsTranslating(value) {
    return browser.storage.session.set({ statusIsTranslating: value }).catch(handleError);
  }
};
