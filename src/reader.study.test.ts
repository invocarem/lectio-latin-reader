/// <reference types="vitest/globals" />
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Reader } from "./components/Reader";
import { cantica } from "./content/cantica";
import { gradibus } from "./content/gradibus";
import { psalter } from "./content/psalter";

function markup(
  work: typeof cantica,
  focusId: string,
): string {
  return renderToStaticMarkup(
    createElement(Reader, {
      work,
      focusId,
      onFocus: () => {},
      onHome: () => {},
    }),
  );
}

function articleCount(html: string): number {
  return html.match(/<article/g)?.length ?? 0;
}

describe("study reader mount", () => {
  const canticaUnits = cantica.study?.units ?? [];
  const sermon1 = canticaUnits.filter((unit) => unit.caput === 1);
  const sermon2 = canticaUnits.filter((unit) => unit.caput === 2);

  test("cantica opens on sermon 1 with the plate closed and the full table of contents", () => {
    const html = markup(cantica, canticaUnits[0].id);
    expect(articleCount(html)).toBe(sermon1.length * 2);
    expect(html).toContain('data-unit="cantica:1:');
    expect(html).not.toContain('data-unit="cantica:2:');
    expect(html).toContain(">Sermo 86<");
    // the sermon heading now pairs with its English title in the Study pane
    expect(html).toContain("Concerning the very title of the book");
    expect(html).toContain('class="reader no-facsimile"');
    expect(html).toMatch(/aria-pressed="false">\s*Facsimile/);
    expect(html).not.toContain("facsimile-viewport");
  });

  test("choosing another sermon mounts only that sermon", () => {
    const html = markup(cantica, sermon2[0].id);
    expect(articleCount(html)).toBe(sermon2.length * 2);
    expect(html).toContain('data-unit="cantica:2:');
    expect(html).not.toContain('data-unit="cantica:1:');
  });

  test("psalter mounts one psalm with its Clementine page open", () => {
    const units = psalter.study?.units ?? [];
    const psalm16 = units.filter((unit) => unit.caput === 16);
    const verse13 = psalm16.find((unit) => unit.section === 13);
    expect(verse13?.facsimile).toBe("psalter/p-344.png");
    const html = markup(psalter, verse13?.id ?? psalm16[0].id);
    expect(articleCount(html)).toBe(psalm16.length * 2);
    expect(html).toContain('data-unit="psalter:16:');
    expect(html).not.toContain('data-unit="psalter:17:');
    expect(html).toContain("/facsimiles/psalter/p-344.png");
    expect(html).toContain(">p. 344<");
    expect(html).toContain("facsimile-viewport");
  });

  test("de gradibus still mounts the whole treatise with the plate open", () => {
    const units = gradibus.study?.units ?? [];
    const html = markup(gradibus, units[0].id);
    expect(articleCount(html)).toBe(units.length * 2);
    expect(html).toContain("facsimile-viewport");
    expect(html).toMatch(/aria-pressed="true">\s*Facsimile/);
  });
});
