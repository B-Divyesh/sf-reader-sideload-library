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
});

describe("portable Markdown highlights", () => {
  it("round trips quotes and notes", () => {
    const markdown = highlightsToMarkdown([{ id: "h", book: "Moss", quote: "Keep this.", note: "Important", location: "p. 4", created: "2026-08-28" }]);
    const parsed = parseMarkdownHighlights(markdown);
    expect(parsed[0]).toMatchObject({ book: "Moss", quote: "Keep this.", note: "Important" });
  });
});
