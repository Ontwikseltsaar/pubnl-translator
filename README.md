Lees dit in het [Nederlands](README_NL.md).

# PubNL Translator

PubNL Translator is a Firefox extension that allows you to watch content by [NPO](https://en.wikipedia.org/wiki/Nederlandse_Publieke_Omroep_%28organisation%29) with subtitles in a language other than Dutch. Subtitles are translated using Google Translate and can be translated to any language it supports.

## ⚙️ Installation

The recommended way to install PubNL Translator is from the Firefox Extensions website: [Get PubNL Translator](https://addons.mozilla.org/en-US/firefox/addon/pubnl-translator).

Alternatively, you can download the most recent .xpi file [here](https://github.com/Ontwikseltsaar/pubnl-translator/releases/latest) and install it manually.

## 📝 How to use PubNL Translator

1. Install the extension.
2. Start watching any video on a supported NPO website.
3. Make sure to enable the subtitles.

By default, PubNL Translator will translate subtitles into English, but this can be changed to any language that Google Translate supports.

PubNL Translator will only work for videos that already have subtitles.

## 💡 What NPO websites are supported?

Using PubNL Translator, you can watch translated NPO content on the following websites:

- [npo.nl](https://npo.nl/).
- [npokennis.nl](https://npokennis.nl/).
- [schooltv.nl](https://schooltv.nl/).
- [www.bvn.tv](https://www.bvn.tv/).
- [www.npodoc.nl](https://www.npodoc.nl/).
- [www.zapp.nl](https://www.zapp.nl/).
- [www.zappelin.nl](https://www.zappelin.nl/).

## 📅 What's next?

Here are some things I hope to add in the future:

- Support for more translation engines, e.g. Bing, Google Translate V2.
- Support for more browsers. This might be a long shot, since other browsers (particularly Chrome) try to limit the ways in which developers can intercept network requests, which is exactly what PubNL Translator needs to do to do in-place subtitle translation.
- Adding translated subtitles alongside the original subtitles.

## 🚫 Limitations

Here are some things that PubNL Translator is not able to do, and which I don't expect it to be able to do in the future:

- Each line is translated separately, so the context may get lost in translation.
- PubNL Translator cannot translate live broadcasts.
- PubNL Translator depends on the original subtitles of a video. If there were no subtitles originally, there will be no translated subtitles. Likewise, if the timing of the original subtitles is off, the timing of the translated subtitles will be off as well.

## 🙏 Acknowledgments

PubNL Translator uses the following external dependencies:

- [Font Awesome](https://font-awesome.com/) by Font Awesome Team.
- [Google Fonts](https://fonts.google.com/) by Google.
- [vtt.js](https://github.com/mozilla/vtt.js) by Mozilla.
- [JSZip](https://stuk.github.io/jszip/) by Stuart Knightley.
