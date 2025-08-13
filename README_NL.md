Read this in [English](README.md).

# PubNL Translator

PubNL Translator is een Firefox-extensie waarmee je content van de [NPO](https://nl.wikipedia.org/wiki/Stichting_Nederlandse_Publieke_Omroep) kunt bekijken met ondertitels in een andere taal dan het Nederlands. Ondertitels worden vertaald met Google Translate en kunnen worden vertaald naar elke taal die Google Translate ondersteunt.

## ⚙️ Installatie

De aanbevolen manier om PubNL Translator te installeren is via de Firefox Extensions-website: [Download PubNL Translator](https://addons.mozilla.org/nl/firefox/addon/pubnl-translator).

Je kunt ook het meest recente .xpi-bestand [hier](https://github.com/Ontwikseltsaar/pubnl-translator/releases/latest) downloaden en deze handmatig installeren.

## 📝 Hoe gebruik je PubNL Translator

1. Installeer de extensie.
2. Bekijk een video op een ondersteunde NPO-website.
3. Zorg ervoor dat de ondertitels aan staan.

Standaard vertaalt PubNL Translator ondertitels naar het Engels, maar dit kan worden gewijzigd naar elke taal die Google Translate ondersteunt.

PubNL Translator werkt alleen voor video's die al ondertitels bevatten.

## 💡 Welke NPO-websites worden ondersteund?

Met PubNL Translator kan je vertaalde NPO-content bekijken op de volgende websites:

- [npo.nl](https://npo.nl/).
- [npokennis.nl](https://npokennis.nl/).
- [schooltv.nl](https://schooltv.nl/).
- [www.bvn.tv](https://www.bvn.tv/).
- [www.npodoc.nl](https://www.npodoc.nl/).
- [www.zapp.nl](https://www.zapp.nl/).
- [www.zappelin.nl](https://www.zappelin.nl/).

## 📅 Toekomstplannen

Hier zijn een paar dingen die ik in de toekomst hoop toe te voegen:

- Ondersteuning voor meer vertaaldiensten, zoals Bing en Google Translate V2.
- Ondersteuning voor meer browsers. Dit is misschien onrealistisch, aangezien andere browsers (met name Chrome) de mogelijkheden beperken waarop ontwikkelaars netwerkverzoeken kunnen onderscheppen. Dat is precies wat PubNL Translator nodig heeft om ondertitels in de video te vertalen.
- Vertaalde ondertitels tegelijk weergeven met de oorspronkelijke ondertitels.

## 🚫 Beperkingen

Dit zijn een paar dingen die PubNL Translator niet kan en waarvan ik niet verwacht dat het dat in de toekomst wel zal kunnen:

- Elke regel wordt apart vertaald, waardoor de context verloren kan gaan bij de vertaling.
- PubNL Translator kan geen live-uitzendingen vertalen.
- PubNL Translator is afhankelijk van de oorspronkelijke ondertitels van een video. Als er oorspronkelijk geen ondertitels waren, zullen er geen vertaalde ondertitels zijn, en als de timing van de oorspronkelijke ondertitels niet klopt, zal de timing van de vertaalde ondertitels ook niet kloppen.

## 🙏 Dankbetuigingen

PubNL Translator gebruikt de volgende externe afhankelijkheden:

- [Font Awesome](https://fontawesome.com/) door Font Awesome Team.
- [Google Fonts](https://fonts.google.com/) door Google.
- [vtt.js](https://github.com/mozilla/vtt.js) door Mozilla.
- [JSZip](https://stuk.github.io/jszip/) door Stuart Knightley.
