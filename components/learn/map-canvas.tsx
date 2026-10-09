"use client";

import {
  Controls,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useViewport,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { CursorWave } from "@/components/learn/cursor-wave";
import {
  LinkPreview,
  type PreviewAnchor,
} from "@/components/learn/link-preview";
import { StatusGlyph } from "@/components/learn/status-glyph";
import { libraryLayout, radialLinkPath } from "@/lib/learn/layout";
import type { ChildIndex } from "@/lib/learn/tree";
import type { Progress, Status, StudyMap, Topic } from "@/lib/learn/types";
import { cn } from "@/lib/utils";

type Motion = {
  // Bumped each time the node's map is opened, which replays the sweep.
  sweep: number;
  delay: number;
  fromX: number;
  fromY: number;
};

type TopicNodeData = {
  mapId: string;
  title: string;
  depth: number;
  progress: Progress;
  childCount: number;
  collapsed: boolean;
  dimmed: boolean;
  motion: Motion;
};
type TopicFlowNode = Node<TopicNodeData, "topic">;
type RingsFlowNode = Node<
  { ringStep: number; rings: number; dimmed: boolean },
  "rings"
>;
type LabelFlowNode = Node<
  { mapId: string; title: string; progress: Progress; hidden: boolean },
  "label"
>;
type RadialFlowEdge = Edge<
  {
    path: string;
    offset: { x: number; y: number };
    status: Status;
    trail: boolean;
    dimmed: boolean;
    motion: Motion;
  },
  "radial"
>;

type CanvasActions = {
  onToggle: (id: string) => void;
  onAdd: (parentId: string) => void;
  onActivate: (mapId: string | null) => void;
};
const CanvasActionsContext = createContext<CanvasActions | null>(null);

const PHONE_ZOOM = 0.65;
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 1.75;
// A small map is not blown up past this when it is framed.
const FIT_ZOOM = 1.1;
// Height of the header that floats over the canvas on wide screens.
const HEADER_INSET = 118;
// Width of the details card that opens on the right on wide screens.
const PANEL_INSET = 368;
// Zoom used when flying to a single topic from search.
const FOCUS_ZOOM = 1;
// How long the pointer rests on a topic before its link preview shows.
const PREVIEW_DELAY = 220;
const LABEL_HEIGHT = 60;
// Sweep origin: each topic starts part-way in and rotated back around its centre.
const SWEEP_TURN = -0.7;
const SWEEP_SHRINK = 0.4;
const FALLBACK_PROGRESS: Progress = { done: 0, total: 1, status: "todo" };
const NO_MOTION: Motion = { sweep: 0, delay: 0, fromX: 0, fromY: 0 };

// Nodes are positioned by their centre, so the content shifts back by half its own size.
const ANCHOR = "absolute -translate-x-1/2 -translate-y-1/2";
// React Flow hides nodes it cannot measure, so each one keeps a 1px box at its centre.
const NODE_BOX = "relative size-px transition-opacity duration-300";

const CENTER_HANDLE_STYLE = {
  left: 0,
  top: 0,
  transform: "translate(-50%, -50%)",
  opacity: 0,
  pointerEvents: "none",
} as const;

function CenterHandles() {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        style={CENTER_HANDLE_STYLE}
      />
      <Handle
        type="source"
        position={Position.Top}
        isConnectable={false}
        style={CENTER_HANDLE_STYLE}
      />
    </>
  );
}

function motionStyle({ delay, fromX, fromY }: Motion) {
  return {
    "--enter-delay": `${delay}ms`,
    "--from-x": `${fromX}px`,
    "--from-y": `${fromY}px`,
  } as CSSProperties;
}

function motionClass({ sweep }: Motion) {
  return sweep > 0 ? "sm-sweep" : "sm-enter";
}

function TopicNode({ id, data, selected }: NodeProps<TopicFlowNode>) {
  const actions = useContext(CanvasActionsContext);
  const { title, depth, progress, childCount, collapsed, dimmed } = data;

  if (depth === 0) {
    const fraction = progress.total > 0 ? progress.done / progress.total : 0;
    return (
      <div className={cn(NODE_BOX, dimmed && "opacity-35")}>
        <div className={ANCHOR}>
          <div
            key={data.motion.sweep}
            data-status={progress.status}
            data-selected={selected}
            data-cursor-target=""
            style={motionStyle(data.motion)}
            className={cn(
              motionClass(data.motion),
              "sm-box sm-box-root sm-press relative flex size-40 flex-col items-center justify-center bg-background p-4 text-center",
            )}
          >
            {/* Progress runs clockwise around the edge of the box, from the top left. */}
            <svg
              viewBox="0 0 160 160"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full"
            >
              <rect
                x="1.5"
                y="1.5"
                width="157"
                height="157"
                fill="none"
                strokeWidth="3"
                pathLength={100}
                strokeDasharray={`${fraction * 100} 100`}
                className="sm-progress stroke-(--status-done)"
              />
            </svg>
            <span className="relative text-[15px] leading-tight font-bold text-balance">
              {title}
            </span>
            <span className="relative mt-1.5 text-[11px] text-muted-foreground tabular-nums">
              {progress.done}/{progress.total} studied
            </span>
            {selected && <AddButton onClick={() => actions?.onAdd(id)} />}
          </div>
        </div>
        <CenterHandles />
      </div>
    );
  }

  return (
    <div className={cn(NODE_BOX, dimmed && "opacity-35")}>
      <div className={ANCHOR}>
        <div
          key={data.motion.sweep}
          data-status={progress.status}
          data-selected={selected}
          data-cursor-target=""
          style={motionStyle(data.motion)}
          className={cn(
            motionClass(data.motion),
            "sm-box sm-press relative flex w-max max-w-72 items-center gap-1.5 bg-background px-[9px] py-[5px]",
            depth === 1 ? "text-sm font-semibold" : "text-[12.5px]",
          )}
        >
          <StatusGlyph status={progress.status} className="size-3" />
          <span className="relative min-w-0 leading-tight text-pretty">
            {title}
          </span>
          {childCount > 0 && (
            <>
              <span className="relative text-[11px] font-normal text-muted-foreground tabular-nums">
                {progress.done}/{progress.total}
              </span>
              <button
                type="button"
                aria-label={
                  collapsed
                    ? `Show ${childCount} subtopics of ${title}`
                    : `Hide subtopics of ${title}`
                }
                aria-expanded={!collapsed}
                onClick={(event) => {
                  // In a map that is not open, the click falls through and opens the map.
                  if (dimmed) return;
                  event.stopPropagation();
                  actions?.onToggle(id);
                }}
                className="sm-press nodrag nopan relative flex h-5 min-w-5 items-center justify-center border border-foreground/25 bg-muted px-1 text-[11px] font-normal text-muted-foreground tabular-nums hover:bg-foreground/15 hover:text-foreground"
              >
                {collapsed ? (
                  `+${childCount}`
                ) : (
                  <IconMinus className="size-3" />
                )}
              </button>
            </>
          )}
          {selected && <AddButton onClick={() => actions?.onAdd(id)} />}
        </div>
      </div>
      <CenterHandles />
    </div>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Add subtopic"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="sm-press sm-appear nodrag nopan absolute -right-2.5 -bottom-2.5 z-10 flex size-5 items-center justify-center border border-background bg-foreground text-background"
    >
      <IconPlus className="size-3" stroke={3} />
    </button>
  );
}

// Faint depth rings behind the topics, echoing the dashed grid of the home page.
function RingsNode({ data }: NodeProps<RingsFlowNode>) {
  const size = data.rings * data.ringStep * 2 + 4;
  return (
    <div className={cn(NODE_BOX, data.dimmed && "opacity-35")}>
      <svg
        width={size}
        height={size}
        viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
        aria-hidden="true"
        className={cn(ANCHOR, "pointer-events-none max-w-none")}
      >
        {Array.from({ length: data.rings }, (_, i) => (
          <circle
            key={i}
            r={(i + 1) * data.ringStep}
            fill="none"
            strokeWidth="1"
            strokeDasharray="2 7"
            className="stroke-foreground/20"
          />
        ))}
      </svg>
    </div>
  );
}

// Map name above each map. It holds its size on screen, so it reads from far out.
function LabelNode({ data }: NodeProps<LabelFlowNode>) {
  const actions = useContext(CanvasActionsContext);
  const { zoom } = useViewport();
  return (
    <div className="relative size-px">
      <div
        className="absolute bottom-0 left-0 origin-bottom"
        style={{
          transform: `translateX(-50%) scale(${Math.min(1 / zoom, 5)})`,
        }}
      >
        <button
          type="button"
          tabIndex={data.hidden ? -1 : 0}
          onClick={() => actions?.onActivate(data.mapId)}
          className={cn(
            "sm-press nodrag nopan flex flex-col items-center rounded-lg px-3 py-1.5 whitespace-nowrap hover:bg-foreground/10",
            data.hidden && "pointer-events-none opacity-0",
          )}
        >
          <span className="text-[15px] font-semibold">{data.title}</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {data.progress.done} of {data.progress.total} studied
          </span>
        </button>
      </div>
    </div>
  );
}

// React Flow remounts edges when their nodes are re-measured, which would replay the entrance.
// Each edge's entrance is recorded here once it has finished, so it only ever plays once.
const finishedEntrances = new Set<string>();

function RadialEdge({ id, data }: EdgeProps<RadialFlowEdge>) {
  const sweep = data?.motion.sweep ?? 0;
  const delay = data?.motion.delay ?? 0;
  const entrance = `${id}:${sweep}`;

  useEffect(() => {
    const timer = setTimeout(
      () => finishedEntrances.add(entrance),
      delay + 800,
    );
    return () => clearTimeout(timer);
  }, [entrance, delay]);

  if (!data) return null;
  const entering = !finishedEntrances.has(entrance);
  return (
    <path
      key={data.motion.sweep}
      d={data.path}
      fill="none"
      strokeLinecap="round"
      strokeWidth={data.status === "todo" ? 1 : 1.5}
      strokeDasharray={data.status === "todo" ? "3 5" : undefined}
      data-status={data.status}
      data-trail={data.trail}
      style={{
        ...motionStyle(data.motion),
        transform: `translate(${data.offset.x}px, ${data.offset.y}px)`,
        opacity: data.dimmed ? 0.3 : 1,
      }}
      className={cn(
        "sm-edge",
        entering && (sweep > 0 ? "sm-edge-sweep" : "sm-edge-enter"),
        data.status === "done" && "stroke-(--status-done)",
        data.status === "doing" && "stroke-(--status-doing)",
        data.status === "todo" && "stroke-foreground/30",
      )}
    />
  );
}

const nodeTypes = { topic: TopicNode, rings: RingsNode, label: LabelNode };
const edgeTypes = { radial: RadialEdge };

type MapCanvasProps = CanvasActions & {
  maps: StudyMap[];
  topics: Map<string, Topic>;
  childIndex: ChildIndex;
  progress: Map<string, Progress>;
  collapsed: ReadonlySet<string>;
  selectedId: string | null;
  activeMapId: string | null;
  // A topic to fly to. A new token replays the flight, even for the same topic.
  focus: { id: string; token: number } | null;
  onSelect: (id: string | null) => void;
};

function Flow({
  maps,
  topics,
  childIndex,
  progress,
  collapsed,
  selectedId,
  activeMapId,
  focus,
  onSelect,
  onToggle,
  onAdd,
  onActivate,
}: MapCanvasProps) {
  const { resolvedTheme } = useTheme();
  const { setViewport, setCenter } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // The first paint cascades out from each centre; later additions only stagger among siblings.
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), 900);
    return () => clearTimeout(timer);
  }, []);

  // Opening a map bumps its counter, which remounts its topics and replays the sweep.
  const focusToken = focus?.token ?? 0;
  const [sweeps, setSweeps] = useState<{
    active: string | null;
    token: number;
    counts: Record<string, number>;
  }>({ active: null, token: 0, counts: {} });
  if (sweeps.active !== activeMapId || sweeps.token !== focusToken) {
    setSweeps({
      active: activeMapId,
      token: focusToken,
      counts: activeMapId
        ? {
            ...sweeps.counts,
            [activeMapId]: (sweeps.counts[activeMapId] ?? 0) + 1,
          }
        : sweeps.counts,
    });
  }

  const layout = useMemo(
    () => libraryLayout(maps, collapsed, selectedId),
    [maps, collapsed, selectedId],
  );

  const motions = useMemo(() => {
    const result = new Map<string, Motion>();
    const cos = Math.cos(SWEEP_TURN);
    const sin = Math.sin(SWEEP_TURN);

    for (const cluster of layout.clusters) {
      const sweep = sweeps.counts[cluster.mapId] ?? 0;
      const siblingCount = new Map<string | null, number>();
      for (const placed of cluster.layout.placed) {
        const index = siblingCount.get(placed.parentId) ?? 0;
        siblingCount.set(placed.parentId, index + 1);

        // Sweep clockwise from twelve o'clock, inner rings first.
        const fullTurn = 2 * Math.PI;
        const turn =
          (((placed.angle + Math.PI / 2) % fullTurn) + fullTurn) % fullTurn;
        const startX = (placed.x * cos - placed.y * sin) * SWEEP_SHRINK;
        const startY = (placed.x * sin + placed.y * cos) * SWEEP_SHRINK;

        result.set(placed.id, {
          sweep,
          delay:
            sweep > 0
              ? 180 + placed.depth * 110 + (turn / fullTurn) * 320
              : settled
                ? index * 35
                : placed.depth * 90 + index * 25,
          fromX: startX - placed.x,
          fromY: startY - placed.y,
        });
      }
    }
    return result;
  }, [layout, sweeps.counts, settled]);

  const nodes = useMemo(() => {
    const result: (RingsFlowNode | LabelFlowNode | TopicFlowNode)[] = [];

    for (const cluster of layout.clusters) {
      const { mapId, offset } = cluster;
      const dimmed = activeMapId !== null && activeMapId !== mapId;

      result.push({
        id: `${mapId}::rings`,
        type: "rings",
        position: offset,
        data: {
          ringStep: cluster.layout.ringStep,
          rings: cluster.layout.rings,
          dimmed,
        },
        selectable: false,
        focusable: false,
        draggable: false,
        zIndex: -1,
        style: { pointerEvents: "none" },
      });

      result.push({
        id: `${mapId}::label`,
        type: "label",
        position: { x: offset.x, y: cluster.bounds.y - 28 },
        data: {
          mapId,
          title: topics.get(cluster.rootId)?.title ?? "",
          progress: progress.get(cluster.rootId) ?? FALLBACK_PROGRESS,
          hidden: activeMapId === mapId,
        },
        selectable: false,
        focusable: false,
        draggable: false,
        zIndex: 1,
      });

      for (const placed of cluster.layout.placed) {
        result.push({
          id: placed.id,
          type: "topic",
          position: { x: placed.x + offset.x, y: placed.y + offset.y },
          selected: placed.id === selectedId,
          data: {
            mapId,
            title: topics.get(placed.id)?.title ?? "",
            depth: placed.depth,
            progress: progress.get(placed.id) ?? FALLBACK_PROGRESS,
            childCount: childIndex.get(placed.id)?.length ?? 0,
            collapsed: collapsed.has(placed.id),
            dimmed,
            motion: motions.get(placed.id) ?? NO_MOTION,
          },
        });
      }
    }

    return result;
  }, [
    layout,
    topics,
    childIndex,
    progress,
    collapsed,
    selectedId,
    activeMapId,
    motions,
  ]);

  const edges = useMemo(() => {
    const result: RadialFlowEdge[] = [];

    for (const cluster of layout.clusters) {
      const placedById = new Map(cluster.layout.placed.map((p) => [p.id, p]));
      const dimmed = activeMapId !== null && activeMapId !== cluster.mapId;

      // The hovered topic lights its route back to the centre.
      const trail = new Set<string>();
      for (
        let current = hoveredId ? placedById.get(hoveredId) : undefined;
        current;
        current = current.parentId
          ? placedById.get(current.parentId)
          : undefined
      ) {
        trail.add(current.id);
      }

      for (const placed of cluster.layout.placed) {
        const parent = placed.parentId && placedById.get(placed.parentId);
        if (!parent) continue;
        result.push({
          id: `${parent.id}->${placed.id}`,
          type: "radial",
          source: parent.id,
          target: placed.id,
          focusable: false,
          selectable: false,
          data: {
            path: radialLinkPath(parent, placed),
            offset: cluster.offset,
            status: progress.get(placed.id)?.status ?? "todo",
            trail: trail.has(placed.id),
            dimmed,
            motion: motions.get(placed.id) ?? NO_MOTION,
          },
        });
      }
    }

    return result;
  }, [layout, progress, hoveredId, activeMapId, motions]);

  // Fly to the open map, or pull back to show them all.
  const frame = useCallback(
    (duration: number) => {
      const container = containerRef.current;
      if (!container) return;
      const phone = window.matchMedia("(max-width: 767px)").matches;
      const active = layout.clusters.find((c) => c.mapId === activeMapId);

      if (active && phone) {
        // On a phone, stay readable and let the map overflow instead.
        void setCenter(active.offset.x, active.offset.y, {
          zoom: PHONE_ZOOM,
          duration,
        });
        return;
      }

      // Fit inside the area the header leaves free. The overview also keeps room for map names.
      // An opened branch is framed with its route back to the centre, clear of the details card.
      const branch = active?.focusBounds ?? null;
      const inset = {
        top: (phone ? 16 : HEADER_INSET) + (active ? 0 : LABEL_HEIGHT),
        side: phone ? 16 : 48,
        right: phone ? 16 : branch ? PANEL_INSET : 48,
        bottom: phone ? 24 : 40,
      };
      const bounds = branch ?? (active ? active.bounds : layout.bounds);
      const freeWidth = container.clientWidth - inset.side - inset.right;
      const freeHeight = container.clientHeight - inset.top - inset.bottom;
      const zoom = Math.min(
        MAX_ZOOM,
        Math.max(
          MIN_ZOOM,
          Math.min(
            FIT_ZOOM,
            freeWidth / bounds.width,
            freeHeight / bounds.height,
          ),
        ),
      );
      void setViewport(
        {
          zoom,
          x:
            inset.side +
            (freeWidth - bounds.width * zoom) / 2 -
            bounds.x * zoom,
          y:
            inset.top +
            (freeHeight - bounds.height * zoom) / 2 -
            bounds.y * zoom,
        },
        { duration },
      );
    },
    [setViewport, setCenter, layout, activeMapId],
  );

  // Reframe quickly when topics change, and with a longer flight when the open map changes.
  const visibleCount = nodes.length;
  useEffect(() => {
    const request = requestAnimationFrame(() => frame(350));
    return () => cancelAnimationFrame(request);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refit on topic count only
  }, [visibleCount]);

  useEffect(() => {
    const request = requestAnimationFrame(() => frame(850));
    return () => cancelAnimationFrame(request);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fly on map change only
  }, [activeMapId]);

  // Opening or closing a topic swaps the ring for columns, so frame the new arrangement.
  const branchKey = layout.clusters.some((c) => c.focusBounds)
    ? selectedId
    : null;
  const lastBranchKey = useRef(branchKey);
  useEffect(() => {
    if (lastBranchKey.current === branchKey) return;
    lastBranchKey.current = branchKey;
    const request = requestAnimationFrame(() => frame(600));
    return () => cancelAnimationFrame(request);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refit on branch change only
  }, [branchKey]);

  // Declared after the framing effects above so that this flight is the one that wins.
  useEffect(() => {
    if (!focus) return;
    const request = requestAnimationFrame(() => {
      for (const cluster of layout.clusters) {
        const placed = cluster.layout.placed.find((p) => p.id === focus.id);
        if (!placed) continue;
        // Sit the topic in the space the header and the details card leave free.
        const wide = !window.matchMedia("(max-width: 767px)").matches;
        void setCenter(
          placed.x +
            cluster.offset.x +
            (wide ? PANEL_INSET / 2 / FOCUS_ZOOM : 0),
          placed.y +
            cluster.offset.y -
            (wide ? HEADER_INSET / 2 / FOCUS_ZOOM : 0),
          { zoom: FOCUS_ZOOM, duration: 900 },
        );
      }
    });
    return () => cancelAnimationFrame(request);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fly once per search pick
  }, [focusToken]);

  // Link preview for the topic under the pointer, once the pointer has settled on it.
  const [preview, setPreview] = useState<{
    id: string;
    anchor: PreviewAnchor;
  } | null>(null);
  useEffect(() => {
    if (!hoveredId) return;
    const timer = setTimeout(() => {
      const box = document.querySelector(
        `.react-flow__node[data-id="${CSS.escape(hoveredId)}"] .sm-box`,
      );
      // No preview for topics in a map that is dimmed behind the open one.
      if (!box || box.closest(".opacity-35")) return;
      const rect = box.getBoundingClientRect();
      setPreview({
        id: hoveredId,
        anchor: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
      });
    }, PREVIEW_DELAY);
    return () => {
      clearTimeout(timer);
      setPreview(null);
    };
  }, [hoveredId]);
  const previewLinks = preview ? (topics.get(preview.id)?.links ?? []) : [];

  const actions = useMemo(
    () => ({ onToggle, onAdd, onActivate }),
    [onToggle, onAdd, onActivate],
  );

  return (
    <CanvasActionsContext.Provider value={actions}>
      <div ref={containerRef} className="relative size-full overflow-hidden">
        {/* The column view sits on a deep blue wash, so it reads as a different mode. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 bg-blue-900/10 transition-opacity duration-500 dark:bg-blue-950/45",
            branchKey ? "opacity-100" : "opacity-0",
          )}
        />
        <CursorWave />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          colorMode={resolvedTheme === "light" ? "light" : "dark"}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          onInit={() => frame(0)}
          onNodeClick={(_, node) => {
            if (node.type !== "topic") return;
            // A click on another map opens it; a click inside the open map selects the topic.
            if (node.data.mapId !== activeMapId) onActivate(node.data.mapId);
            else onSelect(node.id);
          }}
          onNodeMouseEnter={(_, node) => {
            if (node.type === "topic") setHoveredId(node.id);
          }}
          onNodeMouseLeave={() => setHoveredId(null)}
          onPaneClick={() => onSelect(null)}
          onMoveStart={() => setPreview(null)}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          proOptions={{ hideAttribution: true }}
          style={{ background: "transparent" }}
        >
          <Controls position="bottom-left" showInteractive={false} />
        </ReactFlow>
        {preview && previewLinks.length > 0 && (
          <LinkPreview
            key={preview.id}
            links={previewLinks}
            anchor={preview.anchor}
          />
        )}
      </div>
    </CanvasActionsContext.Provider>
  );
}

export function MapCanvas(props: MapCanvasProps) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
