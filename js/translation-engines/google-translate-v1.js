"use strict";

import { TranslationEngine } from "./translation-engine.js";

const API_KEY = "AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520";

function getLanguageList() {
  return [
    "ab",
    "ace",
    "ach",
    "aa",
    "af",
    "sq",
    "alz",
    "am",
    "ar",
    "hy",
    "as",
    "av",
    "awa",
    "ay",
    "az",
    "ban",
    "bal",
    "bm",
    "bci",
    "ba",
    "eu",
    "btx",
    "bts",
    "bbc",
    "be",
    "bem",
    "bn",
    "bew",
    "bho",
    "bik",
    "bs",
    "br",
    "bg",
    "bua",
    "yue",
    "ca",
    "ceb",
    "ch",
    "ce",
    "ny",
    "zh-HANS",
    "zh-HANT",
    "chk",
    "cv",
    "co",
    "crh",
    "crh-Latn",
    "hr",
    "cs",
    "da",
    "prs",
    "dv",
    "din",
    "doi",
    "dov",
    "nl",
    "dyu",
    "dz",
    "en",
    "eo",
    "et",
    "ee",
    "fo",
    "fj",
    "tl",
    "fi",
    "fon",
    "fr",
    "fr-CA",
    "fy",
    "fur",
    "ff",
    "gaa",
    "gl",
    "ka",
    "de",
    "el",
    "gn",
    "gu",
    "ht",
    "cnh",
    "ha",
    "haw",
    "he",
    "hil",
    "hi",
    "hmn",
    "hu",
    "hrx",
    "iba",
    "is",
    "ig",
    "ilo",
    "id",
    "iu-Latn",
    "iu",
    "ga",
    "it",
    "jam",
    "ja",
    "jv",
    "kac",
    "kl",
    "kn",
    "kr",
    "pam",
    "kk",
    "kha",
    "km",
    "cgg",
    "kg",
    "rw",
    "ktu",
    "trp",
    "kv",
    "gom",
    "ko",
    "kri",
    "ku",
    "ckb",
    "ky",
    "lo",
    "ltg",
    "la",
    "lv",
    "lij",
    "li",
    "ln",
    "lt",
    "lmo",
    "lg",
    "luo",
    "lb",
    "mk",
    "mad",
    "mai",
    "mak",
    "mg",
    "ms",
    "ms-Arab",
    "ml",
    "mt",
    "mam",
    "gv",
    "mi",
    "mr",
    "mh",
    "mwr",
    "mfe",
    "chm",
    "mni-Mtei",
    "min",
    "lus",
    "mn",
    "my",
    "nhe",
    "ndc-ZW",
    "nr",
    "new",
    "ne",
    "bm-Nkoo",
    "no",
    "nus",
    "oc",
    "or",
    "om",
    "os",
    "pag",
    "pap",
    "ps",
    "fa",
    "pl",
    "pt",
    "pt-PT",
    "pa",
    "pa-Arab",
    "qu",
    "kek",
    "rom",
    "ro",
    "rn",
    "ru",
    "se",
    "sm",
    "sg",
    "sa",
    "sat-Latn",
    "sat",
    "gd",
    "nso",
    "sr",
    "st",
    "crs",
    "shn",
    "sn",
    "scn",
    "szl",
    "sd",
    "si",
    "sk",
    "sl",
    "so",
    "es",
    "su",
    "sus",
    "sw",
    "ss",
    "sv",
    "ty",
    "tg",
    "ber-Latn",
    "ber",
    "ta",
    "tt",
    "te",
    "tet",
    "th",
    "bo",
    "ti",
    "tiv",
    "tpi",
    "to",
    "lua",
    "ts",
    "tn",
    "tcy",
    "tum",
    "tr",
    "tk",
    "tyv",
    "ak",
    "udm",
    "uk",
    "ur",
    "ug",
    "uz",
    "ve",
    "vec",
    "vi",
    "war",
    "cy",
    "wo",
    "xh",
    "sah",
    "yi",
    "yo",
    "yua",
    "zap",
    "zu"
  ];
}

export class GoogleTranslateV1Translator extends TranslationEngine {
  static getSourceLanguageList() {
    return getLanguageList();
  }

  static getTargetLanguageList() {
    return getLanguageList();
  }

  static getAutoTranslationCode() {
    return "auto";
  }

  createTranslationRequest(text, sourceLanguage, targetLanguage, useAPIKey) {
    if (useAPIKey) {
      const url = "https://translate-pa.googleapis.com/v1/translateHtml";
      const body = `[[["${text.replaceAll(`"`, `\\"`)}"],"${sourceLanguage}","${targetLanguage}"],"wt_lib"]`;
      const headers = new Headers({
        "X-Goog-API-Key": API_KEY,
        "Content-Type": "application/json+protobuf"
      });
      return new Request(url, { method: "POST", body: body, headers: headers });
    } else {
      const url = String.raw`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
      return new Request(url, { method: "GET" });
    }
  }

  async fetchTranslationRequest(request, useAPIKey) {
    const decodeHTML = html => {
      const txt = new DOMParser().parseFromString(html, "text/html");
      return txt.documentElement.textContent;
    };

    const isValid = json => {
      return useAPIKey ? json.length !== 0 : json.length !== 0 && json[0].length !== 0;
    };

    const getTranslatedText = json => {
      let translatedText = "";

      if (useAPIKey) {
        translatedText = decodeHTML(json[0].join(" "));
      } else {
        for (let line of json[0]) {
          if (line.length === 0) {
            console.warn("Google Translate V1: Response line is empty. Skipping...");
          }

          translatedText += line[0];
        }
      }

      return translatedText;
    };

    return fetch(request)
      .then(response => {
        if (response.status !== 200) {
          throw new Error(
            "Google Translate V1: Could not retrieve translation response. Maybe your API limit is reached? Please try again later."
          );
        }

        return response.json();
      })
      .then(json => {
        if (!isValid(json)) {
          console.warn("Google Translate V1: Response is empty. Returning empty translated string...");
          return "";
        }

        return getTranslatedText(json);
      });
  }

  async translateWithAPIKey(text, sourceLanguage, targetLanguage) {
    const request = this.createTranslationRequest(text, sourceLanguage, targetLanguage, true);
    return this.fetchTranslationRequest(request, true);
  }

  async translateWithoutAPIKey(text, sourceLanguage, targetLanguage) {
    const request = this.createTranslationRequest(text, sourceLanguage, targetLanguage, false);
    return this.fetchTranslationRequest(request, false);
  }

  async translate(text, sourceLanguage, targetLanguage) {
    return this.translateWithAPIKey(text, sourceLanguage, targetLanguage).catch(() => {
      console.info("Couldn't use Google Translate V1 with API key. Proceeding without...");
      return this.translateWithoutAPIKey(text, sourceLanguage, targetLanguage);
    });
  }
}
