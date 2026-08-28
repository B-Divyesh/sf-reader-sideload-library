import "@fontsource/archivo-black/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-sans/latin-700.css";
import "./style.css";
import { buildSyncItems, highlightsToMarkdown, parseMarkdownHighlights, safeName, type Book, type Collection, type Highlight } from "../../shared/library";

const PRODUCT = "reader-sideload-library";
const API = "https://api.sociobot.in/api/v1";
const STORAGE_KEY = "rsl:library-state:v1";
const LICENSE_KEY = `sb_license:${PRODUCT}`;
const VERDICT_KEY = `sb_license_verdict:${PRODUCT}`;
const isTauri = "__TAURI_INTERNALS__" in window;

interface State { books: Book[]; collections: Collection[]; highlights: Highlight[]; source: string; }
const saved = localStorage.getItem(STORAGE_KEY);
let state: State = saved ? safeStoredState(saved) : { books: [], collections: [], highlights: [], source: "" };
let activePanel = "catalogue";

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const $$ = <T extends HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)];

function safeStoredState(value: string): State {
  try {
    const parsed = JSON.parse(value) as Partial<State>;
    return { books: parsed.books || [], collections: parsed.collections || [], highlights: parsed.highlights || [], source: parsed.source || "" };
  } catch { return { books: [], collections: [], highlights: [], source: "" }; }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
      return book ? `<li><span><strong>${escapeHtml(book.title)}</strong><br/><small>${escapeHtml(book.authors.join(", ") || "Unknown author")}</small></span><span class="move-actions"><button class="icon-button" data-move="up" data-collection="${collection.id}" data-index="${index}" aria-label="Move ${escapeHtml(book.title)} up" ${index === 0 ? "disabled" : ""}>↑</button><button class="icon-button" data-move="down" data-collection="${collection.id}" data-index="${index}" aria-label="Move ${escapeHtml(book.title)} down" ${index === collection.bookIds.length - 1 ? "disabled" : ""}>↓</button></span></li>` : "";
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
  if (!licenseIsActive()) { openLicense(); return; }
  if (!navigator.onLine) { toast("WebDAV needs a connection. USB transfer and your catalogue still work offline.", true); return; }
  if (!isTauri) { toast("WebDAV transfer runs from the installed desktop app so browser credentials are never retained.", true); return; }
  const items = buildSyncItems(selectedBooks(), state.collections);
  if (!items.length) { toast("Include at least one ready book before syncing.", true); return; }
  const form = event.currentTarget as HTMLFormElement;
  const button = form.querySelector<HTMLButtonElement>("button[type=submit]")!;
  button.disabled = true; button.textContent = "Transferring…";
  try {
    const report = await invoke<{ copied: number; total: number }>("sync_webdav", { endpoint: ($<HTMLInputElement>("#webdav-url")).value, username: ($<HTMLInputElement>("#webdav-user")).value, password: ($<HTMLInputElement>("#webdav-password")).value, items });
    ($<HTMLInputElement>("#webdav-password")).value = "";
    toast(`WebDAV transfer complete: ${report.copied} of ${report.total} files uploaded.`);
  } catch (error) { toast(`WebDAV stopped: ${String(error)}`, true); }
  finally { button.disabled = false; button.textContent = "Sync with WebDAV"; }
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
    try { const parsed = JSON.parse(text); imported = (Array.isArray(parsed) ? parsed : parsed.highlights || []).map((item: Partial<Highlight>) => ({ id: crypto.randomUUID(), book: item.book || file.name, quote: item.quote || "", note: item.note || "", location: item.location || "Imported", created: item.created || "" })).filter((item: Highlight) => item.quote); } catch { /* Markdown fallback already parsed */ }
  }
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

function openLicense() { const dialog = $("#license-dialog") as HTMLDialogElement; dialog.showModal(); window.setTimeout(() => $("#license-token").focus(), 0); }

function licenseIsActive() {
  const verdict = safeJson(localStorage.getItem(VERDICT_KEY));
  return Boolean(localStorage.getItem(LICENSE_KEY) && verdict?.valid);
}

async function verifyLicense(token: string, quiet = false) {
  if (!token) { if (!quiet) toast("Paste your license token first.", true); return false; }
  if (!navigator.onLine) { if (!quiet) toast("License verification needs a connection. Try again when online.", true); return licenseIsActive(); }
  try {
    const response = await fetch(`${API}/products/${PRODUCT}/verify?license=${encodeURIComponent(token)}`);
    const verdict = await response.json() as { valid: boolean; reason: string };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ ...verdict, checkedAt: Date.now() }));
    if (verdict.valid) { localStorage.setItem(LICENSE_KEY, token); $("#license-button").textContent = "Field edition active"; if (!quiet) toast("Field edition unlocked on this computer."); }
    else { localStorage.removeItem(LICENSE_KEY); if (!quiet) toast("This license is no longer active. Check the token or purchase again.", true); }
    return verdict.valid;
  } catch { if (!quiet) toast("The license server could not be reached. Your free tools still work.", true); return licenseIsActive(); }
}

function safeJson(value: string | null): { valid?: boolean; checkedAt?: number } | null { try { return value ? JSON.parse(value) : null; } catch { return null; } }

async function initializeLicense() {
  const params = new URLSearchParams(location.search);
  const returned = params.get("license");
  if (returned) { localStorage.setItem(LICENSE_KEY, returned); history.replaceState({}, "", location.pathname); await verifyLicense(returned); }
  const token = localStorage.getItem(LICENSE_KEY);
  const cached = safeJson(localStorage.getItem(VERDICT_KEY));
  if (cached?.valid) $("#license-button").textContent = "Field edition active";
  if (token && (!cached?.checkedAt || Date.now() - cached.checkedAt > 86_400_000)) void verifyLicense(token, true);
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
$("#search").addEventListener("input", renderCatalogue); $("#format-filter").addEventListener("change", renderCatalogue);
$("#add-collection").addEventListener("click", openCollectionDialog); $("#collection-form").addEventListener("submit", saveCollection);
$("#usb-sync").addEventListener("click", usbSync); $("#webdav-form").addEventListener("submit", webdavSync);
$("#import-highlights").addEventListener("click", importHighlights); $("#browser-highlight").addEventListener("change", browserHighlightPicked); $("#export-highlights").addEventListener("click", exportHighlights);
$("#license-button").addEventListener("click", openLicense); $("#license-form").addEventListener("submit", async (event) => { const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null; if (submitter?.value !== "default") return; event.preventDefault(); const valid = await verifyLicense(($<HTMLInputElement>("#license-token")).value.trim()); if (valid) ($("#license-dialog") as HTMLDialogElement).close(); });
window.addEventListener("offline", () => toast("You are offline. Catalogue, collections, USB, and Markdown export still work."));
window.addEventListener("online", () => toast("Connection restored. WebDAV and license verification are available."));
render(); setPanel("catalogue"); void initializeLicense();
