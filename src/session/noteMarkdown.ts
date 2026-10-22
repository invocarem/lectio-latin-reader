/**
 * A small reading of a learning-note body: paragraphs, lists, and pipe tables.
 * The editor keeps the source. This only builds the view, and it never treats
 * the text as HTML.
 */

export type Inline =
  | { kind: "text"; text: string }
  | { kind: "code"; text: string }
  | { kind: "em"; children: Inline[] }
  | { kind: "strong"; children: Inline[] };

export type Align = "left" | "center" | "right";

export type ListItem = { children: Inline[]; nested: Block[] };

export type Block =
  | { kind: "paragraph"; children: Inline[] }
  | { kind: "list"; ordered: boolean; items: ListItem[] }
  | { kind: "table"; align: Align[]; header: Inline[][]; rows: Inline[][][] };

const LIST_LINE = /^(\s*)([-+*]|\d+[.)])\s+(.*)$/;

/** Blocks in reading order. An empty body is an empty list. */
export function parseNoteMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim() === "") {
      i += 1;
      continue;
    }
    if (isTableStart(lines, i)) {
      const parsed = parseTable(lines, i);
      blocks.push(parsed.block);
      i = parsed.next;
      continue;
    }
    if (listMatch(lines[i])) {
      const parsed = parseList(lines, i);
      blocks.push(parsed.block);
      i = parsed.next;
      continue;
    }
    const text: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !listMatch(lines[i]) &&
      !isTableStart(lines, i)
    ) {
      text.push(lines[i].trim());
      i += 1;
    }
    const children = parseInlines(text.join(" "));
    if (children.length > 0) blocks.push({ kind: "paragraph", children });
  }
  return blocks;
}

function listMatch(line: string): { indent: number; marker: string; text: string } | null {
  const match = LIST_LINE.exec(line);
  if (!match) return null;
  return { indent: match[1].length, marker: match[2], text: match[3] };
}

function parseList(lines: string[], start: number): { block: Block; next: number } {
  const first = listMatch(lines[start]);
  if (!first) return { block: { kind: "list", ordered: false, items: [] }, next: start + 1 };
  const ordered = /^\d/.test(first.marker);
  const base = first.indent;
  const items: ListItem[] = [];
  let i = start;
  while (i < lines.length && lines[i].trim() !== "") {
    const mark = listMatch(lines[i]);
    if (!mark || mark.indent < base) break;
    if (mark.indent > base) {
      if (items.length === 0) break;
      const nested = parseList(lines, i);
      items[items.length - 1].nested.push(nested.block);
      i = nested.next;
      continue;
    }
    if (/^\d/.test(mark.marker) !== ordered) break;
    const item: ListItem = { children: parseInlines(mark.text), nested: [] };
    items.push(item);
    i += 1;
    while (i < lines.length && lines[i].trim() !== "") {
      const next = listMatch(lines[i]);
      if (next) break;
      const indent = /^\s*/.exec(lines[i])?.[0].length ?? 0;
      if (indent <= base) break;
      item.children = joinInlines(item.children, parseInlines(lines[i].trim()));
      i += 1;
    }
  }
  return { block: { kind: "list", ordered, items }, next: i };
}

function joinInlines(left: Inline[], right: Inline[]): Inline[] {
  if (right.length === 0) return left;
  return [...left, { kind: "text", text: " " }, ...right];
}

function isTableStart(lines: string[], index: number): boolean {
  const header = lines[index];
  const rule = lines[index + 1];
  if (!header || !rule) return false;
  if (!header.includes("|") || !rule.includes("|")) return false;
  const cells = splitRow(rule);
  return cells.length > 0 && cells.every((cell) => /^:?-+:?$/.test(cell));
}

function parseTable(lines: string[], start: number): { block: Block; next: number } {
  const headerCells = splitRow(lines[start]);
  const align = splitRow(lines[start + 1]).map(alignOf);
  const width = Math.max(headerCells.length, align.length);
  const header = pad(headerCells, width).map(parseInlines);
  const rows: Inline[][][] = [];
  let i = start + 2;
  while (i < lines.length && lines[i].trim() !== "" && lines[i].includes("|")) {
    rows.push(pad(splitRow(lines[i]), width).map(parseInlines));
    i += 1;
  }
  const filled = align.length < width ? [...align, ...Array<Align>(width - align.length).fill("left")] : align.slice(0, width);
  return { block: { kind: "table", align: filled, header, rows }, next: i };
}

function pad(cells: string[], width: number): string[] {
  const next = cells.slice(0, width);
  while (next.length < width) next.push("");
  return next;
}

function alignOf(cell: string): Align {
  const left = cell.startsWith(":");
  const right = cell.endsWith(":");
  if (left && right) return "center";
  if (right) return "right";
  return "left";
}

function splitRow(line: string): string[] {
  let text = line.trim();
  if (text.startsWith("|")) text = text.slice(1);
  if (text.endsWith("|")) text = text.slice(0, -1);
  const cells: string[] = [];
  let buf = "";
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "\\" && text[i + 1] === "|") {
      buf += "|";
      i += 1;
      continue;
    }
    if (text[i] === "|") {
      cells.push(buf.trim());
      buf = "";
      continue;
    }
    buf += text[i];
  }
  cells.push(buf.trim());
  return cells;
}

/** Emphasis and code. An unclosed mark stays as text. */
export function parseInlines(source: string): Inline[] {
  const out: Inline[] = [];
  let buf = "";
  const flush = () => {
    if (buf.length === 0) return;
    out.push({ kind: "text", text: buf });
    buf = "";
  };
  let i = 0;
  while (i < source.length) {
    if (source[i] === "\\" && i + 1 < source.length) {
      buf += source[i + 1];
      i += 2;
      continue;
    }
    if (source[i] === "`") {
      const end = source.indexOf("`", i + 1);
      if (end > i) {
        flush();
        out.push({ kind: "code", text: source.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    const strong = strongMark(source, i);
    if (strong) {
      const end = source.indexOf(strong, i + 2);
      if (end > i + 1) {
        flush();
        out.push({ kind: "strong", children: parseInlines(source.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }
    const em = emMark(source, i);
    if (em) {
      const end = closingEm(source, i + 1, em);
      if (end > i) {
        flush();
        out.push({ kind: "em", children: parseInlines(source.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }
    buf += source[i];
    i += 1;
  }
  flush();
  return out;
}

function strongMark(source: string, index: number): "**" | "__" | null {
  const mark = source.slice(index, index + 2);
  return mark === "**" || mark === "__" ? mark : null;
}

function emMark(source: string, index: number): "*" | "_" | null {
  const ch = source[index];
  if (ch !== "*" && ch !== "_") return null;
  if (source[index + 1] === ch) return null;
  if (ch === "_" && wordChar(source[index - 1])) return null;
  return ch;
}

function closingEm(source: string, from: number, mark: "*" | "_"): number {
  for (let i = from; i < source.length; i += 1) {
    if (source[i] === "\\") {
      i += 1;
      continue;
    }
    if (source[i] !== mark || source[i + 1] === mark) continue;
    if (mark === "_" && wordChar(source[i + 1])) continue;
    return i;
  }
  return -1;
}

function wordChar(ch: string | undefined): boolean {
  return ch != null && /[\p{L}\p{N}]/u.test(ch);
}
