"use strict";

import { settings, status } from "./storage.js";
import { translateWebVTT } from "./translate-webvtt.js";
import { GoogleTranslateV1Translator } from "./translation-engines/google-translate-v1.js";

const MEDIA_INFO_PATTERN = "https://prod.npoplayer.nl/stream-link";
const WEBVTT_ISO_PATTERN = "https://cdn.npoplayer.nl/subtitles/";
const WEBVTT_PATTERN = "https://cdn.npoplayer.nl/subtitles/*";
const SOURCE_LANGUAGE_FALLBACK = "nl";

const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();

function updateShowProgress(value) {
  status.setShowProgress(value);
  browser.runtime.sendMessage({ type: "showProgress", value: value }).catch(() => {});
}

function updateProgress(value) {
  status.setProgress(value);
  browser.runtime.sendMessage({ type: "updateProgress", value: value }).catch(() => {});
}

function updateIsTranslating(value) {
  status.setIsTranslating(value);
  browser.runtime.sendMessage({ type: "isTranslating", value: value }).catch(() => {});
}

async function conditionalNotify(url, type, name, displayLanguage) {
  settings.getNotificationsEnabled().then(enabled => {
    if (enabled) {
      let message;
      switch (type) {
        case "translating":
          message = browser.i18n.getMessage("notificationTranslating", displayLanguage);
          break;
        case "usingCached":
          message = browser.i18n.getMessage("notificationUsingCached", displayLanguage);
          break;
        case "usingOriginal":
          message = browser.i18n.getMessage("notificationUsingOriginal", displayLanguage);
          break;
        case "languageError":
          message = browser.i18n.getMessage("notificationLanguageError");
          break;
        case "translationError":
          message = browser.i18n.getMessage("notificationTranslationError", displayLanguage);
          break;
        default:
          console.error(`Can't process notification with type ${type}.`);
          return;
      }

      browser.notifications.create(`pubnl-translate-${url}`, {
        type: "basic",
        iconUrl: "icons/icon.svg",
        title: browser.i18n.getMessage("notificationTitle", name),
        message: message
      });
    }
  });
}

function hasOwnNested(obj, level, ...rest) {
  if (obj == null) {
    return false;
  }

  if (rest.length === 0 && Object.hasOwn(obj, level)) {
    return true;
  }

  return hasOwnNested(obj[level], ...rest);
}

function isStorable(mediaInfo) {
  return (
    hasOwnNested(mediaInfo, "assets", "subtitles", 0, "location") &&
    (hasOwnNested(mediaInfo, "metadata", "title") || hasOwnNested(mediaInfo, "metadata", "subTitle")) &&
    hasOwnNested(mediaInfo, "assets", "subtitles", 0, "iso")
  );
}

function combineTitles(title, subTitle) {
  if (title == null) {
    return subTitle;
  } else if (subTitle == null) {
    return title;
  } else {
    return `${title} - ${subTitle}`;
  }
}

async function retrieveMediaInfo(location) {
  const key = `mediaInfo-${location}`;
  return browser.storage.session.get(key).then(result => result[key]);
}

async function retrieveWebVTT(location, targetLanguage) {
  const key = `webVTT-${location}-${targetLanguage}`;
  return browser.storage.local.get(key).then(result => {
    return hasOwnNested(result, key, "content") ? result[key].content : null;
  });
}

function storeMediaInfo(mediaInfo, referrerURL) {
  const combinedTitle = combineTitles(mediaInfo.metadata.title, mediaInfo.metadata.subTitle);

  for (const subtitleInfo of mediaInfo.assets.subtitles) {
    const key = `mediaInfo-${subtitleInfo.location}`;

    browser.storage.session.set({
      [key]: {
        combinedTitle: combinedTitle,
        sourceLanguage: subtitleInfo.iso,
        mediaSource: referrerURL
      }
    });
  }
}

async function storeWebVTT(location, sourceLanguage, targetLanguage, webVTT) {
  const mediaInfo = await retrieveMediaInfo(location);

  const hasMediaSource = hasOwnNested(mediaInfo, "mediaSource");
  const hasCombinedTitle = hasOwnNested(mediaInfo, "combinedTitle");
  const isAuto = sourceLanguage === GoogleTranslateV1Translator.getAutoTranslationCode();

  const key = `webVTT-${location}-${targetLanguage}`;
  browser.storage.local.set({
    [key]: {
      combinedTitle: hasCombinedTitle ? mediaInfo.combinedTitle : "",
      language: targetLanguage,
      mediaSource: hasMediaSource ? mediaInfo.mediaSource : "",
      webVTTSource: location,
      sourceLanguage: isAuto ? "" : sourceLanguage,
      content: webVTT
    }
  });
}

async function determineSourceLanguage(location) {
  const sourceLanguageList = GoogleTranslateV1Translator.getSourceLanguageList();

  // Attempt 1: Use the media info.
  const mediaInfo = await retrieveMediaInfo(location);
  if (hasOwnNested(mediaInfo, "sourceLanguage") && sourceLanguageList.includes(mediaInfo.sourceLanguage)) {
    return mediaInfo.sourceLanguage;
  }

  // Attempt 2: Use the location.
  const truncatedLocation = location.replace(WEBVTT_ISO_PATTERN, "");
  const languageFromLocation = truncatedLocation.substring(0, truncatedLocation.indexOf("/"));
  if (sourceLanguageList.includes(languageFromLocation)) {
    return languageFromLocation;
  }

  // Attempt 3: Use auto-detection, if the translation engine supports it.
  const autoTranslationCode = GoogleTranslateV1Translator.getAutoTranslationCode();
  if (!!autoTranslationCode) {
    return autoTranslationCode;
  }

  // Attempt 4: Use fallback language.
  if (sourceLanguageList.includes(SOURCE_LANGUAGE_FALLBACK)) {
    return SOURCE_LANGUAGE_FALLBACK;
  }

  // Nothing worked.
  throw Error(`Source language of ${location} not detected or not supported.`);
}

async function determineDisplayTitle(location) {
  const mediaInfo = await retrieveMediaInfo(location);
  if (hasOwnNested(mediaInfo, "combinedTitle")) {
    return mediaInfo.combinedTitle;
  }

  return location;
}

function interceptWebVTT(requestDetails) {
  let filter = browser.webRequest.filterResponseData(requestDetails.requestId);
  let str = "";

  const writeAndClose = input => {
    filter.write(encoder.encode(input));
    filter.close();
  };

  filter.ondata = event => {
    str += decoder.decode(event.data, { stream: true });
  };
  filter.onstop = async event => {
    const translationEnabled = await settings.getTranslationEnabled();

    // If PubNL Translator is turned off or if we're trying to access the subtitles directly, don't do anything.
    if (!translationEnabled || requestDetails.documentUrl == null) {
      writeAndClose(str);
      return;
    }

    const targetLanguage = await settings.getTargetLanguage();
    const displayTitle = await determineDisplayTitle(requestDetails.url);
    const displayTargetLanguage = new Intl.DisplayNames([browser.i18n.getUILanguage()], {
      type: "language",
      languageDisplay: "standard"
    }).of(targetLanguage);
    const retrievedWebVTT = await retrieveWebVTT(requestDetails.url, targetLanguage);

    // If a cached subtitle was found, use it.
    if (!!retrievedWebVTT) {
      conditionalNotify(requestDetails.url, "usingCached", displayTitle, displayTargetLanguage);

      writeAndClose(retrievedWebVTT);
      return;
    }

    // If the source language can't be determined, use the original subtitles.
    let sourceLanguage;
    try {
      sourceLanguage = await determineSourceLanguage(requestDetails.url);
    } catch (e) {
      conditionalNotify(requestDetails.url, "languageError", displayTitle, null);
      console.warn(e);

      writeAndClose(str);
      return;
    }

    // If the source language is the same as the target language, use the original subtitles.
    if (sourceLanguage === targetLanguage) {
      conditionalNotify(requestDetails.url, "usingOriginal", displayTitle, displayTargetLanguage);

      writeAndClose(str);
      return;
    }

    // Translate the subtitles. If an error occurs, use the original subtitles.
    try {
      conditionalNotify(requestDetails.url, "translating", displayTitle, displayTargetLanguage);

      updateIsTranslating(true);
      updateProgress(0);
      updateShowProgress(true);

      const translatedWebVTT = await translateWebVTT(str, sourceLanguage, targetLanguage, updateProgress);

      await storeWebVTT(requestDetails.url, sourceLanguage, targetLanguage, translatedWebVTT);

      writeAndClose(translatedWebVTT);
    } catch (e) {
      console.error(e);
      conditionalNotify(requestDetails.url, "translationError", displayTitle, displayTargetLanguage);

      writeAndClose(str);
    } finally {
      updateShowProgress(false);
      updateProgress(0);
      updateIsTranslating(false);
    }
  };

  return requestDetails;
}

function getRequestBodyText(requestDetails) {
  return decoder.decode(requestDetails.requestBody.raw[0].bytes, { stream: true });
}

function interceptMediaInfo(requestDetails) {
  if (requestDetails.method === "POST") {
    let filter = browser.webRequest.filterResponseData(requestDetails.requestId);
    let str = "";

    filter.ondata = event => {
      str += decoder.decode(event.data, { stream: true });
    };
    filter.onstop = async event => {
      try {
        const mediaInfo = JSON.parse(str);

        if (isStorable(mediaInfo)) {
          const requestBodyText = getRequestBodyText(requestDetails);
          const mediaInfoRequest = JSON.parse(requestBodyText);
          storeMediaInfo(mediaInfo, mediaInfoRequest.referrerUrl);
        }
      } catch (e) {
        console.warn(`Could not intercept media info for ${requestDetails.url}: ${e}`);
      }

      filter.write(encoder.encode(str));
      filter.close();
    };
  }

  return requestDetails;
}

browser.webRequest.onBeforeRequest.addListener(interceptWebVTT, { urls: [WEBVTT_PATTERN] }, ["blocking"]);
browser.webRequest.onBeforeRequest.addListener(interceptMediaInfo, { urls: [MEDIA_INFO_PATTERN] }, ["blocking", "requestBody"]);

document.querySelectorAll("[data-i18n]").forEach(element => {
  element.innerText = browser.i18n.getMessage(element.dataset.i18n);
});
