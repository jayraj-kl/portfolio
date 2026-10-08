"use client";

import {
  Controls,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import { useTheme } from "next-themes";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { StatusGlyph } from "@/components/learn/status-glyph";
import { radialLayout, radialLinkPath } from "@/lib/learn/layout";
import { indexChildren } from "@/lib/learn/tree";
import type { Progress, Status, StudyMap } from "@/lib/learn/types";
import { cn } from "@/lib/utils";

type TopicNodeData = {
  title: string;
  depth: number;
  progress: Progress;
  childCount: number;
  collapsed: boolean;
  enterDelay: number;
};
type TopicFlowNode = Node<TopicNodeData, "topic">;
type RingsFlowNode = Node<{ ringStep: number; rings: number }, "rings">;
type RadialFlowEdge = Edge<
  { path: string; status: Status; trail: boolean; enterDelay: number },
  "radial"
>;

type CanvasActions = {
  onToggle: (id: string) => void;
  onAdd: (parentId: string) => void;
};
const CanvasActionsContext = createContext<CanvasActions | null>(null);

const SPOTLIGHT_SIZE = 520;
const PHONE_ZOOM = 0.65;

// Nodes are positioned by their centre, so the content shifts back by half its own size.
const ANCHOR = "absolute -translate-x-1/2 -translate-y-1/2";
// React Flow hides nodes it cannot measure, so each one keeps a 1px box at its centre.
const NODE_BOX = "relative size-px";

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

function enterStyle(delay: number) {
  return { "--enter-delay": `${delay}ms` } as CSSProperties;
}

// Feeds the pointer position to the pill's gradient, as a share of its own size.
function trackPointer(event: PointerEvent<HTMLDivElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty(
    "--mx",
    `${((event.clientX - rect.left) / rect.width) * 100}%`,
  );
  el.style.setProperty(
    "--my",
    `${((event.clientY - rect.top) / rect.height) * 100}%`,
  );
}

function TopicNode({ id, data, selected }: NodeProps<TopicFlowNode>) {
  const actions = useContext(CanvasActionsContext);
  const gradientId = useId();
  const { title, depth, progress, childCount, collapsed, enterDelay } = data;

  if (depth === 0) {
    const circumference = 2 * Math.PI * 74;
    const fraction = progress.total > 0 ? progress.done / progress.total : 0;
    return (
      <div className={NODE_BOX}>
        <div className={ANCHOR}>
          <div
            className="sm-enter sm-press group relative size-40"
            style={enterStyle(enterDelay)}
          >
            <div
              aria-hidden="true"
              className="sm-halo pointer-events-none absolute -inset-16 rounded-full group-hover:opacity-100!"
              style={{ opacity: 0.35 + fraction * 0.5 }}
            />
            <div
              className={cn(
                "relative flex size-full flex-col items-center justify-center rounded-full bg-background p-5 text-center",
                selected && "outline-2 outline-offset-4 outline-foreground/60",
              )}
            >
              <svg
                viewBox="0 0 160 160"
                aria-hidden="true"
                className="absolute inset-0 -rotate-90"
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                    <stop
                      offset="0"
                      style={{ stopColor: "var(--status-done)" }}
                    />
                    <stop
                      offset="1"
                      style={{
                        stopColor:
                          "color-mix(in oklab, var(--status-done) 55%, var(--foreground))",
                      }}
                    />
                  </linearGradient>
                </defs>
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  fill="none"
                  strokeWidth="3"
                  className="stroke-foreground/15"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke={`url(#${gradientId})`}
                  strokeDasharray={`${fraction * circumference} ${circumference}`}
                  className="sm-progress"
                />
              </svg>
              <span className="text-base leading-tight font-semibold text-balance">
                {title}
              </span>
              <span className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                {progress.done} of {progress.total} studied
              </span>
              {selected && <AddButton onClick={() => actions?.onAdd(id)} />}
            </div>
          </div>
        </div>
        <CenterHandles />
      </div>
    );
  }

  return (
    <div className={NODE_BOX}>
      <div className={ANCHOR}>
        <div
          data-status={progress.status}
          data-selected={selected}
          onPointerMove={trackPointer}
          style={enterStyle(enterDelay)}
          className={cn(
            "sm-pill sm-enter sm-press relative flex w-max max-w-48 items-center gap-2 rounded-full border bg-background py-1.5 pr-1.5 pl-2.5",
            depth === 1
              ? "border-foreground/35 text-[15px] font-medium"
              : "border-foreground/15 text-[13px]",
            progress.status === "done" && "border-(--status-done)/60",
          )}
        >
          <StatusGlyph status={progress.status} />
          <span className="min-w-0 pr-1 leading-tight text-pretty">
            {title}
          </span>
          {childCount > 0 && (
            <>
              <span className="text-xs font-normal text-muted-foreground tabular-nums">
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
                  event.stopPropagation();
                  actions?.onToggle(id);
                }}
                className="sm-press nodrag nopan flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-normal text-muted-foreground tabular-nums hover:bg-foreground/15 hover:text-foreground"
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
      className="sm-press sm-appear nodrag nopan absolute -right-2 -bottom-3 flex size-6 items-center justify-center rounded-full bg-foreground text-background shadow-sm hover:scale-110"
    >
      <IconPlus className="size-3.5" stroke={2.5} />
    </button>
  );
}

// Faint depth rings behind the topics, echoing the dashed grid of the home page.
function RingsNode({ data }: NodeProps<RingsFlowNode>) {
  const size = data.rings * data.ringStep * 2 + 4;
  return (
    <div className={NODE_BOX}>
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

function RadialEdge({ data }: EdgeProps<RadialFlowEdge>) {
  if (!data) return null;
  return (
    <path
      d={data.path}
      fill="none"
      strokeLinecap="round"
      strokeWidth={data.status === "todo" ? 1 : 1.5}
      strokeDasharray={data.status === "todo" ? "3 5" : undefined}
      data-status={data.status}
      data-trail={data.trail}
      style={enterStyle(data.enterDelay)}
      className={cn(
        "sm-edge sm-edge-enter",
        data.status === "done" && "stroke-(--status-done)",
        data.status === "doing" && "stroke-(--status-doing)",
        data.status === "todo" && "stroke-foreground/30",
      )}
    />
  );
}

const nodeTypes = { topic: TopicNode, rings: RingsNode };
const edgeTypes = { radial: RadialEdge };

type MapCanvasProps = CanvasActions & {
  map: StudyMap;
  progress: Map<string, Progress>;
  collapsed: ReadonlySet<string>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

function Flow({
  map,
  progress,
  collapsed,
  selectedId,
  onSelect,
  onToggle,
  onAdd,
}: MapCanvasProps) {
  const { resolvedTheme } = useTheme();
  const { fitBounds, setCenter } = useReactFlow();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // The first paint cascades out from the centre; later additions only stagger among siblings.
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), 900);
    return () => clearTimeout(timer);
  }, []);

  const layout = useMemo(() => radialLayout(map, collapsed), [map, collapsed]);

  const enterDelays = useMemo(() => {
    const delays = new Map<string, number>();
    const siblingCount = new Map<string | null, number>();
    for (const placed of layout.placed) {
      const index = siblingCount.get(placed.parentId) ?? 0;
      siblingCount.set(placed.parentId, index + 1);
      delays.set(
        placed.id,
        settled ? index * 35 : placed.depth * 90 + index * 25,
      );
    }
    return delays;
  }, [layout, settled]);

  const nodes = useMemo(() => {
    const children = indexChildren(map);
    const topics = new Map(map.topics.map((topic) => [topic.id, topic]));
    const fallback: Progress = { done: 0, total: 1, status: "todo" };

    const rings: RingsFlowNode = {
      id: "__rings",
      type: "rings",
      position: { x: 0, y: 0 },
      data: { ringStep: layout.ringStep, rings: layout.rings },
      selectable: false,
      focusable: false,
      draggable: false,
      zIndex: -1,
      style: { pointerEvents: "none" },
    };

    const topicNodes: TopicFlowNode[] = layout.placed.map((placed) => ({
      id: placed.id,
      type: "topic",
      position: { x: placed.x, y: placed.y },
      selected: placed.id === selectedId,
      data: {
        title: topics.get(placed.id)?.title ?? "",
        depth: placed.depth,
        progress: progress.get(placed.id) ?? fallback,
        childCount: children.get(placed.id)?.length ?? 0,
        collapsed: collapsed.has(placed.id),
        enterDelay: enterDelays.get(placed.id) ?? 0,
      },
    }));

    return [rings, ...topicNodes];
  }, [map, layout, progress, collapsed, selectedId, enterDelays]);

  const edges = useMemo(() => {
    const placedById = new Map(layout.placed.map((p) => [p.id, p]));

    // The hovered topic lights its route back to the centre.
    const trail = new Set<string>();
    for (
      let current = hoveredId ? placedById.get(hoveredId) : undefined;
      current;
      current = current.parentId ? placedById.get(current.parentId) : undefined
    ) {
      trail.add(current.id);
    }

    return layout.placed.flatMap((placed): RadialFlowEdge[] => {
      const parent = placed.parentId && placedById.get(placed.parentId);
      if (!parent) return [];
      return [
        {
          id: `${parent.id}->${placed.id}`,
          type: "radial",
          source: parent.id,
          target: placed.id,
          focusable: false,
          selectable: false,
          data: {
            path: radialLinkPath(parent, placed),
            status: progress.get(placed.id)?.status ?? "todo",
            trail: trail.has(placed.id),
            enterDelay: enterDelays.get(placed.id) ?? 0,
          },
        },
      ];
    });
  }, [layout, progress, hoveredId, enterDelays]);

  // Frame the topics. On a phone, stay readable and let the map overflow instead.
  const frame = useCallback(
    (duration: number) => {
      if (window.matchMedia("(max-width: 767px)").matches) {
        void setCenter(0, 0, { zoom: PHONE_ZOOM, duration });
      } else {
        void fitBounds(layout.bounds, { padding: 0.08, duration });
      }
    },
    [fitBounds, setCenter, layout],
  );

  // Reframe whenever branches open, close, or gain topics.
  const visibleCount = layout.placed.length;
  useEffect(() => {
    const request = requestAnimationFrame(() => frame(350));
    return () => cancelAnimationFrame(request);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refit on topic count only
  }, [visibleCount]);

  const actions = useMemo(() => ({ onToggle, onAdd }), [onToggle, onAdd]);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spotlightX = useSpring(pointerX, { stiffness: 120, damping: 20 });
  const spotlightY = useSpring(pointerY, { stiffness: 120, damping: 20 });
  const spotlightTransform = useMotionTemplate`translate(${spotlightX}px, ${spotlightY}px)`;
  const [spotlightOn, setSpotlightOn] = useState(false);

  return (
    <CanvasActionsContext.Provider value={actions}>
      <div
        className="relative size-full overflow-hidden"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          pointerX.set(event.clientX - rect.left - SPOTLIGHT_SIZE / 2);
          pointerY.set(event.clientY - rect.top - SPOTLIGHT_SIZE / 2);
          if (!spotlightOn) setSpotlightOn(true);
        }}
        onPointerLeave={() => setSpotlightOn(false)}
      >
        <motion.div
          aria-hidden="true"
          className="sm-spotlight pointer-events-none absolute top-0 left-0 rounded-full transition-opacity duration-500"
          style={{
            width: SPOTLIGHT_SIZE,
            height: SPOTLIGHT_SIZE,
            transform: spotlightTransform,
            opacity: spotlightOn ? 1 : 0,
          }}
        />
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
            if (node.type === "topic") onSelect(node.id);
          }}
          onNodeMouseEnter={(_, node) => {
            if (node.type === "topic") setHoveredId(node.id);
          }}
          onNodeMouseLeave={() => setHoveredId(null)}
          onPaneClick={() => onSelect(null)}
          minZoom={0.15}
          maxZoom={1.75}
          style={{ background: "transparent" }}
        >
          <Controls position="bottom-left" showInteractive={false} />
        </ReactFlow>
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
