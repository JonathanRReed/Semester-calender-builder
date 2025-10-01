# Semester Calendar Builder

A calendar builder for managing your semester schedule with support for courses, study blocks, and important dates.

## Features

- **Visual Weekly Calendar** - Drag-and-drop interface with time blocks
- **Multiple Event Types** - In-person classes, online classes, study blocks, and exams
- **Bulk Import/Export** - CSV, ICS (iCalendar), and text formats
- **Important Dates** - Track deadlines, exams, and breaks
- **PNG Export** - Generate shareable schedule images
- **Dark Mode** - Beautiful Rose Pine theme
- **Mobile Responsive** - Works seamlessly on all devices
- **Local Storage** - Your data never leaves your device

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 with Radix UI components
- **Styling**: Tailwind CSS v4 with custom Rose Pine theme
- **Forms**: React Hook Form + Zod validation
- **TypeScript**: Strict mode with enhanced safety checks
- **Runtime**: Bun (recommended) or Node.js

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

# Start production server
bun run start
```

## Project Structure

`
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with theme
│   ├── page.tsx           # Main calendar page
│   └── globals.css        # Global styles & theme
├── components/
│   ├── schedule/          # Calendar components
│   │   ├── week-grid.tsx
│   │   ├── event-card.tsx
│   │   ├── export-menu.tsx
│   │   └── ...
│   └── ui/                # Reusable UI components
├── lib/
│   ├── schedule-utils.ts  # Calendar logic
│   ├── export-utils.ts    # Export functionality
│   ├── import-utils.ts    # Import parsers
│   └── assets.ts          # External asset URLs
├── types/
│   └── schedule.ts        # TypeScript types
└── public/
    └── icon.svg           # App icon
`

## Usage

### Adding Events

1. Click "Add Event" button
2. Choose event type (Course, Study Block, Exam)
3. Fill in details (time, location, etc.)
4. Save to calendar

### Bulk Import

1. Click "Manage Data" → "Bulk Input"
2. Paste schedule in supported format:
   `
   CS101 | Intro to Programming | Mon,Wed | 09:00-10:30 | Room 101
   MATH201 | Calculus II | Tue,Thu | 13:00-14:30 | Online
   `
3. Events automatically populate

### Exporting

- **ICS**: Import into Google Calendar, Outlook, Apple Calendar
- **CSV**: Open in Excel/Sheets for further editing
- **PNG**: Share schedule as an image
- **Text**: Copy formatted text summary

## Contributing

This is a personal project, but suggestions are welcome! Please open an issue to discuss changes.

## License

MIT License - See LICENSE file for details
