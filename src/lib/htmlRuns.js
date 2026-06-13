// Extract font-tagged runs from pasted HTML (e.g. content copied from Word).
//
// When you copy formatted text from Word/LibreOffice, the clipboard carries an
// HTML flavour where each span declares its font via `style="font-family:…"`
// (or a legacy `<font face="…">`). We walk that tree, tracking the effective
// font for each text node, and produce [{ text, font }] for convertRuns().

function cleanFontFamily(value) {
  if (!value) return "";
  // first family in the list, stripped of quotes
  return value
    .split(",")[0]
    .replace(/["']/g, "")
    .trim();
}

function fontOf(el) {
  const style = el.getAttribute && el.getAttribute("style");
  if (style) {
    const m = style.match(/font-family\s*:\s*([^;]+)/i);
    if (m) return cleanFontFamily(m[1]);
  }
  if (el.tagName === "FONT" && el.getAttribute("face")) {
    return cleanFontFamily(el.getAttribute("face"));
  }
  return null;
}

const BLOCK = new Set(["P", "DIV", "BR", "LI", "TR", "H1", "H2", "H3", "H4"]);

function walk(node, inheritedFont, runs) {
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      // text node
      const text = child.nodeValue;
      if (text) runs.push({ text, font: inheritedFont || "" });
    } else if (child.nodeType === 1) {
      if (child.tagName === "BR") {
        runs.push({ text: "\n", font: "" });
        continue;
      }
      const font = fontOf(child) || inheritedFont;
      walk(child, font, runs);
      if (BLOCK.has(child.tagName)) runs.push({ text: "\n", font: "" });
    }
  }
}

export function htmlToRuns(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const runs = [];
  walk(doc.body, "", runs);
  return runs;
}
