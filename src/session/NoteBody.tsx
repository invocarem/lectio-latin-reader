/**
 * The reading view of one learning note. The source stays in the editor.
 */

import { parseNoteMarkdown, type Align, type Block, type Inline } from "./noteMarkdown";

export function NoteBody({ text }: { text: string }) {
  const blocks = parseNoteMarkdown(text);
  if (blocks.length === 0) return null;
  return (
    <div className="learning-note-body">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  if (block.kind === "paragraph") {
    return (
      <p>
        <Inlines nodes={block.children} />
      </p>
    );
  }
  if (block.kind === "list") {
    const Tag = block.ordered ? "ol" : "ul";
    return (
      <Tag>
        {block.items.map((item, index) => (
          <li key={index}>
            <Inlines nodes={item.children} />
            {item.nested.map((nested, nestedIndex) => (
              <BlockView key={nestedIndex} block={nested} />
            ))}
          </li>
        ))}
      </Tag>
    );
  }
  return (
    <table>
      <thead>
        <tr>
          {block.header.map((cell, index) => (
            <th key={index} className={alignClass(block.align[index])}>
              <Inlines nodes={cell} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {block.rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {block.header.map((_, index) => (
              <td key={index} className={alignClass(block.align[index])}>
                <Inlines nodes={row[index] ?? []} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function alignClass(align: Align | undefined): string | undefined {
  if (align === "right" || align === "center") return align;
  return undefined;
}

function Inlines({ nodes }: { nodes: Inline[] }) {
  return nodes.map((node, index) => {
    if (node.kind === "text") return <span key={index}>{node.text}</span>;
    if (node.kind === "code") return <code key={index}>{node.text}</code>;
    if (node.kind === "strong") {
      return (
        <strong key={index}>
          <Inlines nodes={node.children} />
        </strong>
      );
    }
    return (
      <em key={index}>
        <Inlines nodes={node.children} />
      </em>
    );
  });
}
