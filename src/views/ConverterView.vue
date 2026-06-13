<script setup>
import TibetanAnsiToUnicode, {
  convertRuns,
  docxToRuns,
  rtfToRuns,
  convertDocxDocument,
  convertRtfDocument,
  docxToBlocks,
  rtfToBlocks,
  defaultSizeScale,
} from "tibetan-ansi-to-unicode";
import { htmlToRuns } from "../lib/htmlRuns.js";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const FONTS = [
  { label: "Jomolhari", value: "Jomolhari" },
  { label: "Tibetan Machine Uni", value: "Tibetan Machine Uni" },
  { label: "DDC Uchen", value: "DDC Uchen" },
];
const selectedFont = ref(localStorage.getItem("uniFont") || "Jomolhari");
watch(selectedFont, (v) => localStorage.setItem("uniFont", v));

function effScale() {
  return defaultSizeScale(selectedFont.value);
}
const previewFont = computed(
  () => `"${selectedFont.value}", "Tibetan Machine Uni", "Jomolhari", "Noto Serif Tibetan", serif`
);

function prefersDark() {
  return typeof window !== "undefined" && window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
}
const saved = localStorage.getItem("darkMode");
const isDark = ref(saved === null ? prefersDark() : saved === "true");
let mql = null;
function onSystemThemeChange(e) {
  if (localStorage.getItem("darkMode") === null) isDark.value = e.matches;
}
onMounted(() => {
  if (window.matchMedia) {
    mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener?.("change", onSystemThemeChange);
  }
});
onBeforeUnmount(() => mql?.removeEventListener?.("change", onSystemThemeChange));

const isDragging = ref(false);
const copied = ref(false);
const note = ref("");
const result = ref(""); // plain Unicode (for copy / .txt)
const blocks = ref([]); // formatting-aware preview model
const sourceLabel = ref("");
const detectedFonts = ref([]);
const typing = ref(false);
const ansi = ref("");
const fileInput = ref(null);
const srcFile = ref(null); // { name, kind, buffer|text }
const building = ref(false);

const view = computed(() =>
  typing.value ? "typing" : result.value || sourceLabel.value ? "result" : "empty"
);

const EXAMPLE = `oe×ñÎ
>ë-{,-8ß:-bÜ-¹¥/-e$-020<Î
ýV-#è-<9-Zë$-ýë-:Î
μ¥-9ß-ýV-<ÜKÜ-oe×ñÎ`;

function convertPlain(text) {
  return text.split("\n").map((l) => new TibetanAnsiToUnicode(l).convert()).join("\n");
}
function textToBlocks(text) {
  return text.split("\n").map((line) => ({
    align: "left",
    runs: line ? [{ text: line, size: null, bold: false, italic: false }] : [],
  }));
}

function flash(msg) {
  note.value = msg;
  setTimeout(() => (note.value = ""), 3500);
}

async function handleFile(file) {
  const name = (file.name || "").toLowerCase();
  try {
    if (name.endsWith(".docx")) {
      const buf = await file.arrayBuffer();
      srcFile.value = { name: file.name, kind: "docx", buffer: buf };
      const runs = await docxToRuns(buf);
      finishImport(runs, await docxToBlocks(buf), file.name);
    } else if (name.endsWith(".rtf")) {
      const text = await file.text();
      srcFile.value = { name: file.name, kind: "rtf", text };
      finishImport(rtfToRuns(text), rtfToBlocks(text), file.name);
    } else {
      flash("Please drop a .docx or .rtf file");
    }
  } catch (e) {
    console.error(e);
    flash("Could not read that file");
  }
}

function finishImport(runs, blk, label) {
  const r = convertRuns(runs, { details: true });
  result.value = r.text;
  blocks.value = blk;
  detectedFonts.value = [...new Set(runs.map((x) => x.font).filter(Boolean))];
  sourceLabel.value = label;
  typing.value = false;
  ansi.value = "";
}

function onDrop(e) {
  e.preventDefault();
  isDragging.value = false;
  const f = e.dataTransfer?.files?.[0];
  if (f) handleFile(f);
}
function onDragOver(e) { e.preventDefault(); isDragging.value = true; }
function onDragLeave(e) { if (e.target === e.currentTarget) isDragging.value = false; }
function onPaste(e) {
  const html = e.clipboardData?.getData("text/html");
  if (html && /font-family|<font/i.test(html)) {
    const runs = htmlToRuns(html);
    if (runs.some((r) => r.font)) {
      e.preventDefault();
      srcFile.value = null;
      const r = convertRuns(runs, { details: true });
      result.value = r.text;
      blocks.value = textToBlocks(r.text);
      detectedFonts.value = [...new Set(runs.map((x) => x.font).filter(Boolean))];
      sourceLabel.value = "Pasted formatted text";
      typing.value = false;
      return;
    }
  }
  if (view.value === "empty") { typing.value = true; nextTick(() => onType()); }
}

function pickFile() { fileInput.value?.click(); }
function onFileChange(e) {
  const f = e.target.files?.[0];
  if (f) handleFile(f);
  e.target.value = "";
}
function onType() {
  result.value = convertPlain(ansi.value);
  blocks.value = textToBlocks(result.value);
}
function startTyping() { typing.value = true; }
function loadExample() { typing.value = true; ansi.value = EXAMPLE; onType(); }
function reset() {
  result.value = "";
  blocks.value = [];
  sourceLabel.value = "";
  detectedFonts.value = [];
  ansi.value = "";
  typing.value = false;
  srcFile.value = null;
}

function saveBlob(data, type, filename) {
  const blob = new Blob([data], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
async function downloadDocument() {
  if (!srcFile.value) return;
  building.value = true;
  try {
    const base = srcFile.value.name.replace(/\.(docx|rtf)$/i, "") + " (Unicode)";
    // The preview sizes runs in px; document sizes are in points. Convert so the
    // exported file renders at the same visual size as the preview (1pt = 96/72 px).
    const PT_PER_PX = 72 / 96;
    const opts = { unicodeFont: selectedFont.value, sizeScale: effScale() * PT_PER_PX };
    if (srcFile.value.kind === "docx") {
      const bytes = await convertDocxDocument(srcFile.value.buffer, opts);
      saveBlob(bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", base + ".docx");
    } else {
      const rtf = convertRtfDocument(srcFile.value.text, opts);
      saveBlob(rtf, "application/rtf", base + ".rtf");
    }
  } catch (e) {
    console.error(e);
    flash("Could not build the file");
  } finally {
    building.value = false;
  }
}
async function copy() {
  try {
    await navigator.clipboard.writeText(result.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1800);
  } catch (e) { console.error(e); }
}
function downloadTxt() {
  saveBlob(result.value, "text/plain;charset=utf-8", "tibetan-unicode.txt");
}
function toggleTheme() {
  isDark.value = !isDark.value;
  localStorage.setItem("darkMode", isDark.value);
}

function runStyle(run) {
  const s = {};
  const scale = effScale();
  if (run.size) s.fontSize = Math.round(run.size * scale) + "px";
  if (run.bold) s.fontWeight = "700";
  if (run.italic) s.fontStyle = "italic";
  return s;
}
const downloadLabel = computed(() =>
  building.value ? "Preparing…" : srcFile.value?.kind === "rtf" ? "Download RTF" : "Download Word"
);
</script>

<template>
  <div
    class="app"
    :data-theme="isDark ? 'dark' : 'light'"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @paste="onPaste"
  >
    <div v-if="isDragging && view !== 'empty'" class="veil">
      <div class="veil__box">
        <svg viewBox="0 0 24 24" class="ic-xl"><path d="M12 16V4m0 0 4 4m-4-4-4 4" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
        <p>Drop to convert</p>
      </div>
    </div>

    <header class="bar">
      <div class="brand"><span class="dot"></span>Tibetan&nbsp;<span class="muted">legacy → Unicode</span></div>
      <button class="icon-btn" @click="toggleTheme" :title="isDark ? 'Light mode' : 'Dark mode'">
        <svg v-if="isDark" viewBox="0 0 24 24" class="ic"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></svg>
        <svg v-else viewBox="0 0 24 24" class="ic"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
      </button>
    </header>

    <main class="wrap">
      <!-- EMPTY -->
      <template v-if="view === 'empty'">
        <h1 class="title">Convert old Tibetan fonts to Unicode</h1>
        <p class="sub">Drop a Word or RTF file — the original font of every character is used to decode it, so mixed scripts and Sanskrit stacks come out right.</p>
        <div class="drop" :class="{ active: isDragging }" @click="pickFile">
          <input ref="fileInput" type="file" accept=".docx,.rtf" hidden @change="onFileChange" />
          <svg viewBox="0 0 24 24" class="ic-xl"><path d="M12 16V4m0 0 4 4m-4-4-4 4" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
          <p class="drop__title">Drag &amp; drop a <b>.docx</b> or <b>.rtf</b></p>
          <button class="pill" @click.stop="pickFile">Choose a file</button>
          <p class="drop__hint">or paste formatted text (⌘/Ctrl + V) · <a href="#" @click.prevent.stop="startTyping">type ANSI</a> · <a href="#" @click.prevent.stop="loadExample">example</a></p>
        </div>
      </template>

      <!-- TYPING -->
      <template v-else-if="view === 'typing'">
        <div class="head">
          <div class="head__main">
            <button class="ghost" @click="reset"><svg viewBox="0 0 24 24" class="ic-s"><path d="M15 18l-6-6 6-6" /></svg> Drop a file instead</button>
          </div>
          <div class="head__actions">
            <label class="fontsel"><select v-model="selectedFont"><option v-for="f in FONTS" :key="f.value" :value="f.value">{{ f.label }}</option></select></label>
            <button class="ghost" v-if="result" @click="copy">{{ copied ? "Copied" : "Copy" }}</button>
          </div>
        </div>
        <textarea v-model="ansi" @input="onType" spellcheck="false" placeholder="Paste or type ANSI Tibetan text…"></textarea>
        <div v-if="blocks.length" class="page" :style="{ fontFamily: previewFont }">
          <template v-for="(b, i) in blocks" :key="i">
            <p v-if="b.runs.length" class="pg-p" :style="{ textAlign: b.align }"><span v-for="(r, j) in b.runs" :key="j" :style="runStyle(r)">{{ r.text }}</span></p>
            <div v-else class="pg-gap"></div>
          </template>
        </div>
      </template>

      <!-- RESULT -->
      <template v-else>
        <div class="result-head">
          <div class="rh-top">
            <span class="rh-badge"><svg viewBox="0 0 24 24" class="ic-s"><path d="m20 6-11 11-5-5" /></svg> Converted</span>
            <span class="rh-file">{{ sourceLabel }}</span>
            <span v-if="detectedFonts.length" class="rh-count">· {{ detectedFonts.length }} font{{ detectedFonts.length > 1 ? "s" : "" }}</span>
            <div class="spacer"></div>
            <button class="ghost" @click="reset"><svg viewBox="0 0 24 24" class="ic-s"><path d="M12 5v14M5 12h14" /></svg> New</button>
          </div>
          <p class="rh-sub">Tibetan converted to Unicode — every bit of formatting is kept. The preview below matches the file you'll download.</p>
          <div class="rh-actions">
            <label class="fontsel" title="Unicode font for the converted document"><select v-model="selectedFont"><option v-for="f in FONTS" :key="f.value" :value="f.value">{{ f.label }}</option></select></label>
            <button v-if="srcFile" class="pill" :disabled="building" @click="downloadDocument">
              <svg viewBox="0 0 24 24" class="ic-s"><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
              {{ downloadLabel }}
            </button>
            <button class="ghost" @click="copy">{{ copied ? "Copied" : "Copy text" }}</button>
            <button class="ghost" @click="downloadTxt">.txt</button>
          </div>
        </div>

        <div class="page" :style="{ fontFamily: previewFont }">
          <template v-for="(b, i) in blocks" :key="i">
            <p v-if="b.runs.length" class="pg-p" :style="{ textAlign: b.align }"><span v-for="(r, j) in b.runs" :key="j" :style="runStyle(r)">{{ r.text }}</span></p>
            <div v-else class="pg-gap"></div>
          </template>
        </div>
      </template>

      <transition name="fade"><p v-if="note" class="toast">{{ note }}</p></transition>
    </main>

    <footer class="foot">
      Converts legacy Tibetan fonts (TibetanChogyal, Machine, Esams, Ededris…) to Unicode.
      Font tables by <a href="https://github.com/buda-base/py-tiblegenc">BUDA</a>.
    </footer>
  </div>
</template>

<style scoped>
.app {
  --bg: #f6f7f8; --card: #fff; --border: rgba(15,18,25,0.09);
  --text: #15171c; --muted: #8a8f99; --accent: #d98a2b; --accent-soft: rgba(217,138,43,0.12);
  --shadow: 0 1px 2px rgba(15,18,25,0.04), 0 10px 34px rgba(15,18,25,0.06);
  --paper: #ffffff; --paper-ink: #14161a; --paper-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 20px 50px rgba(0,0,0,0.1);
  min-height: 100vh; display: flex; flex-direction: column;
  background: var(--bg); color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  transition: background 0.3s, color 0.3s;
}
.app[data-theme="dark"] {
  --bg: #0b0c0e; --card: #151619; --border: rgba(255,255,255,0.1);
  --text: #ecedf0; --muted: #7f858f; --accent: #e8a64a; --accent-soft: rgba(232,166,74,0.15);
  --shadow: 0 1px 2px rgba(0,0,0,0.4), 0 14px 44px rgba(0,0,0,0.4);
  --paper: #f4f1ea; --paper-ink: #1a1814; --paper-shadow: 0 1px 3px rgba(0,0,0,0.5), 0 24px 60px rgba(0,0,0,0.55);
}

.bar { display: flex; align-items: center; justify-content: space-between; padding: 20px 28px; max-width: 900px; margin: 0 auto; width: 100%; box-sizing: border-box; }
.brand { font-weight: 650; font-size: 15px; display: flex; align-items: center; }
.brand .muted { color: var(--muted); font-weight: 500; }
.dot { width: 9px; height: 9px; border-radius: 50%; background: var(--accent); margin-right: 10px; box-shadow: 0 0 0 4px var(--accent-soft); }

.wrap { max-width: 900px; margin: 0 auto; padding: 16px 28px 56px; width: 100%; box-sizing: border-box; flex: 1; }
.title { font-size: clamp(28px,4vw,44px); line-height: 1.05; letter-spacing: -0.03em; font-weight: 700; margin: 32px 0 12px; }
.sub { color: var(--muted); font-size: 16px; max-width: 60ch; margin: 0 0 28px; line-height: 1.55; }

.drop { border: 1.5px dashed var(--border); border-radius: 22px; background: var(--card); box-shadow: var(--shadow); padding: 56px 28px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: border-color .2s, background .2s, transform .15s; }
.drop:hover { border-color: var(--accent); }
.drop.active { border-color: var(--accent); background: var(--accent-soft); transform: scale(1.005); }
.drop__title { font-size: 18px; font-weight: 600; margin: 8px 0 2px; }
.drop__title b { color: var(--accent); }
.drop__hint { color: var(--muted); font-size: 13.5px; margin-top: 10px; }
.drop__hint a { color: var(--text); text-decoration: underline; text-underline-offset: 2px; }

.pill { border: none; background: var(--accent); color: #fff; font-weight: 600; font-size: 14px; padding: 10px 18px; border-radius: 999px; cursor: pointer; transition: filter .15s, transform .1s; display: inline-flex; align-items: center; gap: 7px; }
.pill:hover { filter: brightness(1.05); }
.pill:active { transform: scale(0.97); }
.pill:disabled { opacity: 0.6; cursor: default; }

/* result header */
.result-head { margin: 18px 0 18px; }
.rh-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.rh-badge { display: inline-flex; align-items: center; gap: 6px; font-weight: 650; color: #1c7a3e; background: rgba(33,160,80,0.12); padding: 4px 10px; border-radius: 999px; font-size: 13px; }
.app[data-theme="dark"] .rh-badge { color: #6fd699; background: rgba(33,160,80,0.16); }
.rh-file { font-weight: 600; }
.rh-count { color: var(--muted); }
.spacer { flex: 1; }
.rh-sub { color: var(--muted); font-size: 14px; margin: 10px 0 16px; }
.rh-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* typing header */
.head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 8px 0 14px; flex-wrap: wrap; }
.head__actions { display: flex; gap: 8px; align-items: center; }

textarea { width: 100%; min-height: 160px; box-sizing: border-box; border: 1px solid var(--border); border-radius: 16px; background: var(--card); color: var(--text); padding: 16px 18px; font-size: 16px; line-height: 1.7; font-family: inherit; outline: none; resize: vertical; box-shadow: var(--shadow); }
textarea:focus { border-color: var(--accent); }

/* the page */
.page {
  background: var(--paper); color: var(--paper-ink);
  border-radius: 8px; box-shadow: var(--paper-shadow);
  padding: 56px 60px; margin-top: 18px; min-height: 400px;
  line-height: 1;
}
.pg-p { margin: 0 0 0.7em; font-size: 20px; overflow-wrap: anywhere; }
.pg-gap { height: 1em; }

/* buttons / selects */
.icon-btn, .ghost { display: inline-flex; align-items: center; gap: 7px; border: 1px solid var(--border); background: transparent; color: var(--text); border-radius: 10px; cursor: pointer; font-size: 13.5px; font-weight: 550; padding: 7px 11px; transition: background .15s, border-color .15s; }
.ghost:hover, .icon-btn:hover { background: var(--accent-soft); border-color: var(--accent); }
.icon-btn { padding: 9px; }
.fontsel { position: relative; display: inline-flex; align-items: center; }
.fontsel::before {
  content: "Aa"; position: absolute; left: 11px; font-size: 12px; font-weight: 600;
  color: var(--muted); pointer-events: none;
}
.fontsel::after {
  content: ""; position: absolute; right: 11px; width: 11px; height: 11px;
  pointer-events: none; background: currentColor; opacity: 0.55;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6' fill='none' stroke='%23000' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6' fill='none' stroke='%23000' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/contain no-repeat;
}
.fontsel select {
  appearance: none; -webkit-appearance: none;
  border: 1px solid var(--border); background: var(--card); color: var(--text);
  border-radius: 10px; font-size: 13px; font-weight: 550;
  padding: 8px 30px 8px 32px; cursor: pointer; font-family: inherit;
  transition: border-color .15s, box-shadow .15s;
}
.fontsel select:hover { border-color: var(--accent); }
.fontsel select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }

.ic { width: 18px; height: 18px; }
.ic-s { width: 15px; height: 15px; }
.ic-xl { width: 40px; height: 40px; color: var(--accent); }
svg { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

.veil { position: fixed; inset: 0; z-index: 50; background: color-mix(in srgb, var(--bg) 78%, transparent); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; pointer-events: none; }
.veil__box { border: 2px dashed var(--accent); border-radius: 24px; padding: 56px 84px; text-align: center; background: var(--card); box-shadow: var(--shadow); }
.veil__box p { font-size: 18px; font-weight: 600; margin: 12px 0 0; }

.toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: var(--text); color: var(--bg); padding: 11px 18px; border-radius: 12px; font-size: 14px; font-weight: 500; z-index: 60; }
.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.foot { text-align: center; color: var(--muted); font-size: 13px; padding: 28px 28px 36px; border-top: 1px solid var(--border); margin-top: 20px; }
.foot a { color: var(--accent); text-decoration: none; }
.foot a:hover { text-decoration: underline; }
</style>
