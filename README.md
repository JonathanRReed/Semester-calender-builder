# Semester Calendar Builder

Build a weekly schedule of classes, study blocks, exams, and deadlines. Review conflicts, import course information, then export calendar events, a schedule image, or a backup.

Schedule data is stored in the current browser. Export a JSON backup before clearing browser data or replacing a semester.

## Build a semester

Start with `Load Example Semester` or add your own events. Set the term's start and end through `Set Semester Dates` before exporting recurring classes.

For one event, choose `Add Event`, select its type, enter the time and location, and save. For several courses, open `Manage Data`, then `Add Semester Info`.

Smart Paste accepts text from a registrar, Banner, Workday, or a syllabus. Review and correct the detected courses before importing; nothing is added silently. Bulk Format accepts one course per line:

```text
CS 101 | Intro to Programming | MWF | 09:30-10:45 | Hall 201 | Dr. Smith
MATH 151 | Calculus I | Mon,Wed,Fri | 11:00-11:50 | SCI 120
Study | Library focus | Tue,Thu | 18:00-20:00
```

Day shorthands include `MWF`, `TR`, `TTh`, and `Mon,Wed`. Unparsed lines are reported. Multi-day classes link into one recurring course. Quick Add provides a structured single-course form.

## Export and restore

`Add to Calendar (.ics)` shows a review of recurring classes, semester bounds, breaks, exams, deadlines, and asynchronous-course notes. Times use floating local time. Check the destination calendar's dates and times after import, especially when moving between time zones.

CSV preserves recurrence information for re-import. JSON stores a complete backup that can be restored through `Manage Data`. PNG exports an image; Text copies a formatted summary.

## Develop

Requires Bun 1.4+ and Node 20.9+ for the post-build script.

```bash
git clone https://github.com/JonathanRReed/Semester-calender-builder.git
cd Semester-calender-builder
bun install
bun run dev
```

Open `http://localhost:3000`.

```bash
bun run check
bun run build
bun run start
```

`check` runs oxlint, ESLint, TypeScript, and unit tests. Individual checks are `lint:oxc`, `lint`, `typecheck`, and `test` through `bun run`. `start` serves the static export after a build.

## Stack and deployment

Next.js 16 uses the App Router, static export, and React Compiler. The UI uses React 19, TypeScript, Tailwind CSS 4, Radix, Sonner, and a Rosé Pine night theme. Zod validates imports. Tests run with Bun.

Cloudflare Pages serves the static files. Security headers live in `public/_headers`.

Open an issue to discuss changes before a large contribution.

## License

[MIT](LICENSE).
