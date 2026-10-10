/**
 * A report of a session pass as a Word (.docx) document.
 *
 * The report is the session record only: it carries no Latin and no English.
 * Its heart is a set of tables that identify every psalm of the cursus by
 * number — one cell per slice — each cell shaded done or not done, so a glance
 * shows how far the pass has gone. It has no list of "sat with" marks and no
 * sitting dates.
 *
 * Three tables:
 *  - the Psalter, the ordinary psalms (every slice except Psalm 118 and the
 *    Gradual psalms 119–133);
 *  - the Gradual psalms, 119–133;
 *  - Psalm 118, its twenty-two slices (Aleph…Tau).
 *
 * A divided psalm shows one cell per slice (Psalm 9 is two cells, Psalm 118 is
 * twenty-two), and each cell is shaded on its own.
 */

import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import type { Annotation, SessionDoc } from "./document";
import { ALL_PLACES, daysFrom, keyOfStep } from "./cursus";
import { sliceLabel } from "../content/office/resolve";

/** Colors for the grid: done is green, not done is a neutral gray. */
const DONE_FILL = "C6EFCE";
const NOT_DONE_FILL = "F2F2F2";

/** One cell of a psalm table: a slice, shaded by whether it is done. */
export type SliceCell = {
  /** Compact label: a number for a whole psalm, "36 · 1" or "118 · Aleph" for a slice. */
  label: string;
  done: boolean;
  psalm: number;
  /** The slice's identity in the pass (keyOfStep). */
  key: string;
};

/** One table of the report: a title, a column count, and its slice cells. */
export type ReportTable = {
  title: string;
  columns: number;
  cells: SliceCell[];
};

/** The whole report, as pure data, ready to be laid out in a document. */
export type SessionReport = {
  work: string;
  pace?: 7 | 14 | 40;
  started: string;
  count: number;
  total: number;
  tables: ReportTable[];
  annotations: Annotation[];
};

const GRADUAL_FROM = 119;
const GRADUAL_TO = 133;

function cellLabel(slice: { psalm: number; from?: number; to?: number }): string {
  return sliceLabel(slice).replace(/^Psalmus /, "");
}

/** A divided psalm's note key is `part:line`; the heading names the part. */
function annotationHeading(annotation: Annotation): string {
  const divided = /^(\d+):(\d+)$/.exec(annotation.line);
  if (!divided) return `Psalmus ${annotation.psalm} · line ${annotation.line}`;
  return `Psalmus ${annotation.psalm} · ${divided[1]} · line ${divided[2]}`;
}

/** A Psalm 118 cell shows only its section name ("Aleph", "Beth", …), not the number. */
function p118Label(slice: { psalm: number; from?: number; to?: number }): string {
  const name = sliceLabel(slice).split("·")[1]?.trim();
  return name || String(slice.psalm);
}

/** Whether the slice is done in the pass, by its slice key. */
function isDone(satKeys: ReadonlySet<string>, key: string): boolean {
  return satKeys.has(key);
}

/** Every distinct slice of the week, in cursus order, deduped by its key. */
function distinctSlices(): { key: string; psalm: number; label: string }[] {
  const seen = new Set<string>();
  const result: { key: string; psalm: number; label: string }[] = [];
  for (const place of ALL_PLACES) {
    if (seen.has(place.key)) continue;
    seen.add(place.key);
    result.push({
      key: place.key,
      psalm: place.slice.psalm,
      label: place.slice.psalm === 118 ? p118Label(place.slice) : cellLabel(place.slice),
    });
  }
  return result;
}

/** Assemble the pass into the three psalm tables, each cell shaded by status. */
export function buildSessionReport(doc: SessionDoc, total: number): SessionReport {
  const satKeys = new Set(doc.satWith.map((mark) => keyOfStep(mark.step)));
  const main: SliceCell[] = [];
  const graduals: SliceCell[] = [];
  const p118: SliceCell[] = [];

  for (const slice of distinctSlices()) {
    const cell: SliceCell = { ...slice, done: isDone(satKeys, slice.key) };
    if (slice.psalm === 118) p118.push(cell);
    else if (slice.psalm >= GRADUAL_FROM && slice.psalm <= GRADUAL_TO) graduals.push(cell);
    else main.push(cell);
  }

  // Sort each table by psalm number so the grid is easy to scan; a slice keeps
  // its part order because the sort is stable.
  const byPsalm = (a: SliceCell, b: SliceCell) => a.psalm - b.psalm;
  main.sort(byPsalm);
  graduals.sort(byPsalm);
  p118.sort(byPsalm);

  return {
    work: doc.work,
    ...(doc.work === "cursus" ? { pace: doc.pace } : {}),
    started: doc.started,
    count: satKeys.size,
    total,
    tables: [
      { title: "Psalm 118", columns: 11, cells: p118 },
      { title: "Gradual Psalms", columns: 15, cells: graduals },
      { title: "The Psalter", columns: 12, cells: main },
    ],
    annotations: doc.annotations,
  };
}

function metaParagraph(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(value)],
  });
}

/** One shaded cell: the slice label centered on its fill color. */
function sliceCell(cell: SliceCell): TableCell {
  return new TableCell({
    shading: { fill: cell.done ? DONE_FILL : NOT_DONE_FILL },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 60, right: 60 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: cell.label })],
      }),
    ],
  });
}

/** A repeating grid of slice cells, padded to full rows. */
function gridTable(cells: SliceCell[], columns: number): Table {
  const rows: TableRow[] = [];
  for (let i = 0; i < cells.length; i += columns) {
    const rowCells = cells.slice(i, i + columns).map(sliceCell);
    while (rowCells.length < columns) {
      rowCells.push(new TableCell({ children: [new Paragraph("")] }));
    }
    rows.push(new TableRow({ children: rowCells }));
  }
  return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });
}

/** Lay the structured report out as a Word document (landscape, for the grids). */
export function buildReportDoc(report: SessionReport, generated: string): Document {
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: report.work === "cursus" ? "Cursus — Session Report" : `${report.work} — Session Report` })],
    }),
    metaParagraph("Work", report.work),
  );
  if (report.pace != null) children.push(metaParagraph("Pace", `${report.pace} days`));
  children.push(metaParagraph("Started", report.started));
  if (report.pace != null) {
    // Whole civil days since the pass began; the day within the pass is one more.
    const day = daysFrom(report.started, generated) + 1;
    children.push(metaParagraph("Day", `${day} of ${report.pace}`));
  }
  children.push(
    metaParagraph("Progress", `${report.count} of ${report.total} slices done`),
    metaParagraph("Generated", generated),
  );

  for (const table of report.tables) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: table.title })],
      }),
    );
    if (table.cells.length === 0) {
      children.push(new Paragraph({ children: [new TextRun("None yet.")] }));
    } else {
      children.push(gridTable(table.cells, table.columns));
    }
  }

  if (report.annotations.length > 0) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Annotations")] }));
    for (const annotation of report.annotations) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `${annotationHeading(annotation)} — `, bold: true }),
            new TextRun(annotation.text || "(highlighted)"),
            ...(annotation.at ? [new TextRun({ text: `  (${annotation.at})`, italics: true })] : []),
          ],
        }),
      );
    }
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE, width: 15840, height: 12240 },
          },
        },
        children,
      },
    ],
  });
}

/** Assemble and lay out the pass in one step. */
export function buildReport(doc: SessionDoc, total: number, generated: string): Document {
  return buildReportDoc(buildSessionReport(doc, total), generated);
}

/** Render the report as a .docx Blob, ready to save. */
export function reportBlob(doc: SessionDoc, total: number, generated: string): Promise<Blob> {
  return Packer.toBlob(buildReport(doc, total, generated));
}
