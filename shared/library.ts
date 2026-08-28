export type Format = "EPUB" | "PDF";

export interface Book {
  id: string;
  path: string;
  title: string;
  authors: string[];
  series: string | null;
  seriesIndex: number | null;
  format: Format;
  sizeBytes: number;
  modified: number;
  coverStatus: "found" | "missing" | "not-applicable";
  metadataStatus: "valid" | "inferred" | "warning";
  warnings: string[];
  eligible: boolean;
  selected?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  bookIds: string[];
}

export interface Highlight {
  id: string;
  book: string;
  quote: string;
  note: string;
  location: string;
  created: string;
}

export function safeName(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\.+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100) || "Untitled";
}

export function buildSyncItems(books: Book[], collections: Collection[]) {
  const eligible = new Map(books.filter((book) => book.eligible).map((book) => [book.id, book]));
  const used = new Set<string>();
  const items: Array<{ source: string; relativePath: string; bookId: string }> = [];
  const assigned = new Set<string>();

  collections.forEach((collection, collectionIndex) => {
    collection.bookIds.forEach((id, bookIndex) => {
      const book = eligible.get(id);
      if (!book) return;
      assigned.add(id);
      const extension = book.format.toLowerCase();
      const base = `${String(bookIndex + 1).padStart(3, "0")} - ${safeName(book.title)}.${extension}`;
      const relativePath = uniquePath(`${String(collectionIndex + 1).padStart(2, "0")} - ${safeName(collection.name)}/${base}`, used);
      items.push({ source: book.path, relativePath, bookId: id });
    });
  });

  books.filter((book) => book.eligible && !assigned.has(book.id)).forEach((book) => {
    const relativePath = uniquePath(`Unsorted/${safeName(book.title)}.${book.format.toLowerCase()}`, used);
    items.push({ source: book.path, relativePath, bookId: book.id });
  });
  return items;
}

function uniquePath(path: string, used: Set<string>) {
  let candidate = path;
  let count = 2;
  const dot = path.lastIndexOf(".");
  while (used.has(candidate.toLocaleLowerCase())) {
    candidate = `${path.slice(0, dot)} (${count})${path.slice(dot)}`;
    count += 1;
  }
  used.add(candidate.toLocaleLowerCase());
  return candidate;
}

export function highlightsToMarkdown(highlights: Highlight[]): string {
  const grouped = new Map<string, Highlight[]>();
  for (const highlight of highlights) {
    const key = highlight.book || "Untitled";
    grouped.set(key, [...(grouped.get(key) || []), highlight]);
  }
  const sections = [...grouped].map(([book, entries]) => {
    const rows = entries.map((entry) => [
      `> ${entry.quote.replace(/\n/g, "\n> ")}`,
      entry.note ? `\n**Note:** ${entry.note}` : "",
      `\n— ${entry.location || "Unknown location"}${entry.created ? ` · ${entry.created}` : ""}`
    ].join(""));
    return `## ${book}\n\n${rows.join("\n\n---\n\n")}`;
  });
  return `# Reader highlights\n\nExported by Reader Sideload Library.\n\n${sections.join("\n\n")}`;
}

export function parseMarkdownHighlights(markdown: string, fallbackBook = "Imported notes"): Highlight[] {
  let currentBook = fallbackBook;
  const entries: Highlight[] = [];
  let quote: string[] = [];
  let note = "";
  const flush = () => {
    if (!quote.length) return;
    entries.push({ id: crypto.randomUUID(), book: currentBook, quote: quote.join("\n"), note, location: "Imported", created: "" });
    quote = [];
    note = "";
  };
  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith("## ")) { flush(); currentBook = line.slice(3).trim() || fallbackBook; }
    else if (line.startsWith("> ")) quote.push(line.slice(2));
    else if (line.startsWith("**Note:**")) note = line.slice(9).trim();
    else if (line === "---") flush();
  }
  flush();
  return entries;
}
