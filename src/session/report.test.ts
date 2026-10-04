import { describe, expect, it } from "vitest";
import type { SessionDoc } from "./document";
import { ALL_PLACES } from "./cursus";
import { buildReportDoc, buildSessionReport } from "./report";

function cursusDoc(patch?: Partial<SessionDoc>): SessionDoc {
  return {
    id: "2026-09-27",
    work: "cursus",
    pace: 14,
    started: "2026-09-27",
    cursor: null,
    satWith: [],
    annotations: [],
    ...patch,
  };
}

describe("buildSessionReport", () => {
  it("partitions every slice of the week into the three tables", () => {
    const total = new Set(ALL_PLACES.map((place) => place.key)).size;
    const report = buildSessionReport(cursusDoc(), total);

    expect(report.tables.map((table) => table.title)).toEqual([
      "Psalm 118",
      "Gradual Psalms",
      "The Psalter",
    ]);

    const all = report.tables.flatMap((table) => table.cells);
    expect(all).toHaveLength(total);

    const psalter = report.tables[2].cells;
    const graduals = report.tables[1].cells;
    const p118 = report.tables[0].cells;

    expect(graduals).toHaveLength(15);
    expect(new Set(graduals.map((cell) => cell.psalm))).toEqual(
      new Set(Array.from({ length: 15 }, (_, i) => 119 + i)),
    );
    expect(p118).toHaveLength(22);
    expect(p118.every((cell) => cell.psalm === 118)).toBe(true);
    // Each cell is its section name ("Aleph", "Beth", …), never the number.
    expect(p118.every((cell) => !cell.label.includes("118"))).toBe(true);
    expect(new Set(p118.map((cell) => cell.label))).toHaveLength(22);
    expect(p118[0].label).toBe("Aleph");

    // The Psalter holds the rest: no 118, no 119–133, and all 150 appear somewhere.
    const psalterPsalms = new Set(psalter.map((cell) => cell.psalm));
    expect(psalterPsalms.has(118)).toBe(false);
    for (let n = 119; n <= 133; n++) expect(psalterPsalms.has(n)).toBe(false);
    for (let n = 1; n <= 150; n++) {
      const inTables = report.tables.some((table) =>
        table.cells.some((cell) => cell.psalm === n),
      );
      expect(inTables).toBe(true);
    }
  });

  it("shows each slice of a divided psalm as its own cell", () => {
    const total = new Set(ALL_PLACES.map((place) => place.key)).size;
    const report = buildSessionReport(cursusDoc(), total);
    const psalm9 = report.tables[2].cells.filter((cell) => cell.psalm === 9);
    expect(psalm9).toHaveLength(2);
    expect(psalm9.map((cell) => cell.done)).toEqual([false, false]);
  });

  it("shades done slices and leaves the rest not done", () => {
    const total = new Set(ALL_PLACES.map((place) => place.key)).size;
    // Psalm 3 is a weekday Vigils daily psalm, one slice, step "vigils:3".
    const doc = cursusDoc({ satWith: [{ step: "vigils:3", at: "2026-09-27" }] });
    const report = buildSessionReport(doc, total);
    const all = report.tables.flatMap((table) => table.cells);
    const psalm3 = all.find((cell) => cell.psalm === 3);
    expect(psalm3?.done).toBe(true);
    expect(all.filter((cell) => cell.done)).toHaveLength(1);
  });

  it("counts distinct slices sat, not sittings", () => {
    const total = new Set(ALL_PLACES.map((place) => place.key)).size;
    const doc = cursusDoc({
      satWith: [
        { step: "compline:4", at: "2026-09-27" },
        { step: "compline:4", at: "2026-09-28" },
      ],
    });
    const report = buildSessionReport(doc, total);
    expect(report.count).toBe(1);
    expect(report.tables.flatMap((table) => table.cells).filter((cell) => cell.done)).toHaveLength(1);
  });

  it("reflects annotations (highlight and note together)", () => {
    const total = new Set(ALL_PLACES.map((place) => place.key)).size;
    const doc = cursusDoc({
      annotations: [{ psalm: 50, line: "12", text: "Miserere", at: "2026-09-28" }],
    });
    const report = buildSessionReport(doc, total);
    expect(report.annotations).toHaveLength(1);
    expect(report.annotations[0].text).toBe("Miserere");
  });
});

describe("buildReportDoc", () => {
  it("lays the report out as a Word document", () => {
    const total = new Set(ALL_PLACES.map((place) => place.key)).size;
    const report = buildSessionReport(cursusDoc(), total);
    const document = buildReportDoc(report, "2026-09-30");
    expect(document).toBeDefined();
  });

  it("renders a valid .docx (zip) buffer end to end", async () => {
    const { reportBlob } = await import("./report");
    const JSZip = (await import("jszip")).default;
    const total = new Set(ALL_PLACES.map((place) => place.key)).size;
    const doc = cursusDoc({ satWith: [{ step: "vigils:3", at: "2026-09-27" }] });
    const blob = await reportBlob(doc, total, "2026-09-30");
    expect(blob.type).toBe("application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const documentXml = await zip.file("word/document.xml")?.async("string");
    expect(documentXml).toBeDefined();
    // It is a real Word document that lays out the psalm slice grids as tables.
    expect(documentXml).toContain("<w:tbl>");
    expect(documentXml).toContain("w:tblW");
    // A generated title and the done/not-done shading fills are present.
    expect(documentXml).toContain("Cursus — Session Report");
    expect(documentXml).toContain("C6EFCE");
    // Started 2026-09-27, generated 2026-09-30 (3 days later) at pace 14 → day 4 of 14.
    // The bold label and value are separate runs, so assert on the value.
    expect(documentXml).toContain("4 of 14");
  });
});
