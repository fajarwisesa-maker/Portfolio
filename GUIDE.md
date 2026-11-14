# How to edit your portfolio

Almost everything you will ever change is in **one file: `lib/content.ts`**.
Photos go in **`public/media/`**. You never need to touch the other files for normal updates.

## 0. The 3 commands you need

Open a terminal in the project folder, then:

```bash
npm install          # only the first time on a new computer
npm run dev          # start the site at http://localhost:3000 (changes show instantly)
npm run build        # check that everything works before publishing
```

Stop the server with `Ctrl + C`.

---

## 1. Change text (about, role, links, availability)

Open `lib/content.ts`. Edit the words **inside the quotes**, save, and the browser updates.

| What you want to change | Where in `lib/content.ts` |
|---|---|
| Your name, role, school, city | `profile` → `name`, `role`, `school`, `location` |
| The green "Open to…" pill | `profile.availability` |
| Skills line under the headline | `profile.focus` |
| Email, LinkedIn, GitHub, Instagram | `profile.socials` (`href` is the link, `handle` is the text shown) |
| The "About" paragraphs | `about.lead` and `about.body` |
| The 4 numbers (GPA, certificates…) | `about.facts` (`value` = big number, `label` = small text) |
| The greetings at the start | `greetings` (add or remove languages; the **last** one stays on screen) |

The big headline "I turn messy data into decisions…" is in `app/page.tsx` (search for `I turn messy data`).

## 2. Change your photos

There are 3 places your photo appears. Replace the file, keep the same name, and it updates.

| Where it appears | File in `public/media/` | Tips |
|---|---|---|
| **Dot portrait in the hero** | `portrait-gils.webp` | Needs a **plain light background**, head + shoulders + arms visible. Busy backgrounds turn into dots too. |
| Photo in the Prologue (framed, tilted) | `portrait-formal.webp` | Any portrait works. |
| Spare portraits (not shown now) | `portrait-casual*.webp` | Free to use. |

**To put a new photo in:**

```bash
npm run photo -- "C:\Users\you\Desktop\newphoto.jpg" portrait-gils 1100
```

This converts it to a small WebP and saves it as `public/media/portrait-gils.webp` (replacing the old one).
The last number is the width in pixels (1100 for portraits, 1400 for event photos).

If the dot portrait looks cropped wrong with a new photo, open `components/site/DotField.tsx`, find
`function portraitTarget`, and adjust these three numbers: `img.width * 0.76` (how much of the photo),
`img.width * 0.12` (start from left), `img.height * 0.17` (start from top). Save and look at the hero.

## 3. Add a photo to "Moments" (the draggable polaroids)

1. Convert it: `npm run photo -- "C:\path\photo.jpg" moment-my-event 1200`
   (the command prints the `w` and `h` numbers to use).
2. In `lib/content.ts`, find `export const moments` and add a line **at the top** of the list (newest first):

```ts
{ id: "my-event", caption: "What happened", place: "Where · When", era: "college", image: media("moment-my-event"), w: 1200, h: 800 },
```

`id` must be unique. `era` is `"college"` or `"school"`. To remove a photo, delete its line.

## 4. Add or edit a project

Find `export const projects` in `lib/content.ts`. Each project is one block:

```ts
{
  id: "my-project",              // unique, lowercase, no spaces
  index: "07",                   // number shown on the card
  title: "My Project",
  kind: "Web app · Data",        // small label under the number
  role: "Builder",               // the orange pill
  year: "2026",
  summary: "One sentence about it.",
  problem: "What problem it solves.",
  did: ["What I did 1", "What I did 2", "What I did 3"],
  outcome: "The result, ideally with a number.",
  tags: ["Python", "React"],
  image: media("project-my-project"),
  links: [{ label: "Live demo", href: "https://…" }, { label: "GitHub", href: "https://github.com/…" }],
},
```

- **Order:** projects appear in the order of the list. Move a block up or down to reorder.
- **Hide a project:** delete its block (or comment it with `/* … */`).
- **No link yet:** use `links: []`.
- **Cover image:** use any 1600×1100 picture: `npm run photo -- "C:\path\cover.png" project-my-project 1600`.
  To make poster-style covers like the current ones, edit `scripts/covers.mjs` (one block per project) and run
  `node scripts/covers.mjs --publish`. That script reads screenshots from `design/src/` and your `Lido_Flow` folder.

## 5. Experience, awards and roles

`export const experience` has two places (President University, SMAN 2). Inside each:
- `highlights`: the orange ★ lines (awards).
- `roles`: one line per role: `title`, `org`, `period`, `note`. Add, delete or reorder lines freely.

## 6. Certificates

`export const certificates` in `lib/content.ts`:
- A normal certificate: `{ id, title, issuer, date, credential, verify }`. `verify` is the link of the **Verify ↗** button.
- Add a picture of it (optional): `image: media("cert-name")` after `npm run photo -- "…" cert-name 1400`.
  Without `image`, a neat text tile is shown.
- The **Google AI Professional Certificate** block has a `courses` list for its badges.

## 7. Chapter titles, menu names, footer

In `app/page.tsx`:
- Menu names: the `items` list near the top (`label`).
- Chapter titles: each `<Chapter … title="Where I learned to" accent="lead." …>`.
  `title` is black text, `accent` is the orange last word.
- Footer text: search for `Same data, new shape`.

Browser tab title and description: `app/layout.tsx`.

## 8. Colours and look

All colours are at the top of `app/site.css`:

```css
--bg: #efebe2;      /* paper background */
--ink: #111111;     /* text and dots */
--accent: #ff4b1f;  /* orange */
```

Change a value and the whole site follows. `--accent-ink` is the darker orange used for small text.

## 9. Bubu the cat

In `components/site/Interactive.tsx`:
- Speech bubble text: search `Meoww!`.
- Falls asleep after: `20_000` (milliseconds).
- Fur colour: `--cat-fur` in `app/site.css`.

## 10. Download CV button

Put the PDF in `public/` (for example `public/cv.pdf`), then in `lib/content.ts` set `cv: "/cv.pdf"`.
The buttons appear automatically. **Careful:** your CV has your phone number and address, and the repo is public.
Use a version without them. Empty `cv: ""` hides the buttons.

## 11. Make the guestbook and coffee shared (Supabase)

Right now comments and coffee are saved only in each visitor's browser. To share them with everyone:

1. Create a free project at supabase.com.
2. Open **SQL Editor**, paste everything from `supabase/schema.sql`, press **Run**.
3. In the project settings, copy the **Project URL** and the **anon public key**.
4. Create a file `.env.local` in the project folder:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Restart `npm run dev`. On Vercel, add the same two values under *Settings → Environment Variables*.

**Hide a bad comment:** Supabase → Table editor → `comments` → set `hidden` to `true` on that row.
**Reset the coffee number:** table `coffee` → edit `count`.

## 11b. Contact form: send messages to your inbox

The Contact section has a form (collaboration / job or internship / just saying hi). Until you set up sending,
pressing **Send message** opens the visitor's own email app with everything filled in, so it already works.

To receive messages **directly in your inbox** without the visitor's email app:

1. Make a free account at resend.com and create an **API key**.
2. Add it to `.env.local` (and to Vercel → Settings → Environment Variables):

```bash
RESEND_API_KEY=re_xxxxxxxx
CONTACT_TO=fajarilhamsuryawisesa@gmail.com
```

3. Restart `npm run dev`. Messages arrive in your inbox, and **Reply** goes straight to the visitor.

Notes: the sender shows as `onboarding@resend.dev` until you verify your own domain at Resend (set `CONTACT_FROM`).
On the free test sender, Resend only delivers to the email you signed up with, which is what you want here.
Texts you can change: button words ("Send message", "Let's win together", "Sent! Talk soon") are in
`components/site/ContactForm.tsx`; the three topics are the `TOPICS` list at the top of that file and in
`app/api/contact/route.ts` (keep both lists the same).

## 12. Publish your changes

```bash
npm run build                      # must finish without errors
git add -A
git commit -m "Update portfolio"
git -c http.version=HTTP/1.1 push origin main
```

(`http.version=HTTP/1.1` avoids the "connection reset" error that happened on your network.)

**Put it online (free):** go to vercel.com → *Add New → Project* → import `fajarwisesa-maker/Portfolio` → *Deploy*.
After that, every `git push` updates the live site automatically.

## 13. If something breaks

| Problem | Fix |
|---|---|
| Page shows plain text with no design | Stop the server, delete the `.next-dev` folder, run `npm run dev` again. |
| "Port 3000 is in use" | A server is already running. Close the other terminal, or open the address it prints. |
| Red error after editing `content.ts` | Usually a missing comma, quote or bracket. Look at the line the error names. |
| New photo not showing | The name in `media("…")` must match the file name in `public/media/` (without `.webp`). |
| Want to undo everything since the last push | `git checkout .` (this throws away unsaved changes, be sure). |
| Want to see what you changed | `git status` and `git diff` |

## Where things live (for reference)

| Path | What it is |
|---|---|
| `lib/content.ts` | **All words, links and picture names** |
| `public/media/` | All pictures |
| `app/page.tsx` | Page structure, chapter titles, menu |
| `app/site.css` | Colours and styling |
| `components/site/DotField.tsx` | The dot portrait and chapter shapes |
| `components/site/Interactive.tsx` | Bubu, cursor trail, folders, polaroids |
| `components/shared/` | Greeting intro, menu, guestbook, coffee |
| `supabase/schema.sql` | Database setup for the guestbook |
| `scripts/` | Image helpers (`photo.mjs`, `covers.mjs`, `badges.mjs`) |
