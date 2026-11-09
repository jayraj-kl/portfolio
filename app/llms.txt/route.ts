import { buildLlmsTxt } from "@/lib/llms";

// Built once at build time from lib/content. /llm.txt rewrites here (next.config.ts).
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
