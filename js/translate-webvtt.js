"use strict";

import { GoogleTranslateV1Translator } from "./translation-engines/google-translate-v1.js";

const LINE_LENGTH_CUTOFF = 35;
const BATCH_SIZE = 5;

function getFormattedChunk(remainder) {
  const hasFormattingRegex = RegExp("(<.+?>).*?</.+?>");
  const startsUnformattedRegex = RegExp("^([^<].*?)<.+?>.*?</.+?>");
  const tagNameRegex = RegExp("^<([a-zA-Z0-9]+)");

  let formattingMatch = remainder.text.match(hasFormattingRegex);
  let chunk = { text: "", tag: { open: "", close: "" } };

  // If the line contains no (correctly) formatted chunk, we return the entire line.
  if (!formattingMatch) {
    chunk.text = remainder.text;
    remainder.text = "";

    return chunk;
  }

  // If the line doesn't start with formatting, return the chunk before the formatting.
  let unformatted = remainder.text.match(startsUnformattedRegex);
  if (unformatted) {
    chunk.text = unformatted[1];
    remainder.text = remainder.text.substring(unformatted[1].length);
    return chunk;
  }

  // We extract all consecutive parts that have the same formatting.
  chunk.tag = { open: formattingMatch[1], close: `</${formattingMatch[1].match(tagNameRegex)[1]}>` };
  const formattedChunkRegex = RegExp(String.raw`^(${chunk.tag.open}.*?${chunk.tag.close}\s*)`);
  for (;;) {
    let chunkMatch = remainder.text.match(formattedChunkRegex);

    if (!chunkMatch) {
      break;
    }

    chunk.text += chunkMatch[1];
    remainder.text = remainder.text.substring(chunkMatch[1].length);
  }

  // If no formatted chunk was extract after all, return everything.
  if (chunk.text.length === 0) {
    chunk = { text: remainder.text, tag: { open: "", close: "" } };
    remainder.text = "";

    console.warn(`Expected formatted chunk not found. Returning the entire text: ${chunk.text}`);
  }

  // Remove formatting.
  chunk.text = chunk.text.replaceAll(`${chunk.tag.open}`, "").replaceAll(`${chunk.tag.close}`, "");

  return chunk;
}

function splitLongText(text) {
  if (text.length > LINE_LENGTH_CUTOFF) {
    const halfLength = Math.floor(text.length / 2);
    let splitLocation = text.substring(halfLength).indexOf(" ");

    if (splitLocation !== -1) {
      splitLocation += halfLength;

      return [text.substring(0, splitLocation), text.substring(splitLocation + 1)];
    } else {
      splitLocation = text.substring(0, halfLength).lastIndexOf(" ");

      if (splitLocation !== -1) {
        return [text.substring(0, splitLocation), text.substring(splitLocation + 1)];
      }

      return [text];
    }
  }

  return [text];
}

function extractChunksFromCue(text) {
  let remainder = { text: text.replaceAll("\n", " ") };
  let chunks = [];

  while (remainder.text.length > 0) {
    const chunk = getFormattedChunk(remainder);
    chunks.push(chunk);
  }

  return chunks;
}

async function translateCueBatch(translator, cueBatch, sourceLanguage, targetLanguage) {
  let translatedCueBatch = [];

  const markedText = cueBatch
    .flat()
    .map((text, i) => `[${i}] ${text}`)
    .join(" ");
  const translatedMarked = await translator.translate(markedText, sourceLanguage, targetLanguage);
  const markedRegex = RegExp(String.raw`\[(\d+)\]\s*`, "g");
  const matches = [...translatedMarked.matchAll(markedRegex)].sort((a, b) => parseInt(a[1]) - parseInt(b[1]));

  let correctlySorted = true;
  for (let i = 0; i < matches.length; i++) {
    if (parseInt(matches[i][1]) !== i) {
      correctlySorted = false;
      break;
    }
  }

  if (matches.length !== cueBatch.flat().length || !correctlySorted) {
    for (const cueTexts of cueBatch) {
      translatedCueBatch.push(cueTexts.map(async text => await translator.translate(text, sourceLanguage, targetLanguage)));
    }

    return translatedCueBatch;
  }

  let offset = 0;
  for (const cueTexts of cueBatch) {
    let result = [];

    for (let i = offset; i < offset + cueTexts.length; i++) {
      const start = matches[i].index + matches[i][0].length;
      const end = matches[i + 1]?.index ?? translatedMarked.length;
      result.push(translatedMarked.substring(start, end).trim());
    }

    translatedCueBatch.push(result);
    offset += cueTexts.length;
  }

  return translatedCueBatch;
}

function reassembleCue(chunks, translatedTexts) {
  let translatedCueLines = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const translated = translatedTexts[i] ?? "";
    let multiline = splitLongText(translated);

    for (let j = 0; j < multiline.length; j++) {
      multiline[j] = `${chunk.tag.open}${multiline[j]}${chunk.tag.close}`;
    }

    translatedCueLines.push(multiline.join("\n"));
  }

  return translatedCueLines.join("\n");
}

function cueToString(cue, text) {
  const startTime = new Date(Math.round(cue.startTime * 1000)).toISOString().match("T(.*)Z$")?.[1] ?? "";
  const endTime = new Date(Math.round(cue.endTime * 1000)).toISOString().match("T(.*)Z$")?.[1] ?? "";
  const line = cue.line ? ` line:${cue.line}%` : "";
  const position = cue.position ? ` position:${cue.position}%` : "";
  const align = cue.align ? ` align:${cue.align.replace("middle", "center")}` : "";

  return `${startTime} --> ${endTime}${line}${position}${align}\n${text}\n\n`;
}

function parseWebVTT(input) {
  // If the WebVTT doesn't end with two new lines, WebVTT.Parser won't parse the last cue.
  if (!input.endsWith("\n\n")) {
    input += "\n\n";
  }

  const parser = new WebVTT.Parser(window);
  // vtt.js requires us to use a decoder, but our input is already decoded. This decoder does nothing.
  parser.decoder = {
    decode(data, options) {
      return data;
    }
  };
  parser.onparsingerror = function (e) {
    parsingError = e;
  };
  parser.oncue = function (c) {
    cues.push(c);
  };

  let cues = [];
  let parsingError = null;
  parser.parse(input);
  if (parsingError) {
    throw parsingError;
  }

  return cues;
}

export async function translateWebVTT(input, sourceLanguage, targetLanguage, progressFunction) {
  const cues = parseWebVTT(input);
  const translator = new GoogleTranslateV1Translator();

  const cueChunks = cues.map(cue => extractChunksFromCue(cue.text));
  let translatedCues = [];

  for (let i = 0; i < cueChunks.length; i += BATCH_SIZE) {
    const cueBatch = cueChunks.slice(i, i + BATCH_SIZE).map(cue => cue.map(chunk => chunk.text));
    const translated = translateCueBatch(translator, cueBatch, sourceLanguage, targetLanguage);
    translatedCues.push(translated);
  }

  translatedCues = (await Promise.all(translatedCues)).flat();
  let translatedWebVTT = "WEBVTT\n\n";
  for (let i = 0; i < cues.length; i++) {
    const chunks = cueChunks[i];
    translatedWebVTT += cueToString(cues[i], reassembleCue(chunks, await Promise.all(translatedCues[i])));
    progressFunction(((i + 1) / cues.length) * 100);
  }

  return translatedWebVTT;
}
