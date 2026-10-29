# zakisserious.github.io

One long riso-printed sheet. Static HTML, CSS and a small amount of vanilla
JavaScript. No build step, no package manager, no dependencies, no web fonts.

Built for phones first: the sheet is the viewport minus 8px on mobile and stays
a single 470px column on wider screens rather than growing a desktop layout.

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
- **Single column at every width.** The paper is `max-width: 470px` on desktop
  and the viewport minus 8px on phones. Nothing is ever laid out in columns.
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
