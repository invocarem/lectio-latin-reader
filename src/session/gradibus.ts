/**
 * The De gradibus course: one pass is the whole treatise, read unit by unit.
 * A step is a lectio unit id. `total` is the number of lectio units; `next`
 * returns the next unit in list order that has not yet been sat with. There is
 * no weekday and no hour.
 */

import { gradibus } from "../content/gradibus";
import type { SessionCourse } from "./course";

const lectio = gradibus.lectio;

export const gradibusCourse: SessionCourse = {
  total: () => lectio.length,
  next: (cursor, satWith) => {
    const sat = new Set(satWith);
    const start = cursor == null ? -1 : lectio.findIndex((unit) => unit.id === cursor);
    // Walk on from the cursor; wrap to the start when the tail is all done.
    for (let i = start + 1; i < lectio.length; i++) {
      if (!sat.has(lectio[i].id)) return lectio[i].id;
    }
    for (let i = 0; i <= start; i++) {
      if (!sat.has(lectio[i].id)) return lectio[i].id;
    }
    return null;
  },
};
