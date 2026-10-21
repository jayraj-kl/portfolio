"use client"

const SSS_VIDEO =
  "https://assets.21st.dev/ascii-recipes/videos/user_2xJxXqdwWohYrdd6fiMYrS9hbmO/2e358adb-cfc9-4ec4-a600-1abc8836f02b.mp4"
const SSS_POSTER =
  "https://assets.21st.dev/ascii-recipes/thumbnails/user_2xJxXqdwWohYrdd6fiMYrS9hbmO/eae3b158-33e1-442d-8e17-3b4fb6656a7f.webp"

// AsciiArt — "sss", made with the 21st ASCII editor and baked
// to its exact rendered output (looping video + poster). Zero dependencies:
// one <video> that fills its parent. Drop it behind or inside your content:
// <div className="relative h-96"><AsciiArt className="absolute inset-0" /></div>
// Remix the source recipe (styles, animation, palette) in the editor:
// https://21st.dev/community/ascii/editor?from=329a4b07-0eab-4277-9ccc-1accdfbedb94
// `src`, `poster` and `label` take another baked recipe; they default to "sss".
export function AsciiArt({
  className,
  src = SSS_VIDEO,
  poster = SSS_POSTER,
  label = "sss — animated ASCII art",
}: {
  className?: string
  src?: string
  poster?: string
  label?: string
}) {
  return (
    <video
      className={className}
      src={src}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      aria-label={label}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  )
}
