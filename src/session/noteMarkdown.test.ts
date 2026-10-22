import { parseNoteMarkdown } from "./noteMarkdown";

function textOf(block: ReturnType<typeof parseNoteMarkdown>[number]): string {
  if (block.kind === "paragraph") return inlineText(block.children);
  if (block.kind === "list") return block.items.map((item) => inlineText(item.children)).join("|");
  return block.header.map((cell) => inlineText(cell)).join("|");
}

function inlineText(nodes: { kind: string; text?: string; children?: { kind: string; text?: string }[] }[]): string {
  return nodes
    .map((node) => {
      if (node.kind === "text" || node.kind === "code") return node.text ?? "";
      return node.children?.map((child) => child.text ?? "").join("") ?? "";
    })
    .join("");
}

describe("note markdown view", () => {
  test("a paragraph joins wrapped lines and keeps emphasis", () => {
    const blocks = parseNoteMarkdown("Lucerna **pedibus**\nmeis, *verbum* `tuum`.");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].kind).toBe("paragraph");
    if (blocks[0].kind !== "paragraph") return;
    expect(blocks[0].children.map((node) => node.kind)).toEqual(["text", "strong", "text", "em", "text", "code", "text"]);
    expect(textOf(blocks[0])).toBe("Lucerna pedibus meis, verbum tuum.");
  });

  test("a bullet list and a numbered list stay separate", () => {
    const blocks = parseNoteMarkdown("- aleph\n- beth\n\n1. first\n2. second");
    expect(blocks.map((block) => block.kind)).toEqual(["list", "list"]);
    expect(blocks[0]).toMatchObject({ ordered: false });
    expect(blocks[1]).toMatchObject({ ordered: true });
    expect(textOf(blocks[0])).toBe("aleph|beth");
    expect(textOf(blocks[1])).toBe("first|second");
  });

  test("an indented bullet nests under the item above", () => {
    const blocks = parseNoteMarkdown("- verse\n  - lucerna\n- next");
    expect(blocks).toHaveLength(1);
    if (blocks[0].kind !== "list") return;
    expect(blocks[0].items).toHaveLength(2);
    expect(blocks[0].items[0].nested).toEqual([
      { kind: "list", ordered: false, items: [{ children: [{ kind: "text", text: "lucerna" }], nested: [] }] },
    ]);
  });

  test("a pipe table keeps the header, the rows, and the column alignment", () => {
    const blocks = parseNoteMarkdown("| Latin | English |\n| --- | ---: |\n| lucerna | a lamp |\n| pes | foot |");
    expect(blocks).toHaveLength(1);
    if (blocks[0].kind !== "table") return;
    expect(blocks[0].align).toEqual(["left", "right"]);
    expect(textOf(blocks[0])).toBe("Latin|English");
    expect(blocks[0].rows.map((row) => row.map((cell) => inlineText(cell)))).toEqual([
      ["lucerna", "a lamp"],
      ["pes", "foot"],
    ]);
  });

  test("a single pipe in a sentence is not a table", () => {
    const blocks = parseNoteMarkdown("pes | foot, in the gloss.");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].kind).toBe("paragraph");
    expect(textOf(blocks[0])).toBe("pes | foot, in the gloss.");
  });

  test("an unclosed mark stays as it was written", () => {
    const blocks = parseNoteMarkdown("still **open");
    expect(textOf(blocks[0])).toBe("still **open");
  });
});
