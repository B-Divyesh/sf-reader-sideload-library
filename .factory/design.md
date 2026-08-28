# Visual thesis — brutalist concrete and moss

Reader Sideload Library looks like a field tool set on a concrete archive table: quiet, durable, labelled, and willing to show its workings. The interface avoids glossy device-store conventions because this product is about ownership and transfer, not consumption. A warm paper field keeps book data legible; graphite slabs create structure; moss signals safe movement and living continuity between library and reader.

## Palette

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| `paper` | `#F2F0E7` | `#181B18` | page / reading surface |
| `concrete` | `#D8D6CB` | `#292D29` | grouped controls and secondary surfaces |
| `graphite` | `#20231F` | `#F2F0E7` | primary text and structural borders |
| `ash` | `#50564F` | `#C1C5BC` | secondary text (verified ≥4.5:1) |
| `moss` | `#3F5B32` | `#A6C98A` | primary action, focus, healthy transfer |
| `lichen` | `#DDE7D4` | `#34422E` | selected/complete field |
| `rust` | `#9B3E2D` | `#FF9D87` | errors and destructive states |
| `amber` | `#8A5A0A` | `#F3C678` | validation warnings |

Status always includes a label or symbol; colour never carries meaning alone. Light is the default because EPUB metadata is examined like a catalogue card. Dark follows the operating-system preference and keeps the same material hierarchy.

## Type and spacing

The display face is self-hosted **Archivo Black**, used only for the product name, counts, and short section labels. The working face is self-hosted **IBM Plex Sans**, chosen for compact, highly differentiated catalogue data. Both are SIL Open Font License assets and will be subset to the shipped glyph range. Type steps are 13, 16, 20, 28, and clamp(40–72) px, with body copy at 16px/1.55. Numeric columns use tabular figures.

Spacing follows a strict 4px field-grid: 4, 8, 12, 16, 24, 32, 48, 72. One-pixel graphite rules and occasional 3px structural borders evoke stamped library equipment. Corners stay at 0–6px; broad pill-shaped UI is excluded.

## Layout and interaction grammar

- Landing: copy and download action occupy a left ledger; an original device-transfer still life occupies the right. A narrow status rail makes platform detection visible.
- App: a persistent top workbench names the current library, followed by three task stages — Catalogue, Collections, Transfer & notes. On phones these become a single horizontal, scrollable tab strip and the data table turns into labelled book rows.
- Primary actions are moss blocks with a 3px graphite offset shadow. Pressing physically collapses the offset. Secondary actions look like stamped paper labels.
- Transfer progress is a finite ruled track. Disconnects keep the completed item count and offer a precise retry.
- Empty states explain the next physical action (choose a folder, connect a reader, or import notes) instead of decorating the absence.

## Motion

Motion follows physical cause over 180–240ms: buttons depress, a scanned row settles from 4px above, and progress advances linearly. Nothing loops. With `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed and state changes become instantaneous opacity changes. Depth remains through rules, tone, and shadow.

## Asset plan and prompt sheet

One generated hero still life clarifies the product: an unbranded e-ink reader, a USB cable, concrete archive slabs, moss and paper catalogue cards arranged as a transfer path. It is editorial evidence of device handoff, not a screenshot or capability claim. Interface icons are original inline SVG strokes authored in the repository; no icon library or third-party runtime asset is used.

**Master prompt**

> Use case: product-mockup. Asset type: landing page hero. Scene: top-down editorial still life on rough pale concrete. Subject: one unbranded e-ink reader showing abstract book rows, a coiled USB-C cable, three cream archival index cards moving toward the reader, and small restrained patches of real moss growing through concrete seams. Style: tactile architectural product photography with slight print grain, brutalist composition. Composition: landscape, device on right, diagonal transfer path from lower left, clear breathing room. Light: soft overcast window light, grounded shadows. Palette: paper cream, charcoal graphite, mineral grey, deep moss green, small oxidized rust accent. Materials: raw concrete, recycled card, matte black polymer, natural moss. Constraints: plausible cable and device geometry, no people, no books with readable titles, no text, no watermark, no logos, no brand marks, no gradient, no neon, no glossy sci-fi UI.

The selected image is generated with the factory Azure image deployment on 2026-08-28. Original generated imagery is licensed for this product and disclosed in the footer. The exact prompt and generation parameters also live beside the source asset in `assets/src/hero.json`. The shipped WebP will be ≤300 KB with explicit dimensions; source PNG remains in `assets/src/` for provenance.
