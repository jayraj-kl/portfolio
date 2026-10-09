"use client";

import { GitHubCalendar } from "react-github-calendar";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { GITHUB_GRAPH_CONSTANTS } from "@/lib/constants";

export function GithubGraph() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex min-w-max justify-center text-xs px-4">
        <GitHubCalendar
          username={GITHUB_GRAPH_CONSTANTS.username}
          colorScheme={theme === "dark" ? "dark" : "light"}
          blockSize={GITHUB_GRAPH_CONSTANTS.blockSize}
          blockMargin={GITHUB_GRAPH_CONSTANTS.blockMargin}
          fontSize={GITHUB_GRAPH_CONSTANTS.fontSize}
        />
      </div>
    </div>
  );
}
