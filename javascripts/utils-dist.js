"use strict";

var extractTransliteration = function extractTransliteration(text) {
  var lines = text.split("\n");
  var transliterationLines = [];

  _(lines).each(function (line) {
    if (line.match(/^[A-Z][ ]*\d*$/)) return; // Page number

    if (line.match(/[ÂĀÊĒÎĪÔŌṐÛŪâāêēîīôōûūf1-9\,\;\.\:\!\?\*\_\(\)]/)) return; // Translation line

    transliterationLines.push(line);
  });

  return transliterationLines.join("\n");
};