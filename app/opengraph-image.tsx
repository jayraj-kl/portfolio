import { ImageResponse } from "next/og";
import { SHARED } from "@/lib/content";

// The link preview for every page: the name on the home page's paper, with its red registration mark.
export const alt = `${SHARED.name}, ${SHARED.location}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#fff",
          color: "#111",
          borderLeft: "16px solid #e5322d",
        }}
      >
        <div style={{ fontSize: 28, color: "#5c5c5c", letterSpacing: 1 }}>
          jayrajladkat.com
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 112, fontWeight: 600, letterSpacing: -4, lineHeight: 1 }}>
            {SHARED.name}
          </div>
          <div style={{ fontSize: 36, color: "#8a8a8a" }}>{SHARED.location}</div>
        </div>
      </div>
    ),
    size,
  );
}
