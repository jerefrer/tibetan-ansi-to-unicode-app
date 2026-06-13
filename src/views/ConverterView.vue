<script setup>
import TibetanAnsiToUnicode, {
  convertRuns,
  docxToRuns,
  rtfToRuns,
  convertDocxDocument,
  convertRtfDocument,
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

function prefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
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

const result = ref(""); // Unicode output
const sourceLabel = ref(""); // set when imported from a file / formatted paste
const detectedFonts = ref([]);
const typing = ref(false); // plain-ANSI textarea revealed?
const ansi = ref(""); // plain ANSI typed by the user
const fileInput = ref(null);
const srcFile = ref(null); // { name, kind, buffer|text } — kept so we can rebuild the file
const building = ref(false);

// view = empty | typing | result
const view = computed(() =>
  typing.value ? "typing" : result.value || sourceLabel.value ? "result" : "empty"
);

const EXAMPLE = `oe×ñÎ
>ë-{,-8ß:-bÜ-¹¥/-e$-020<Î
ýV-#è-<9-Zë$-ýë-:Î
μ¥-9ß-ýV-<ÜKÜ-oe×ñÎ`;

function convertPlain(text) {
  return text
    .split("\n")
    .map((l) => new TibetanAnsiToUnicode(l).convert())
    .join("\n");
}

async function importRuns(runs, label) {
  const r = convertRuns(runs, { details: true });
  result.value = r.text;
  detectedFonts.value = [...new Set(runs.map((x) => x.font).filter(Boolean))];
  sourceLabel.value = label;
  typing.value = false;
  ansi.value = "";
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
      await importRuns(await docxToRuns(buf), file.name);
    } else if (name.endsWith(".rtf")) {
      const text = await file.text();
      srcFile.value = { name: file.name, kind: "rtf", text };
      await importRuns(rtfToRuns(text), file.name);
    } else {
      flash("Please drop a .docx or .rtf file");
    }
  } catch (e) {
    console.error(e);
    flash("Could not read that file");
  }
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
    if (srcFile.value.kind === "docx") {
      const bytes = await convertDocxDocument(srcFile.value.buffer, {
        unicodeFont: selectedFont.value,
      });
      saveBlob(
        bytes,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        base + ".docx"
      );
    } else if (srcFile.value.kind === "rtf") {
      const rtf = convertRtfDocument(srcFile.value.text, {
        unicodeFont: selectedFont.value,
      });
      saveBlob(rtf, "application/rtf", base + ".rtf");
    }
  } catch (e) {
    console.error(e);
    flash("Could not build the file");
  } finally {
    building.value = false;
  }
}

function onDrop(e) {
  e.preventDefault();
  isDragging.value = false;
  const f = e.dataTransfer?.files?.[0];
  if (f) handleFile(f);
}
function onDragOver(e) {
  e.preventDefault();
  isDragging.value = true;
}
function onDragLeave(e) {
  if (e.target === e.currentTarget) isDragging.value = false;
}
function onPaste(e) {
  const html = e.clipboardData?.getData("text/html");
  if (html && /font-family|<font/i.test(html)) {
    const runs = htmlToRuns(html);
    if (runs.some((r) => r.font)) {
      e.preventDefault();
      srcFile.value = null;
      importRuns(runs, "Pasted formatted text");
      return;
    }
  }
  if (view.value === "empty") {
    typing.value = true;
    nextTick(() => onType());
  }
}

function pickFile() {
  fileInput.value?.click();
}
function onFileChange(e) {
  const f = e.target.files?.[0];
  if (f) handleFile(f);
  e.target.value = "";
}

function onType() {
  result.value = convertPlain(ansi.value);
}
function startTyping() {
  typing.value = true;
}
function loadExample() {
  typing.value = true;
  ansi.value = EXAMPLE;
  onType();
}
function reset() {
  result.value = "";
  sourceLabel.value = "";
  detectedFonts.value = [];
  ansi.value = "";
  typing.value = false;
  srcFile.value = null;
}

async function copy() {
  try {
    await navigator.clipboard.writeText(result.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1800);
  } catch (e) {
    console.error(e);
  }
}
function download() {
  const blob = new Blob([result.value], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "tibetan-unicode.txt";
  a.click();
  URL.revokeObjectURL(a.href);
}
function toggleTheme() {
  isDark.value = !isDark.value;
  localStorage.setItem("darkMode", isDark.value);
}
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
    <!-- overlay only when there is no visible drop zone -->
    <div v-if="isDragging && view !== 'empty'" class="veil">
      <div class="veil__box">
        <svg viewBox="0 0 24 24" class="ic-xl"><path d="M12 16V4m0 0 4 4m-4-4-4 4" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
        <p>Drop to convert</p>
      </div>
    </div>

    <header class="bar">
      <div class="brand">
        <span class="dot"></span>Tibetan&nbsp;<span class="muted">legacy → Unicode</span>
      </div>
      <button class="icon-btn" @click="toggleTheme" :title="isDark ? 'Light mode' : 'Dark mode'">
        <svg v-if="isDark" viewBox="0 0 24 24" class="ic"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></svg>
        <svg v-else viewBox="0 0 24 24" class="ic"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
      </button>
    </header>

    <main class="wrap">
      <!-- EMPTY: the drop zone is the whole hero -->
      <template v-if="view === 'empty'">
        <h1 class="title">Convert old Tibetan fonts to Unicode</h1>
        <p class="sub">
          Drop a Word or RTF file — the original font of every character is used to
          decode it, so mixed scripts and Sanskrit stacks come out right.
        </p>
        <div class="drop" :class="{ active: isDragging }" @click="pickFile">
          <input ref="fileInput" type="file" accept=".docx,.rtf" hidden @change="onFileChange" />
          <svg viewBox="0 0 24 24" class="ic-xl"><path d="M12 16V4m0 0 4 4m-4-4-4 4" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
          <p class="drop__title">Drag &amp; drop a <b>.docx</b> or <b>.rtf</b></p>
          <button class="pill" @click.stop="pickFile">Choose a file</button>
          <p class="drop__hint">
            or paste formatted text (⌘/Ctrl + V) ·
            <a href="#" @click.prevent.stop="startTyping">type ANSI</a> ·
            <a href="#" @click.prevent.stop="loadExample">example</a>
          </p>
        </div>
      </template>

      <!-- TYPING: plain ANSI in, live Unicode out -->
      <template v-else-if="view === 'typing'">
        <div class="toolbar">
          <button class="ghost" @click="reset"><svg viewBox="0 0 24 24" class="ic-s"><path d="M15 18l-6-6 6-6" /></svg> Drop a file instead</button>
          <div class="spacer"></div>
          <button class="ghost" v-if="result" @click="copy">
            <svg v-if="!copied" viewBox="0 0 24 24" class="ic-s"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            <svg v-else viewBox="0 0 24 24" class="ic-s"><path d="m20 6-11 11-5-5" /></svg>
            {{ copied ? "Copied" : "Copy" }}
          </button>
        </div>
        <textarea
          v-model="ansi"
          @input="onType"
          spellcheck="false"
          placeholder="Paste or type ANSI Tibetan text…"
        ></textarea>
        <div v-if="result" class="tibetan output">{{ result }}</div>
      </template>

      <!-- RESULT: just the converted text -->
      <template v-else>
        <div class="toolbar">
          <div class="src">
            <svg viewBox="0 0 24 24" class="ic-s"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M5 3h9l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /></svg>
            <span class="src__name">{{ sourceLabel }}</span>
          </div>
          <div class="spacer"></div>
          <label v-if="srcFile" class="fontsel" title="Unicode font for the converted document">
            <select v-model="selectedFont">
              <option v-for="f in FONTS" :key="f.value" :value="f.value">{{ f.label }}</option>
            </select>
          </label>
          <button
            v-if="srcFile"
            class="pill sm"
            :disabled="building"
            @click="downloadDocument"
            title="Same document, fonts converted to Unicode — all formatting kept"
          >
            <svg viewBox="0 0 24 24" class="ic-s"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M5 3h9l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /></svg>
            {{ building ? "Preparing…" : srcFile.kind === "rtf" ? "Download RTF" : "Download Word" }}
          </button>
          <button class="ghost" @click="copy">
            <svg v-if="!copied" viewBox="0 0 24 24" class="ic-s"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            <svg v-else viewBox="0 0 24 24" class="ic-s"><path d="m20 6-11 11-5-5" /></svg>
            {{ copied ? "Copied" : "Copy" }}
          </button>
          <button class="ghost" @click="download" title="Plain Unicode text (.txt)"><svg viewBox="0 0 24 24" class="ic-s"><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg> .txt</button>
          <button class="ghost" @click="reset">New</button>
        </div>
        <div v-if="detectedFonts.length" class="chips">
          <span class="chip" v-for="f in detectedFonts" :key="f">{{ f }}</span>
        </div>
        <div class="tibetan output">{{ result }}</div>
      </template>

      <transition name="fade"><p v-if="note" class="toast">{{ note }}</p></transition>
    </main>
  </div>
</template>

<style scoped>
.app {
  --bg: #f7f7f8;
  --card: #ffffff;
  --border: rgba(15, 18, 25, 0.09);
  --text: #15171c;
  --muted: #8a8f99;
  --accent: #d98a2b;
  --accent-soft: rgba(217, 138, 43, 0.12);
  --shadow: 0 1px 2px rgba(15, 18, 25, 0.04), 0 10px 34px rgba(15, 18, 25, 0.06);
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  transition: background 0.3s, color 0.3s;
}
.app[data-theme="dark"] {
  --bg: #0b0c0e;
  --card: #151619;
  --border: rgba(255, 255, 255, 0.1);
  --text: #ecedf0;
  --muted: #7f858f;
  --accent: #e8a64a;
  --accent-soft: rgba(232, 166, 74, 0.15);
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 14px 44px rgba(0, 0, 0, 0.4);
}

.bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 28px; max-width: 880px; margin: 0 auto;
}
.brand { font-weight: 650; font-size: 15px; letter-spacing: -0.01em; display: flex; align-items: center; }
.brand .muted { color: var(--muted); font-weight: 500; }
.dot { width: 9px; height: 9px; border-radius: 50%; background: var(--accent); margin-right: 10px; box-shadow: 0 0 0 4px var(--accent-soft); }

.wrap { max-width: 880px; margin: 0 auto; padding: 16px 28px 80px; }
.title { font-size: clamp(28px, 4vw, 44px); line-height: 1.05; letter-spacing: -0.03em; font-weight: 700; margin: 32px 0 12px; }
.sub { color: var(--muted); font-size: 16px; max-width: 60ch; margin: 0 0 28px; line-height: 1.55; }

/* drop zone (empty state) */
.drop {
  border: 1.5px dashed var(--border);
  border-radius: 22px;
  background: var(--card);
  box-shadow: var(--shadow);
  padding: 56px 28px;
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
}
.drop:hover { border-color: var(--accent); }
.drop.active { border-color: var(--accent); background: var(--accent-soft); transform: scale(1.005); }
.drop__title { font-size: 18px; font-weight: 600; margin: 8px 0 2px; }
.drop__title b { color: var(--accent); }
.drop__hint { color: var(--muted); font-size: 13.5px; margin-top: 10px; }
.drop__hint a { color: var(--text); text-decoration: underline; text-underline-offset: 2px; }

.pill { border: none; background: var(--accent); color: #fff; font-weight: 600; font-size: 14px; padding: 10px 18px; border-radius: 999px; cursor: pointer; transition: filter 0.15s, transform 0.1s; }
.pill:hover { filter: brightness(1.05); }
.pill:active { transform: scale(0.97); }
.pill.sm { padding: 7px 14px; font-size: 13px; }

/* toolbar (typing + result) */
.toolbar { display: flex; align-items: center; gap: 8px; margin: 8px 0 14px; flex-wrap: wrap; }
.spacer { flex: 1; }
.src { display: flex; align-items: center; gap: 8px; min-width: 0; }
.src__name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.chips { display: flex; flex-wrap: wrap; gap: 6px; margin: -4px 0 18px; }
.chip { font-size: 12px; color: var(--muted); background: var(--accent-soft); border: 1px solid var(--border); padding: 3px 9px; border-radius: 999px; }

textarea {
  width: 100%; min-height: 200px; box-sizing: border-box;
  border: 1px solid var(--border); border-radius: 16px;
  background: var(--card); color: var(--text);
  padding: 18px 20px; font-size: 17px; line-height: 1.7; font-family: inherit;
  outline: none; resize: vertical; box-shadow: var(--shadow);
}
textarea:focus { border-color: var(--accent); }

/* output text */
.output {
  margin-top: 18px;
  font-size: 30px; line-height: 1.85; overflow-wrap: anywhere;
  color: var(--text);
}
.tibetan {
  font-family: "TibetanChogyalUnicode-170221", "TibetanChogyalUnicode",
    "TibetanMachineUnicode", "Jomolhari", "Noto Serif Tibetan", serif;
}

/* buttons */
.icon-btn, .ghost {
  display: inline-flex; align-items: center; gap: 7px;
  border: 1px solid var(--border); background: transparent; color: var(--text);
  border-radius: 10px; cursor: pointer; font-size: 13.5px; font-weight: 550;
  padding: 7px 11px; transition: background 0.15s, border-color 0.15s;
}
.ghost:hover, .icon-btn:hover { background: var(--accent-soft); border-color: var(--accent); }
.icon-btn { padding: 9px; }

.fontsel select {
  appearance: none;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 550;
  padding: 7px 10px;
  cursor: pointer;
  font-family: inherit;
}
.fontsel select:hover { border-color: var(--accent); }

.ic { width: 18px; height: 18px; }
.ic-s { width: 15px; height: 15px; }
.ic-xl { width: 40px; height: 40px; color: var(--accent); }
svg { fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

/* drag overlay (only when no zone visible) */
.veil {
  position: fixed; inset: 0; z-index: 50;
  background: color-mix(in srgb, var(--bg) 78%, transparent);
  backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center; pointer-events: none;
}
.veil__box { border: 2px dashed var(--accent); border-radius: 24px; padding: 56px 84px; text-align: center; background: var(--card); box-shadow: var(--shadow); }
.veil__box p { font-size: 18px; font-weight: 600; margin: 12px 0 0; }

.toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: var(--text); color: var(--bg); padding: 11px 18px; border-radius: 12px; font-size: 14px; font-weight: 500; z-index: 60; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
