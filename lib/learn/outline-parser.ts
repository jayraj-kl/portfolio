import type { Topic } from "./types";

const BULLET = /^([-*+•]|\d+[.)])\s+/;

function indentWidth(line: string) {
  let width = 0;
  for (const char of line) {
    if (char === " ") width += 1;
    else if (char === "\t") width += 2;
    else break;
  }
  return width;
}

// Turns indented lines into topics nested under parentId. Deeper indent means subtopic.
export function parseOutline(
  text: string,
  parentId: string,
  createId: () => string = () => crypto.randomUUID(),
): Topic[] {
  const topics: Topic[] = [];
  const stack: { indent: number; id: string }[] = [];

  for (const line of text.split(/\r?\n/)) {
    const title = line.trim().replace(BULLET, "").trim();
    if (!title) continue;

    const indent = indentWidth(line);
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const id = createId();
    topics.push({
      id,
      parentId: stack.length > 0 ? stack[stack.length - 1].id : parentId,
      title,
      status: "todo",
      notes: "",
      links: [],
    });
    stack.push({ indent, id });
  }

  return topics;
}
