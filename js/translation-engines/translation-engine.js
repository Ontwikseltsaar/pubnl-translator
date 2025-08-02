"use strict";

export class TranslationEngine {
  constructor() {
    if (this.constructor === TranslationEngine) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  static getSourceLanguageList() {
    throw new Error("Method 'getSourceLanguageList' must be implemented.");
  }

  static getTargetLanguageList() {
    throw new Error("Method 'getTargetLanguageList' must be implemented.");
  }

  static getAutoTranslationCode() {
    throw new Error("Method 'getAutoTranslationCode' must be implemented.");
  }

  translate(text, sourceLanguage, targetLanguage) {
    throw new Error("Method 'translate' must be implemented.");
  }
}
