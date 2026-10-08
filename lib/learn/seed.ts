import type { Status, StudyMap, Topic } from "./types";

type SeedTopic = {
  title: string;
  status?: Status;
  notes?: string;
  links?: Topic["links"];
  children?: SeedTopic[];
};

// Placeholder content. Replace with the real study outline.
const SEED: SeedTopic = {
  title: "Distributed systems",
  children: [
    {
      title: "Foundations",
      children: [
        {
          title: "Network models",
          status: "done",
          notes: "Synchronous, partially synchronous and asynchronous models.",
        },
        { title: "Failure modes", status: "done" },
        { title: "Time and clocks", status: "done" },
        { title: "Ordering of events", status: "doing" },
      ],
    },
    {
      title: "Replication",
      children: [
        { title: "Single leader", status: "done" },
        { title: "Multi leader", status: "doing" },
        { title: "Leaderless", status: "todo" },
        {
          title: "Conflict resolution",
          children: [
            { title: "Last write wins", status: "todo" },
            { title: "Version vectors", status: "todo" },
            { title: "CRDTs", status: "todo" },
          ],
        },
      ],
    },
    {
      title: "Partitioning",
      children: [
        { title: "Key range", status: "done" },
        { title: "Hash partitioning", status: "done" },
        { title: "Rebalancing", status: "todo" },
        { title: "Request routing", status: "todo" },
      ],
    },
    {
      title: "Consensus",
      children: [
        { title: "FLP impossibility", status: "todo" },
        { title: "Paxos", status: "todo" },
        {
          title: "Raft",
          children: [
            {
              title: "Leader election",
              status: "doing",
              links: [{ label: "Raft paper", url: "https://raft.github.io/raft.pdf" }],
            },
            { title: "Log replication", status: "todo" },
            { title: "Membership changes", status: "todo" },
          ],
        },
      ],
    },
    {
      title: "Transactions",
      children: [
        { title: "Isolation levels", status: "doing" },
        { title: "Two-phase commit", status: "todo" },
        { title: "Sagas", status: "todo" },
      ],
    },
    {
      title: "Consistency",
      children: [
        { title: "Linearizability", status: "todo" },
        { title: "Eventual consistency", status: "done" },
        { title: "CAP and PACELC", status: "done" },
      ],
    },
  ],
};

function flatten(seed: SeedTopic, parentId: string | null, id: string): Topic[] {
  const topic: Topic = {
    id,
    parentId,
    title: seed.title,
    status: seed.status ?? "todo",
    notes: seed.notes ?? "",
    links: seed.links ?? [],
  };
  const children = (seed.children ?? []).flatMap((child, i) =>
    flatten(child, id, `${id}.${i}`),
  );
  return [topic, ...children];
}

export function createSeedMap(): StudyMap {
  return { id: "default", topics: flatten(SEED, null, "root") };
}
