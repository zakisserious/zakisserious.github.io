# zakisserious.github.io

One long riso-printed sheet. Static HTML, CSS and a small amount of vanilla
JavaScript. No build step, no package manager, no dependencies, no web fonts.

Phones get one column: the sheet is the viewport minus 8px. From 900px the sheet
opens into a two-column spread with a sticky masthead rail.

## Files

| File | Job |
| --- | --- |
| `index.html` | Portfolio |
| `resume.html` | Resume |
| `style.css` | Every style, including print — one stylesheet |
| `script.js` | Optional enhancement: pointer cursor + print button |
| `assets/` | Photographs, project screenshots, CV PDF |

## Ground rules

- **Content is the product.** Copy, stats, skills, projects, links and resume
  data live in the HTML. Decorative chrome is the only thing that may go.
- **One column on phones, two on desktop.** Below 900px the sheet is the
  viewport minus 8px, single column. From 900px it opens into a 1160px spread:
  a sticky rail with the masthead and portrait, the document beside it, and the
  contact band across both.
- **Three inks plus one pop.** Vermilion, cobalt and ink on cream paper; the
  acid lime is a background only, never text. Body copy stays ink on paper.
- **Works with JavaScript off.** Projects are native `<details>`, every link is
  a real anchor, and no text is revealed by script.
- **Effects stay off the paper.** Scanlines live on the desk layer behind the
  paper with `pointer-events: none`; photographs get a halftone screen.
- **Motion is optional.** Only `transform`, `opacity` and `filter` are animated,
  and `prefers-reduced-motion: reduce` disables all of it.
- **Cursor is opt-in.** `cursor: none` is applied by script only after the
  cursor element has mounted, and only for fine pointers.

## Budgets

CSS < 30 KB and JS < 30 KB, unminified. Current sizes are roughly 20 KB and
3 KB. Every stylesheet and script link carries a `?v=` cache-busting query.

## Preview

```sh
python3 -m http.server 8123
```

Then open <http://localhost:8123>.
