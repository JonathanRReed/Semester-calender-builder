# Semester Calendar Builder

A portfolio-ready calendar builder for managing semester schedules with support for courses, study blocks, and important dates.

## Features

- **Visual Weekly Calendar** - Time-blocked weekly grid with current-week dates and conflict highlighting
- **Multiple Event Types** - In-person classes, online classes, study blocks, and exams
- **Smart Paste Import** - Paste a registrar/Banner/Workday/syllabus block and review detected courses before importing
- **Calendar Export (.ics)** - One recurring event per class, bounded by your semester dates, with breaks excluded — imports cleanly into Google, Apple, or Outlook Calendar
- **Bulk Import/Export** - CSV (lossless round-trip), ICS, plain text, and full JSON backup/restore
- **Important Dates** - Track deadlines, exams (with optional times), breaks, and finals
- **PNG Export** - Generate shareable schedule images
- **Dark Mode** - Rose Pine night theme
- **Mobile Responsive** - Works on all devices (including conflict warnings)
- **Local Storage** - Your data never leaves your device
- **Onboarding** - Load a sample semester and follow quick tips right in the app

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.0+ (recommended) or Node.js 18+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Semester-calender-builder

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your calendar.

### Build for Production

```bash
# Create optimized production build
bun run build

# Start static export server
bun run start
```

## Usage

### Quick Start

- Open the app and click **Load Example Semester** in the onboarding banner.
- Explore the sample classes, study blocks, and key academic dates.
- Replace events with your real schedule or import a CSV/ICS file via **Manage Data**.
- Your changes are stored locally, so you can experiment without losing anything.

### Adding Events

1. Click "Add Event" button
2. Choose event type (Course, Study Block, Exam)
3. Fill in details (time, location, etc.)
4. Save to calendar

### Adding many classes at once

Open **Manage Data → Add Semester Info**. Three ways:

1. **Smart Paste** – paste a messy schedule copied from your registrar / Banner / Workday / a
   syllabus. Detected courses appear in an editable preview (with a confidence badge) so you can
   fix anything before importing — nothing is added silently.
2. **Bulk Format** – one course per line:
   ```
   CS 101 | Intro to Programming | MWF | 09:30-10:45 | Hall 201 | Dr. Smith
   MATH 151 | Calculus I | Mon,Wed,Fri | 11:00-11:50 | SCI 120
   Study | Library focus | Tue,Thu | 18:00-20:00
   ```
   Day shorthands like `MWF`, `TR`, `TTh`, or `Mon,Wed` all work. Lines that can't be parsed are
   reported back to you instead of failing silently. Multi-day classes are linked as one recurring
   course automatically.
3. **Quick Add** – a structured form for a single course.

### Set your semester dates

Use **Set Semester Dates** in the header. This is what makes the calendar export land on the right
weeks and stop at the end of the term.

### Exporting

- **Add to Calendar (.ics)** – a review step summarizes exactly what's going out (recurring classes
  bounded by your semester, exams/deadlines, class days skipped for breaks, async courses noted),
  then imports into Google Calendar, Outlook, or Apple Calendar. Times are floating local time, so
  they never drift across daylight-saving changes.
- **CSV** – open in Excel/Sheets; re-importable without losing recurrence info.
- **Download Backup (.json)** – a complete, restore-able snapshot (re-import from Manage Data).
- **PNG** – share the schedule as an image.
- **Text** – copy a formatted text summary.

## Contributing

This is a personal project, but suggestions are welcome! Please open an issue to discuss changes.

## License

MIT License - See LICENSE file for details
