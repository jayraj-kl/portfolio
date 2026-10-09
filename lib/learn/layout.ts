import { hierarchy, tree } from "d3-hierarchy";
import { getRoot, indexChildren } from "./tree";
import type { StudyMap, Topic } from "./types";

export type PlacedTopic = {
  id: string;
  parentId: string | null;
  depth: number;
  angle: number;
  radius: number;
  x: number;
  y: number;
  box: Box;
};

type Box = { width: number; height: number };

export type RadialLayout = {
  placed: PlacedTopic[];
  ringStep: number;
  rings: number;
  bounds: { x: number; y: number; width: number; height: number };
};

type Nested = { topic: Topic; children: Nested[] };

const MIN_RING_STEP = 210;
// Arc length each outer topic needs so neighbouring labels do not collide.
const ARC_PER_LEAF = 120;
const LABEL_GAP = 8;
const PUSH_STEP = 12;

export function polar(angle: number, radius: number) {
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}

// Matches the max width of a topic box in the canvas (max-w-72).
const MAX_BOX_WIDTH = 288;

// Rough rendered size of a topic label; exact measurement is not needed to avoid collisions.
function estimateBox(title: string, depth: number, hasChildren: boolean): Box {
  if (depth === 0) return { width: 160, height: 160 };
  // Monospaced, so width follows the character count closely.
  const charWidth = depth === 1 ? 8.5 : 7.6;
  const lineHeight = depth === 1 ? 17.5 : 15.7;
  // Padding, border and status marker, plus the count and toggle on a topic with subtopics.
  const chrome = 40 + (hasChildren ? 64 : 0);
  const room = MAX_BOX_WIDTH - chrome;
  const textWidth = title.length * charWidth;
  // Wrapping breaks at words, so lines fill a little less than the full width.
  const lines = Math.max(1, Math.ceil((textWidth * 1.12) / room));
  return {
    width: (lines > 1 ? room : textWidth) + chrome,
    height: lines * lineHeight + 14,
  };
}

function overlaps(a: PlacedTopic, b: PlacedTopic) {
  return (
    Math.abs(a.x - b.x) < (a.box.width + b.box.width) / 2 + LABEL_GAP &&
    Math.abs(a.y - b.y) < (a.box.height + b.box.height) / 2 + LABEL_GAP
  );
}

// Where two labels collide, slide the outer one further along its own spoke.
function separate(placed: PlacedTopic[]) {
  for (let pass = 0; pass < 60; pass++) {
    let moved = false;
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i];
        const b = placed[j];
        if (!overlaps(a, b)) continue;
        const mover = b.radius >= a.radius ? b : a;
        mover.radius += PUSH_STEP;
        Object.assign(mover, polar(mover.angle, mover.radius));
        moved = true;
      }
    }
    if (!moved) return;
  }
}

export function radialLayout(
  map: StudyMap,
  collapsed: ReadonlySet<string>,
): RadialLayout {
  const children = indexChildren(map);
  const nest = (topic: Topic): Nested => ({
    topic,
    children: collapsed.has(topic.id)
      ? []
      : (children.get(topic.id) ?? []).map(nest),
  });

  const root = hierarchy(nest(getRoot(map)));
  const rings = Math.max(1, root.height);
  const ringStep = Math.max(
    MIN_RING_STEP,
    (root.leaves().length * ARC_PER_LEAF) / (2 * Math.PI * rings),
  );

  const laidOut = tree<Nested>()
    .size([2 * Math.PI, 1])
    .separation(
      (a, b) => (a.parent === b.parent ? 1 : 2) / Math.max(1, a.depth),
    )(root);

  const placed = laidOut.descendants().map((node) => {
    // Rotate so the first branch starts at twelve o'clock.
    const angle = node.x - Math.PI / 2;
    const radius = node.depth * ringStep;
    return {
      id: node.data.topic.id,
      parentId: node.data.topic.parentId,
      depth: node.depth,
      angle,
      radius,
      ...polar(angle, radius),
      box: estimateBox(
        node.data.topic.title,
        node.depth,
        children.has(node.data.topic.id),
      ),
    };
  });

  separate(placed);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const { x, y, box } of placed) {
    minX = Math.min(minX, x - box.width / 2);
    maxX = Math.max(maxX, x + box.width / 2);
    minY = Math.min(minY, y - box.height / 2);
    maxY = Math.max(maxY, y + box.height / 2);
  }
  const bounds = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };

  return { placed, ringStep, rings, bounds };
}

export type MapCluster = {
  mapId: string;
  rootId: string;
  offset: { x: number; y: number };
  layout: RadialLayout;
  // In canvas coordinates, unlike the layout which is centred on its own root.
  bounds: RadialLayout["bounds"];
};

export type LibraryLayout = {
  clusters: MapCluster[];
  bounds: RadialLayout["bounds"];
};

const CLUSTER_GAP = 320;

// Lays every map out around its own centre, then packs the centres like a honeycomb.
export function libraryLayout(
  maps: StudyMap[],
  collapsed: ReadonlySet<string>,
): LibraryLayout {
  const layouts = maps.map((map) => radialLayout(map, collapsed));
  const reach = Math.max(
    ...layouts.map(({ bounds }) =>
      Math.max(
        -bounds.x,
        -bounds.y,
        bounds.x + bounds.width,
        bounds.y + bounds.height,
      ),
    ),
  );
  const cell = reach * 2 + CLUSTER_GAP;
  const columns = Math.ceil(Math.sqrt(maps.length));

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const clusters = maps.map((map, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const offset = {
      x: (column + (row % 2 === 1 ? 0.5 : 0)) * cell,
      y: row * cell * 0.87,
    };
    const layout = layouts[index];
    const bounds = {
      ...layout.bounds,
      x: layout.bounds.x + offset.x,
      y: layout.bounds.y + offset.y,
    };
    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.width);
    maxY = Math.max(maxY, bounds.y + bounds.height);
    return { mapId: map.id, rootId: getRoot(map).id, offset, layout, bounds };
  });

  return {
    clusters,
    bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
  };
}

// Curve that leaves the parent along its spoke and arrives along the child's spoke.
export function radialLinkPath(source: PlacedTopic, target: PlacedTopic) {
  const mid = (source.radius + target.radius) / 2;
  const c1 = polar(source.radius === 0 ? target.angle : source.angle, mid);
  const c2 = polar(target.angle, mid);
  return `M${source.x},${source.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${target.x},${target.y}`;
}
