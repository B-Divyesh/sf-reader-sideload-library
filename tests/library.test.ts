import { describe, expect, it } from "vitest";
import { buildSyncItems, highlightsToMarkdown, parseMarkdownHighlights, safeName, type Book } from "../shared/library";

const book = (id: string, title: string): Book => ({
  id, title, path: `/library/${id}.epub`, authors: ["A. Reader"], series: null, seriesIndex: null,
  format: "EPUB", sizeBytes: 100, modified: 0, coverStatus: "found", metadataStatus: "valid", warnings: [], eligible: true
});

describe("device-safe library planning", () => {
  it("removes unsafe device filename characters", () => expect(safeName('One: <Two> / Three?')).toBe("One- -Two- - Three-"));
  it("preserves collection order and de-duplicates output paths", () => {
    const items = buildSyncItems([book("a", "Same"), book("b", "Same")], [{ id: "c", name: "Queue", bookIds: ["b", "a"] }]);
    expect(items.map((item) => item.bookId)).toEqual(["b", "a"]);
    expect(new Set(items.map((item) => item.relativePath.toLowerCase())).size).toBe(2);
  });
  it("keeps a decoded Unicode PDF title intact in the sync filename", () => {
    const pdf = { ...book("pdf", "Field Notes 03 — 秋"), format: "PDF" as const, path: "/library/field-notes.pdf" };
    const [item] = buildSyncItems([pdf], [{ id: "queue", name: "Autumn Queue", bookIds: ["pdf"] }]);
    expect(item?.relativePath).toBe("01 - Autumn Queue/001 - Field Notes 03 — 秋.pdf");
    expect(item?.relativePath).not.toContain("�");
  });
});

describe("portable Markdown highlights", () => {
  it("round trips quotes and notes", () => {
    const markdown = highlightsToMarkdown([{ id: "h", book: "Moss", quote: "Keep this.", note: "Important", location: "p. 4", created: "2026-08-28" }]);
    const parsed = parseMarkdownHighlights(markdown);
    expect(parsed[0]).toMatchObject({ book: "Moss", quote: "Keep this.", note: "Important" });
  });
});
