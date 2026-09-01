import "@fontsource/archivo-black/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-sans/latin-700.css";
import "./style.css";
import { buildSyncItems, highlightsToMarkdown, parseMarkdownHighlights, safeName, type Book, type Collection, type Highlight } from "../../shared/library";

const STORAGE_KEY = "rsl:library-state:v1";
const DEMO_STORAGE_KEY = "demo:rsl:library-state:v1";
const isTauri = "__TAURI_INTERNALS__" in window;
const isDemo = location.pathname.replace(/\/$/, "") === "/demo" || new URLSearchParams(location.search).get("demo") === "1";
if (!isDemo) {
  localStorage.removeItem("sb_license:reader-sideload-library");
  localStorage.removeItem("sb_license_verdict:reader-sideload-library");
}

interface State { books: Book[]; collections: Collection[]; highlights: Highlight[]; source: string; }
const storageKey = isDemo ? DEMO_STORAGE_KEY : STORAGE_KEY;
const saved = localStorage.getItem(storageKey);
let state: State = saved ? safeStoredState(saved) : isDemo ? sampleState() : { books: [], collections: [], highlights: [], source: "" };
let activePanel = "catalogue";

function sampleState(): State {
  return {
    source: "Demo library · 4 sample books",
    books: [
      { id: "demo-moss", path: "sample/The Moss Archive.epub", title: "The Moss Archive", authors: ["A. Reader"], series: "Field Library", seriesIndex: 1, format: "EPUB", sizeBytes: 1_842_000, modified: 0, coverStatus: "found", metadataStatus: "valid", warnings: [], eligible: true, selected: true },
      { id: "demo-field", path: "sample/Field Notes 03.pdf", title: "Field Notes 03 — 秋", authors: ["Zoë Reader"], series: "Field Library", seriesIndex: 3, format: "PDF", sizeBytes: 924_000, modified: 0, coverStatus: "not-applicable", metadataStatus: "valid", warnings: [], eligible: true, selected: true },
      { id: "demo-concrete", path: "sample/Concrete Gardens.epub", title: "Concrete Gardens", authors: ["M. Silva"], series: null, seriesIndex: null, format: "EPUB", sizeBytes: 2_106_000, modified: 0, coverStatus: "missing", metadataStatus: "warning", warnings: ["Cover image is missing or not labelled"], eligible: true, selected: true },
      { id: "demo-locked", path: "sample/Locked Reference.pdf", title: "Locked Reference", authors: [], series: null, seriesIndex: null, format: "PDF", sizeBytes: 730_000, modified: 0, coverStatus: "not-applicable", metadataStatus: "warning", warnings: ["Password-protected PDF excluded; only DRM-free files can be transferred"], eligible: false, selected: false }
    ],
    collections: [{ id: "demo-autumn", name: "Autumn Queue", bookIds: ["demo-moss", "demo-field", "demo-concrete"] }],
    highlights: [
      { id: "demo-highlight-1", book: "The Moss Archive", quote: "A private library should remain legible when every service is gone.", note: "Keep for the archive plan.", location: "Chapter 2", created: "2026-08-28" },
      { id: "demo-highlight-2", book: "Concrete Gardens", quote: "Order is a property of the collection, not the device.", note: "", location: "Page 41", created: "2026-08-29" }
    ]
  };
}

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const $$ = <T extends HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)];

function safeStoredState(value: string): State {
  try {
    const parsed = JSON.parse(value) as Partial<State>;
    return { books: parsed.books || [], collections: parsed.collections || [], highlights: parsed.highlights || [], source: parsed.source || "" };
  } catch { return { books: [], collections: [], highlights: [], source: "" }; }
}

function persist() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function toast(message: string, error = false) {
  const item = document.createElement("div");
  item.className = `toast${error ? " error" : ""}`;
  item.textContent = message;
  $("#toast-region").append(item);
  window.setTimeout(() => item.remove(), 5000);
}

function setPanel(panel: string, focus = false) {
  activePanel = panel;
  $$(".task-tab").forEach((tab) => {
    const selected = tab.dataset.panel === panel;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  });
  $$(".task-panel").forEach((section) => {
    const selected = section.id === panel;
    section.hidden = !selected;
    section.classList.toggle("is-active", selected);
  });
}

async function invoke<T>(command: string, args: Record<string, unknown> = {}): Promise<T> {
  const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
  return tauriInvoke<T>(command, args);
}

async function openPath(options: Record<string, unknown>): Promise<string | null> {
  const { open } = await import("@tauri-apps/plugin-dialog");
  const result = await open(options);
  return typeof result === "string" ? result : null;
}

async function savePath(options: Record<string, unknown>): Promise<string | null> {
  const { save } = await import("@tauri-apps/plugin-dialog");
  return save(options);
}

async function chooseLibrary() {
  if (isDemo) { toast("Demo mode does not read your files. Choose Start for real first.", true); return; }
  if (!isTauri) { $("#browser-folder").click(); return; }
  const folder = await openPath({ directory: true, multiple: false, title: "Choose your DRM-free library" });
  if (!folder) return;
  await scanFolder(folder);
}

async function scanFolder(folder: string) {
  const scanState = $("#scan-state");
  scanState.hidden = false;
  scanState.innerHTML = `<span class="stamp">SCANNING</span><h3>Reading metadata without changing files…</h3><p>EPUB packages, PDF properties, covers, and duplicate paths are being checked.</p>`;
  try {
    const books = await invoke<Book[]>("scan_library", { root: folder });
    state.books = books.map((book) => ({ ...book, selected: book.eligible }));
    state.source = folder;
    state.collections = state.collections.map((collection) => ({ ...collection, bookIds: collection.bookIds.filter((id) => books.some((book) => book.id === id)) }));
    persist(); render();
    toast(`Indexed ${books.length} book${books.length === 1 ? "" : "s"}. Originals were not changed.`);
  } catch (error) {
    scanState.innerHTML = `<span class="stamp">SCAN STOPPED</span><h3>This folder could not be indexed.</h3><p>${escapeHtml(String(error))}</p><button class="button button-primary" id="retry-scan" type="button">Choose another folder</button>`;
    $("#retry-scan").addEventListener("click", chooseLibrary);
  }
}

function browserFolderPicked(event: Event) {
  const files = [...((event.target as HTMLInputElement).files || [])].filter((file) => /\.(epub|pdf)$/i.test(file.name));
  state.books = files.map((file) => {
    const format = file.name.toLowerCase().endsWith(".pdf") ? "PDF" : "EPUB";
    const title = file.name.replace(/\.(epub|pdf)$/i, "").replace(/[_-]+/g, " ").trim();
    return { id: crypto.randomUUID(), path: file.name, title, authors: [], series: null, seriesIndex: null, format, sizeBytes: file.size, modified: file.lastModified, coverStatus: format === "PDF" ? "not-applicable" : "missing", metadataStatus: "inferred", warnings: ["Desktop app reads embedded metadata"], eligible: true, selected: true } satisfies Book;
  });
  state.source = "Browser-selected folder (preview scan)";
  persist(); render();
  toast(`Indexed ${files.length} file${files.length === 1 ? "" : "s"}. Install the desktop app for embedded metadata and transfer.`);
}

function filteredBooks() {
  const query = $("#search") as HTMLInputElement;
  const select = $("#format-filter") as HTMLSelectElement;
  const q = query.value.trim().toLocaleLowerCase();
  return state.books.filter((book) => {
    const matches = !q || [book.title, ...book.authors, book.series || ""].join(" ").toLocaleLowerCase().includes(q);
    const format = select.value === "all" || book.format === select.value || (select.value === "issues" && book.warnings.length > 0);
    return matches && format;
  });
}

function renderCatalogue() {
  const books = filteredBooks();
  $("#book-count").textContent = String(state.books.length);
  $("#issue-count").textContent = String(state.books.filter((book) => book.warnings.length).length);
  $("#source-label").textContent = state.source || "No library selected";
  $("#catalogue-table-wrap").hidden = state.books.length === 0;
  $("#scan-state").hidden = state.books.length > 0;
  const body = $("#catalogue-body");
  body.innerHTML = books.map((book) => {
    const warnings = book.warnings.join(" · ");
    const statusClass = !book.eligible ? "error" : warnings ? "warn" : "good";
    const statusText = !book.eligible ? "Excluded" : warnings ? "Check" : "Ready";
    return `<tr>
      <td data-label="Book"><strong>${escapeHtml(book.title)}</strong><small>${formatBytes(book.sizeBytes)}</small></td>
      <td data-label="Author">${escapeHtml(book.authors.join(", ") || "Unknown")}</td>
      <td data-label="Series">${escapeHtml(book.series ? `${book.series}${book.seriesIndex ? ` · ${book.seriesIndex}` : ""}` : "—")}</td>
      <td data-label="File"><strong>${book.format}</strong><small>${book.coverStatus === "missing" ? "No cover found" : book.coverStatus === "found" ? "Cover found" : "Embedded pages"}</small></td>
      <td data-label="Status"><span class="status ${statusClass}" title="${escapeHtml(warnings || "Metadata and file checks passed")}">${statusText === "Ready" ? "✓" : "!"} ${statusText}</span></td>
      <td data-label="Use"><label class="toggle"><input type="checkbox" data-book-toggle="${book.id}" ${book.selected && book.eligible ? "checked" : ""} ${book.eligible ? "" : "disabled"}/><span>${book.selected ? "Included" : "Skipped"}</span></label></td>
    </tr>`;
  }).join("") || `<tr><td colspan="6">No books match this filter.</td></tr>`;
  $$<HTMLInputElement>("[data-book-toggle]").forEach((toggle) => toggle.addEventListener("change", () => {
    const book = state.books.find((candidate) => candidate.id === toggle.dataset.bookToggle);
    if (book) { book.selected = toggle.checked; persist(); renderCatalogue(); }
  }));
}

function openCollectionDialog() {
  if (!state.books.length) { toast("Choose a library folder before creating a collection.", true); setPanel("catalogue", true); return; }
  $("#collection-name")?.setAttribute("value", "");
  const list = $("#collection-books");
  list.innerHTML = state.books.filter((book) => book.eligible && book.selected).map((book) => `<label><input type="checkbox" value="${book.id}"/><span>${escapeHtml(book.title)} <small>· ${escapeHtml(book.authors[0] || "Unknown author")}</small></span></label>`).join("");
  const dialog = $("#collection-dialog") as HTMLDialogElement;
  dialog.showModal();
  window.setTimeout(() => $("#collection-name").focus(), 0);
}

function saveCollection(event: SubmitEvent) {
  const submitter = event.submitter as HTMLButtonElement | null;
  if (submitter?.value !== "default") return;
  event.preventDefault();
  const input = $("#collection-name") as HTMLInputElement;
  if (!input.reportValidity()) return;
  const bookIds = $$<HTMLInputElement>("#collection-books input:checked").map((item) => item.value);
  if (!bookIds.length) { toast("Choose at least one book for this collection.", true); return; }
  state.collections.push({ id: crypto.randomUUID(), name: safeName(input.value), bookIds });
  persist(); renderCollections();
  ($("#collection-dialog") as HTMLDialogElement).close();
  toast(`Created ${safeName(input.value)} with ${bookIds.length} books.`);
}

function renderCollections() {
  $("#collections-empty").hidden = state.collections.length > 0;
  const board = $("#collections-list");
  board.innerHTML = state.collections.map((collection, cIndex) => `<article class="collection">
    <div class="collection-head"><div><span class="eyebrow">Folder ${String(cIndex + 1).padStart(2, "0")}</span><h3>${escapeHtml(collection.name)}</h3></div><div class="collection-actions"><button class="icon-button" data-delete-collection="${collection.id}" aria-label="Delete ${escapeHtml(collection.name)}">×</button></div></div>
    <ol class="ordered-books">${collection.bookIds.map((id, index) => {
      const book = state.books.find((candidate) => candidate.id === id);
      return book ? `<li><span><strong>${escapeHtml(book.title)}</strong><br/><small>${escapeHtml(book.authors.join(", ") || "Unknown author")}</small><br/><small class="device-path">${String(index + 1).padStart(3, "0")} - ${escapeHtml(safeName(book.title))}.${book.format.toLowerCase()}</small></span><span class="move-actions"><button class="icon-button" data-move="up" data-collection="${collection.id}" data-index="${index}" aria-label="Move ${escapeHtml(book.title)} up" ${index === 0 ? "disabled" : ""}>↑</button><button class="icon-button" data-move="down" data-collection="${collection.id}" data-index="${index}" aria-label="Move ${escapeHtml(book.title)} down" ${index === collection.bookIds.length - 1 ? "disabled" : ""}>↓</button></span></li>` : "";
    }).join("")}</ol>
  </article>`).join("");
  $$<HTMLButtonElement>("[data-delete-collection]").forEach((button) => button.addEventListener("click", () => {
    const collection = state.collections.find((item) => item.id === button.dataset.deleteCollection);
    if (!collection || !confirm(`Delete “${collection.name}”? Books stay in your catalogue.`)) return;
    state.collections = state.collections.filter((item) => item.id !== collection.id); persist(); renderCollections(); toast(`Deleted ${collection.name}.`);
  }));
  $$<HTMLButtonElement>("[data-move]").forEach((button) => button.addEventListener("click", () => {
    const collection = state.collections.find((item) => item.id === button.dataset.collection);
    const index = Number(button.dataset.index); if (!collection) return;
    const target = button.dataset.move === "up" ? index - 1 : index + 1;
    [collection.bookIds[index], collection.bookIds[target]] = [collection.bookIds[target]!, collection.bookIds[index]!];
    persist(); renderCollections();
  }));
}

function selectedBooks() { return state.books.filter((book) => book.selected && book.eligible); }

async function usbSync() {
  const books = selectedBooks();
  if (!books.length) { toast("Include at least one ready book before syncing.", true); setPanel("catalogue", true); return; }
  if (!isTauri) { toast("USB transfer is available in the installed desktop app.", true); return; }
  const destination = await openPath({ directory: true, multiple: false, title: "Choose your reader's books folder" });
  if (!destination) return;
  const items = buildSyncItems(books, state.collections);
  setProgress(12, `Checking ${items.length} planned files…`);
  try {
    const report = await invoke<{ copied: number; skipped: number; total: number }>("sync_usb", { destination, items });
    setProgress(100, `Transfer complete · ${report.copied} copied · ${report.skipped} unchanged`);
    toast(`${report.total} books accounted for on the reader. It is safe to eject.`);
  } catch (error) {
    setProgress(0, "Transfer stopped — reconnect the reader and retry");
    toast(String(error), true);
  }
}

function setProgress(value: number, label: string) {
  $("#sync-progress").hidden = false;
  const meter = $("#sync-meter") as HTMLProgressElement; meter.value = value;
  $("#sync-percent").textContent = `${value}%`; $("#sync-label").textContent = label;
}

async function webdavSync(event: SubmitEvent) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const credentials = webdavCredentials();
  ($<HTMLInputElement>("#webdav-password")).value = "";
  if (!form.reportValidity()) return;
  if (isDemo) { setWebdavStatus("Demo mode does not contact servers. Choose Start for real before connecting WebDAV.", true); return; }
  if (!navigator.onLine) { setWebdavStatus("You are offline. Reconnect, then try the WebDAV transfer again.", true); return; }
  if (!isTauri) {
    setWebdavStatus("Install the desktop app to connect. Your password was cleared; enter it again after opening the app.", true);
    return;
  }
  const items = buildSyncItems(selectedBooks(), state.collections);
  if (!items.length) { setWebdavStatus("No books are ready. Return to Catalogue and include at least one book.", true); return; }
  const button = form.querySelector<HTMLButtonElement>("button[type=submit]")!;
  button.disabled = true; button.textContent = "Transferring…";
  setWebdavStatus(`Uploading ${items.length} planned file${items.length === 1 ? "" : "s"}…`);
  try {
    const report = await invoke<{ copied: number; total: number }>("sync_webdav", { ...credentials, items });
    const message = `WebDAV transfer complete: ${report.copied} of ${report.total} files uploaded.`;
    setWebdavStatus(message); toast(message);
  } catch (error) {
    const message = `WebDAV stopped. ${String(error)}`;
    setWebdavStatus(message, true); toast(message, true);
  } finally {
    button.disabled = false; button.textContent = "Sync with WebDAV";
  }
}

function webdavCredentials() {
  return {
    endpoint: ($<HTMLInputElement>("#webdav-url")).value.trim(),
    username: ($<HTMLInputElement>("#webdav-user")).value,
    password: ($<HTMLInputElement>("#webdav-password")).value
  };
}

function setWebdavStatus(message: string, error = false) {
  const status = $("#webdav-status");
  status.textContent = message;
  status.classList.toggle("error", error);
}

async function checkWebdavConnection() {
  const form = $("#webdav-form") as HTMLFormElement;
  const credentials = webdavCredentials();
  ($<HTMLInputElement>("#webdav-password")).value = "";
  if (!form.reportValidity()) return;
  if (isDemo) { setWebdavStatus("Demo mode does not contact servers. Choose Start for real before checking WebDAV.", true); return; }
  if (!navigator.onLine) { setWebdavStatus("You are offline. Reconnect, then check the WebDAV folder again.", true); return; }
  const button = $("#webdav-check") as HTMLButtonElement;
  if (!isTauri) {
    setWebdavStatus("Install the desktop app to check WebDAV. Your password was cleared.", true);
    return;
  }
  button.disabled = true;
  button.textContent = "Checking…";
  setWebdavStatus("Checking the WebDAV folder…");
  try {
    const message = await invoke<string>("check_webdav", credentials);
    setWebdavStatus(message);
  } catch (error) {
    setWebdavStatus(String(error), true);
  } finally {
    button.disabled = false;
    button.textContent = "Check connection";
  }
}

async function importHighlights() {
  if (!isTauri) { $("#browser-highlight").click(); return; }
  const path = await openPath({ multiple: false, title: "Import highlights", filters: [{ name: "Highlights", extensions: ["md", "txt", "json", "pdf", "lua"] }] });
  if (!path) return;
  try {
    const imported = await invoke<Highlight[]>("import_highlights", { path });
    state.highlights.push(...imported); persist(); renderHighlights(); toast(`Imported ${imported.length} highlight${imported.length === 1 ? "" : "s"}.`);
  } catch (error) { toast(`Import stopped: ${String(error)}`, true); }
}

async function browserHighlightPicked(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
  if (file.name.toLowerCase().endsWith(".pdf")) { toast("Embedded PDF highlights require the desktop app.", true); return; }
  const text = await file.text();
  let imported = parseMarkdownHighlights(text, file.name.replace(/\.[^.]+$/, ""));
  if (file.name.toLowerCase().endsWith(".json")) {
    try { const parsed = JSON.parse(text); imported = (Array.isArray(parsed) ? parsed : parsed.highlights || []).map((item: Partial<Highlight>) => ({ id: crypto.randomUUID(), book: item.book || file.name, quote: item.quote || "", note: item.note || "", location: item.location || "Imported", created: item.created || "" })).filter((item: Highlight) => item.quote); }
    catch { toast("This JSON file could not be read. Export it again or choose Markdown.", true); return; }
  }
  if (!imported.length) { toast("No quoted highlights were found in this file.", true); return; }
  state.highlights.push(...imported); persist(); renderHighlights(); toast(`Imported ${imported.length} highlights.`);
}

async function exportHighlights() {
  if (!state.highlights.length) { toast("Import highlights before exporting Markdown.", true); return; }
  const markdown = highlightsToMarkdown(state.highlights);
  if (isTauri) {
    const path = await savePath({ title: "Export highlights as Markdown", defaultPath: "reader-highlights.md", filters: [{ name: "Markdown", extensions: ["md"] }] });
    if (!path) return;
    await invoke("write_text_file", { path, contents: markdown }); toast(`Exported ${state.highlights.length} highlights.`);
  } else {
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown" }));
    const link = document.createElement("a"); link.href = url; link.download = "reader-highlights.md"; link.click(); URL.revokeObjectURL(url);
  }
}

function renderHighlights() {
  $("#highlights-list").innerHTML = state.highlights.length ? state.highlights.slice(-8).reverse().map((item) => `<article class="highlight"><blockquote>“${escapeHtml(item.quote)}”</blockquote>${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}<small>${escapeHtml(item.book)} · ${escapeHtml(item.location)}</small></article>`).join("") : `<p class="form-note">No highlights imported yet.</p>`;
}

function render() { renderCatalogue(); renderCollections(); renderHighlights(); }
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`; }
function escapeHtml(value: string) { return value.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]!); }

$$(".task-tab").forEach((tab) => {
  tab.addEventListener("click", () => setPanel(tab.dataset.panel!));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault(); const tabs = $$<HTMLButtonElement>(".task-tab"); let index = tabs.findIndex((item) => item.dataset.panel === activePanel);
    if (event.key === "ArrowRight") index = (index + 1) % tabs.length; if (event.key === "ArrowLeft") index = (index - 1 + tabs.length) % tabs.length; if (event.key === "Home") index = 0; if (event.key === "End") index = tabs.length - 1;
    setPanel(tabs[index]!.dataset.panel!, true);
  });
});
$("#scan-button").addEventListener("click", chooseLibrary); $("#empty-scan-button").addEventListener("click", chooseLibrary); $("#browser-folder").addEventListener("change", browserFolderPicked);
$("#load-sample").addEventListener("click", () => { location.href = `${location.pathname}?demo=1`; });
$("#search").addEventListener("input", renderCatalogue); $("#format-filter").addEventListener("change", renderCatalogue);
$("#add-collection").addEventListener("click", openCollectionDialog); $("#collection-form").addEventListener("submit", saveCollection);
$("#usb-sync").addEventListener("click", usbSync); $("#webdav-check").addEventListener("click", checkWebdavConnection); $("#webdav-form").addEventListener("submit", webdavSync);
$("#import-highlights").addEventListener("click", importHighlights); $("#browser-highlight").addEventListener("change", browserHighlightPicked); $("#export-highlights").addEventListener("click", exportHighlights);
window.addEventListener("offline", () => toast("You are offline. Saved catalogue work remains available; WebDAV waits for a connection."));
window.addEventListener("online", () => toast("Connection restored. WebDAV is available."));
if (!isTauri && isDemo && "serviceWorker" in navigator && (location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname))) {
  navigator.serviceWorker.register("/sw.js").catch(() => undefined);
}
if (isDemo) {
  document.title = "Demo — Reader Sideload Library";
  $("#demo-banner").hidden = false;
  $("#reset-demo").addEventListener("click", () => { state = sampleState(); persist(); render(); setPanel("catalogue", true); toast("Sample data reset."); });
  $("#start-real").addEventListener("click", () => { localStorage.removeItem(DEMO_STORAGE_KEY); });
  persist();
} else document.title = "Reader Sideload Library";
render(); setPanel("catalogue");
