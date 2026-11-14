# Fajar Ilham Surya Wisesa · Portfolio

Personal portfolio of an Informatics student at President University focused on data science and AI.

**Ink & Paper** design: thousands of ink dots start as noise and settle into my portrait as you scroll.
The same dots then re-form into a new shape for every chapter (microphone, bar chart, folder, coffee cup,
envelope), because the story of data science is the same data taking a new shape.

## What's inside

- **Hero**: a stippled dot portrait that forms on scroll, with a cursor trail and Bubu, a grey cat on the header that
  follows your mouse (and falls asleep if you leave it alone).
- **Chapters**: Prologue · Where I learned to lead · Where I found data · Where ideas became real ·
  Where you come in · Epilogue.
- **Frosted folders** that open into project case studies, certificates and draggable photo polaroids.
- **Live guestbook** (name, message, optional photo, emoji reactions you can toggle) and a **coffee counter**
  (one cup per visit) shared by every visitor.
- **Contact form** with a primary "Send message" button (the paper plane flies away on a loop; hover says "Let's win together").
  Sends real email through Resend when `RESEND_API_KEY` is set, otherwise opens the visitor's email app.
- Multi-language greeting intro, smooth scrolling, `prefers-reduced-motion` support, responsive down to 375px.

## Tech

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · GSAP · Lenis · Canvas 2D · Supabase (realtime).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Live guestbook and coffee counter

Without configuration the site uses an offline stand-in (browser storage, synced between tabs).
To share comments and coffee between all visitors:

1. Create a free [Supabase](https://supabase.com) project and run `supabase/schema.sql` in its SQL editor.
2. Add the keys to `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

To receive contact-form messages in your inbox, also set `RESEND_API_KEY` (see `.env.example`).

Hide a comment by setting `hidden = true` on its row in the Supabase dashboard.

## Project structure

| Path | What it is |
|---|---|
| `app/page.tsx`, `app/site.css` | The page and its Ink & Paper styles |
| `lib/content.ts` | Every word and image on the site, in one file |
| `components/site/DotField.tsx` | The dot engine (portrait + chapter shapes) |
| `components/site/Interactive.tsx` | Cursor trail, cat, folders, polaroids |
| `components/shared/` | Greeting intro, header, guestbook, coffee bubble, motion helpers |
| `lib/realtime/` | Supabase adapter and the offline stand-in |
| `scripts/` | Image tools: photo conversion, project covers, dot-portrait previews |
| `design/` | Figma-style design file and preview images for the three explored looks |

## Contact

[LinkedIn](https://www.linkedin.com/in/fajar-wisesa) · [GitHub](https://github.com/fajarwisesa-maker) ·
fajarilhamsuryawisesa@gmail.com

## Deploy (Cloudflare Workers)

Configured with OpenNext. `npm run cf:preview` runs it locally in Cloudflare's runtime, `npm run cf:deploy` publishes it.
Full steps and the environment variables are in `GUIDE.md` ("Deploy to Cloudflare").
