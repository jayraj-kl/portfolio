# Home page image slots

Every slot renders through the page's own line-screen halftone (`halftone.ts`): the file is loaded, its luminance and alpha read, and it is drawn as 45° lines. In light, line width follows darkness (black lines on white). In dark, a real image's line width follows luminance (white lines on near-black), so it stays a positive, never a negative; generated stand-ins keep their inverted white-lit look. Transparent pixels are paper in both themes. Until a file exists, the server sees it missing and the slot draws a generated luminance field instead, so nothing 404s and nothing shifts when the file lands. Boxes are fixed by CSS `aspect-ratio`.

Logos are the exception: they are shown as files in their own colours, never halftoned. Missing or failing logos show a square monogram tile.

## Portrait

| Slot | Path | Box | Ideal source | Treatment |
|---|---|---|---|---|
| Hero portrait | `public/home/portrait.png` (preferred), else `public/home/portrait.jpg` | 16:9 desktop, 16:10 at ≤640px; the bust rises from the frame's bottom edge and is cropped by it | Best as a background-removed PNG (transparent pixels read as paper in both themes, so the bust stands alone on white or on the dark ground); a JPEG works, but its backdrop is drawn too. Head and shoulders, 4:5, subject centred, top of head ~8% from the top of the photo, head ~40% of the photo's height; plain light background; soft key light from the left | Hero line screen (WebGL, CPU fallback). Angle and pitch follow the pointer (15–75°, 4–10px); a tap nudges it; reduced motion holds 45° / 6px |
| Footer wordmark | same file | 9:2, full page width | same | Static 45° screen, paper pulled to mid grey, clipped to the letters of JAYRAJ (Funnel Display 700) with a hairline outline |

Placeholder: a lit head-and-shoulders mass (radial shading, side-parted hair, scattered specks at the edge).

## Project media (`project.media` in `lib/content/shared.ts`)

| Project | Poster (16:10) | Demo clip (16:10) | Placeholder field |
|---|---|---|---|
| Dexterio | `public/work/dexterio/poster.jpg` | `public/work/dexterio/demo.mp4` | a banded sphere |
| One Stop Deployment | `public/work/one-stop-deployment/poster.jpg` | `public/work/one-stop-deployment/demo.mp4` | three stacked crates |
| Demex | `public/work/demex/poster.jpg` | `public/work/demex/demo.mp4` | a graph of linked nodes |
| StudEx (research set) | `public/work/studex/poster.jpg` | `public/work/studex/demo.mp4` | a fanned stack of slabs |
| Website Builder (research set) | `public/work/website-builder/poster.jpg` | `public/work/website-builder/demo.mp4` | a field of blocks of different heights |

- Poster: 1600×1000 or larger, a clean frame of the product doing its job (the rendered animation, the deploy log with its preview URL, the results page), high contrast, little small text. Shown cover-fit through a fine 3.2px line screen (device-pixel scaled) so UI stays suggestive; the hero and wordmark keep 6px.
- Clip: H.264 MP4, 16:10, muted, 10–30 seconds, under ~4 MB, first frame close to the poster. Shown unprocessed in the same box: hover plays on fine pointers, click/tap or the Play button toggles, ending or leaving returns to the halftone poster. With no file, no play control is shown.
- Gallery (`media.gallery`, optional): 16:10 images, rendered as a halftone strip under the well (2.8px screen).

## Paper figures (`publication.figure`)

| Paper | Path | Box | Ideal source | Placeholder field |
|---|---|---|---|---|
| Co-Adaptation over Allocation (IEEE HiPC 2026) | `public/papers/hipc2026.jpg` | 2:1 | The paper's key figure (bit-width allocation or accuracy plot), exported at 1600×800, white background | a row of bars of stepped heights |
| Real-World Scalability of PostgreSQL (IEEE ICBDS 2025) | `public/papers/icbds2025.jpg` | 2:1 | The architecture or benchmark figure, 1600×800, white background | three stacked disks |

## Logos (`SHARED.logos`, matched by `logoFor(name)`, longest prefix wins)

Shown in their true colours with no frame, each centred in the same 100 × 44px slot (72 × 32px on phones), so the names beside them line up; in a previous role's modal the logo grows to fill a white banner. Best source: a flat SVG or a transparent PNG with little padding.

| Name match | File | Source | Used in |
|---|---|---|---|
| TIGER-Lab | `public/logos/uwaterloo.png` | Wikimedia Commons, University_of_Waterloo_logo.png (public domain) | Experience lead card |
| Publicis Sapient | `public/logos/publicis-sapient.svg` | Wikimedia Commons, PS_Logo_RGB.svg (public domain) | Experience rows |
| Elixir AI | `public/logos/elixir-ai.jpg` | The company's LinkedIn page logo, white margin trimmed | Experience rows |
| Centre for Development of Advanced Computing | `public/logos/cdac.svg` | Wikimedia Commons (public domain) | Experience rows |
| MIT World Peace University | `public/logos/mit-wpu.jpg` | mitwpu.edu.in site logo (emblem plus name; an emblem-only file would read larger) | Education |
| IEEE HiPC | `public/logos/hipc.png` | hipc.org site icon | HiPC publication card |
| IEEE (ICBDS and any other IEEE venue) | `public/logos/ieee.svg` | Wikimedia Commons, IEEE_logo.svg (public domain) | ICBDS publication card |

## Not image slots, but external

- Tech stack icons: `https://cdn.simpleicons.org/<slug>/<hex>` in the theme's ink (`111111` / `ecece6`); a failed icon shows a monogram tile.
- GitHub contributions: fetched live by `react-github-calendar` for `jayraj-kl`.
