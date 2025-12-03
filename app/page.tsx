"use client"

import { useState, useEffect, useRef, lazy, Suspense } from "react"
import { Plus, Sparkles, Menu, X, SlidersHorizontal, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import type { CourseEvent, StudyBlock, FilterType, TimeZone, ScheduleEvent, ImportantDate } from "@/types/schedule"
import { SEED_COURSES, SEED_STUDY_BLOCKS, IMPORTANT_DATES } from "@/lib/schedule-data"
import {
  saveScheduleData,
  loadScheduleData,
  clearScheduleData,
  ensureScheduleInitialized,
  resetScheduleData,
} from "@/lib/schedule-utils"
import { WeekGrid } from "@/components/schedule/week-grid"
import { ExportMenu } from "@/components/schedule/export-menu"
import { OverviewSection } from "@/components/schedule/overview-section"
import { DataManagement, DataManagementHandle } from "@/components/schedule/data-management"
import { OnboardingBanner } from "@/components/schedule/onboarding-banner"
import { QuickActions } from "@/components/schedule/quick-actions"
import { toast } from "sonner"

const EditEventDialog = lazy(() => import("@/components/schedule/edit-event-dialog").then(mod => ({ default: mod.EditEventDialog })))
const AddEventDialog = lazy(() => import("@/components/schedule/add-event-dialog").then(mod => ({ default: mod.AddEventDialog })))
const OnboardingGuideDialog = lazy(() => import("@/components/schedule/onboarding-guide-dialog").then(mod => ({ default: mod.OnboardingGuideDialog })))


const canonicalizeById = <T extends { id: string }>(items: T[]) =>
  JSON.stringify(
    [...items]
      .map((item) => ({ ...item }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  )

const SEED_COURSE_SIGNATURE = canonicalizeById(SEED_COURSES)
const SEED_STUDY_SIGNATURE = canonicalizeById(SEED_STUDY_BLOCKS)
const SEED_DATES_SIGNATURE = canonicalizeById(IMPORTANT_DATES)

const matchesSeedSchedule = (
  courses: CourseEvent[],
  studyBlocks: StudyBlock[],
  importantDates: ImportantDate[],
) =>
  canonicalizeById(courses) === SEED_COURSE_SIGNATURE &&
  canonicalizeById(studyBlocks) === SEED_STUDY_SIGNATURE &&
  canonicalizeById(importantDates) === SEED_DATES_SIGNATURE

const uniqueById = <T extends { id: string }>(items: T[]) => {
  const seen = new Set<string>()
  const result: T[] = []
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      result.push(item)
    }
  }
  return result
}

const mergeById = <T extends { id: string }>(existing: T[], incoming: T[]) => {
  if (incoming.length === 0) return existing
  const map = new Map<string, T>()
  for (const item of existing) {
    map.set(item.id, item)
  }
  for (const item of incoming) {
    map.set(item.id, item)
  }
  return Array.from(map.values())
}

export default function SchedulePage() {
  const [courses, setCourses] = useState<CourseEvent[]>([])
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>([])
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [timeZone, setTimeZone] = useState<TimeZone>("CT")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showHeaderPanels, setShowHeaderPanels] = useState(true)

  // Dialog states
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Refs for quick actions
  const dataManagementRef = useRef<DataManagementHandle>(null)
  const exportMenuRef = useRef<HTMLButtonElement>(null)

  // Load data on mount
  useEffect(() => {
    ensureScheduleInitialized()
    const {
      courses: savedCourses,
      studyBlocks: savedStudyBlocks,
      importantDates: savedImportantDates,
    } = loadScheduleData()

    if (matchesSeedSchedule(savedCourses, savedStudyBlocks, savedImportantDates)) {
      const blank = resetScheduleData()
      setCourses(blank.courses)
      setStudyBlocks(blank.studyBlocks)
      setImportantDates(blank.importantDates)
      setIsLoaded(true)
      return
    }

    if (savedCourses.length === 0 && savedStudyBlocks.length === 0 && savedImportantDates.length === 0) {
      setCourses([])
      setStudyBlocks([])
      setImportantDates([])
      saveScheduleData([], [], [])
    } else {
      const normalizedCourses = uniqueById(savedCourses)
      const normalizedStudyBlocks = uniqueById(savedStudyBlocks)
      const hasStoredImportantDates = savedImportantDates.length > 0
      const normalizedImportantDates = hasStoredImportantDates
        ? uniqueById(savedImportantDates)
        : normalizedCourses.length > 0 || normalizedStudyBlocks.length > 0
          ? IMPORTANT_DATES
          : []

      setCourses(normalizedCourses)
      setStudyBlocks(normalizedStudyBlocks)
      setImportantDates(normalizedImportantDates)

      if (!hasStoredImportantDates && normalizedImportantDates.length > 0) {
        saveScheduleData(normalizedCourses, normalizedStudyBlocks, normalizedImportantDates)
      }
    }

    setIsLoaded(true)
  }, [])

  // Auto-save when data changes (debounced)
  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveScheduleData(courses, studyBlocks, importantDates)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [courses, studyBlocks, importantDates, isLoaded])

  const handleDataUpdate = (data: {
    courses: CourseEvent[]
    studyBlocks: StudyBlock[]
    importantDates: ImportantDate[]
    mode?: "append" | "replace"
  }) => {
    const {
      courses: incomingCourses,
      studyBlocks: incomingStudyBlocks,
      importantDates: incomingDates,
      mode = "append",
    } = data

    if (mode === "replace") {
      const normalizedCourses = uniqueById(incomingCourses)
      const normalizedStudyBlocks = uniqueById(incomingStudyBlocks)
      const normalizedImportantDates = uniqueById(incomingDates)

      setCourses(normalizedCourses)
      setStudyBlocks(normalizedStudyBlocks)
      setImportantDates(normalizedImportantDates)
      saveScheduleData(normalizedCourses, normalizedStudyBlocks, normalizedImportantDates)
      return
    }

    if (incomingCourses.length > 0) {
      setCourses((prev) => mergeById(prev, incomingCourses))
    }
    if (incomingStudyBlocks.length > 0) {
      setStudyBlocks((prev) => mergeById(prev, incomingStudyBlocks))
    }
    if (incomingDates.length > 0) {
      setImportantDates((prev) => mergeById(prev, incomingDates))
    }
  }

  const handleEventClick = (event: ScheduleEvent) => {
    setEditingEvent(event)
    setIsEditDialogOpen(true)
  }

  const handleSaveEvent = (updatedEvent: ScheduleEvent) => {
    if (updatedEvent.type === "study") {
      setStudyBlocks((prev) =>
        prev.map((block) => (block.id === updatedEvent.id ? (updatedEvent as StudyBlock) : block)),
      )
    } else {
      setCourses((prev) =>
        prev.map((course) => (course.id === updatedEvent.id ? (updatedEvent as CourseEvent) : course)),
      )
    }
  }

  const handleDeleteEvent = (eventId: string) => {
    setCourses((prev) => prev.filter((course) => course.id !== eventId))
    setStudyBlocks((prev) => prev.filter((block) => block.id !== eventId))
  }

  const handleAddEvent = (newEvent: Omit<ScheduleEvent, "id">) => {
    const id = crypto.randomUUID()
    const eventWithId = { ...newEvent, id }

    if (newEvent.type === "study") {
      setStudyBlocks((prev) => [...prev, eventWithId as StudyBlock])
    } else {
      setCourses((prev) => [...prev, eventWithId as CourseEvent])
    }
  }

  const handleAddDate = (newDate: Omit<ImportantDate, "id">) => {
    const id = crypto.randomUUID()
    setImportantDates((prev) => [...prev, { ...newDate, id }])
  }

  const handleDeleteDate = (dateId: string) => {
    setImportantDates((prev) => prev.filter((date) => date.id !== dateId))
  }

  const handleLoadExample = () => {
    const courseSeed = SEED_COURSES.map((course) => ({ ...course }))
    const studySeed = SEED_STUDY_BLOCKS.map((block) => ({ ...block }))
    const dateSeed = IMPORTANT_DATES.map((date) => ({ ...date }))

    clearScheduleData()
    setCourses(courseSeed)
    setStudyBlocks(studySeed)
    setImportantDates(dateSeed)
    saveScheduleData(courseSeed, studySeed, dateSeed)
    toast.success("Example semester loaded. Tweak anything or replace it with your own schedule.")
  }

  const handleStartNewSchedule = () => {
    const blank = resetScheduleData()
    setCourses(blank.courses)
    setStudyBlocks(blank.studyBlocks)
    setImportantDates(blank.importantDates)

    const snapshot = JSON.stringify(blank, null, 2)
    const blob = new Blob([snapshot], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "semester-schedule.json"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success("Started a new schedule. A JSON snapshot has been downloaded for safekeeping.")
  }

  const allEvents = [...courses, ...studyBlocks]
  const hasEvents = allEvents.length > 0

  const headerPanelClasses = [
    isMenuOpen ? "grid" : "hidden",
    showHeaderPanels ? "sm:grid" : "sm:hidden",
    "gap-3 sm:gap-4 transition-all duration-300 lg:grid-cols-2",
  ].join(" ")

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ring border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-muted-foreground">Loading your schedule...</div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-background">
      <header className="glass-header p-3 sm:p-4 slide-up">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Semester Calendar Builder</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {hasEvents ? `${allEvents.length} events scheduled` : "Build your perfect semester schedule"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 sm:hidden"
                  onClick={() => setIsMenuOpen((open) => !open)}
                  aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                  aria-controls="header-controls"
                >
                  {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 hidden sm:inline-flex"
                  onClick={() => setShowHeaderPanels((visible) => !visible)}
                  aria-label={showHeaderPanels ? "Hide quick actions and filters" : "Show quick actions and filters"}
                  aria-pressed={showHeaderPanels}
                  aria-expanded={showHeaderPanels}
                  aria-controls="header-controls"
                  title={showHeaderPanels ? "Hide quick actions" : "Show quick actions"}
                >
                  <SlidersHorizontal className={`w-4 h-4 transition-transform ${showHeaderPanels ? "" : "-rotate-90"}`} />
                  <span className="sr-only">
                    {showHeaderPanels ? "Hide quick actions and filters" : "Show quick actions and filters"}
                  </span>
                </Button>
              </div>
            </div>

            <div id="header-controls" className={headerPanelClasses}>
              <div className="glass-card p-2.5 sm:p-3 rounded-lg shadow-[var(--shadow-xs)]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick Actions</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch gap-2">
                  <DataManagement ref={dataManagementRef} onDataUpdate={handleDataUpdate} />
                  <Button
                    onClick={() => setIsGuideOpen(true)}
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    aria-label="Show onboarding guide"
                  >
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Onboarding Guide</span>
                    <span className="xs:hidden">Guide</span>
                  </Button>
                  <Button
                    onClick={handleStartNewSchedule}
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    aria-label="Start a new blank schedule"
                  >
                    <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">New Schedule</span>
                    <span className="xs:hidden">New</span>
                  </Button>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    size="sm"
                    className="w-full sm:w-auto"
                    aria-label="Add new event or study block"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Add Event</span>
                    <span className="xs:hidden">Add</span>
                  </Button>
                  <ExportMenu ref={exportMenuRef} events={allEvents} />
                </div>
              </div>

              <div className="glass-card p-2.5 sm:p-3 rounded-lg shadow-[var(--shadow-xs)] space-y-3">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Time Zone
                  </span>
                  <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto sm:overflow-visible pr-1">
                    {(["PT", "MT", "CT", "ET"] as TimeZone[]).map((tz) => (
                      <Button
                        key={tz}
                        size="sm"
                        variant={timeZone === tz ? "default" : "outline"}
                        className="min-w-[3.5rem]"
                        onClick={() => setTimeZone(tz)}
                        aria-pressed={timeZone === tz}
                      >
                        {tz}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Filter Events
                  </span>
                  <div className="flex flex-nowrap sm:flex-wrap gap-2 sm:gap-3 min-w-max sm:min-w-0 overflow-x-auto sm:overflow-visible pr-1">
                    {(["all", "inperson", "online", "study", "exam"] as FilterType[]).map((filter) => (
                      <Button
                        key={filter}
                        size="sm"
                        variant={activeFilter === filter ? "default" : "outline"}
                        className="capitalize"
                        onClick={() => setActiveFilter(filter)}
                        aria-pressed={activeFilter === filter}
                      >
                        {filter === "inperson" ? "In-person" : filter}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="main-content p-3 sm:p-4 pb-20 sm:pb-4">
        <div className="schedule-container max-w-7xl mx-auto grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(240px,0.9fr)] lg:items-start">
          <div className="lg:col-span-2 space-y-4">
            <OnboardingBanner
              hasEvents={hasEvents}
              onAddEvent={() => setIsAddDialogOpen(true)}
              onManageData={() => dataManagementRef.current?.openMenu()}
              onLoadExample={handleLoadExample}
            />
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="scale-in lg:hidden">
              <OverviewSection
                dates={importantDates}
                onAddDate={handleAddDate}
                onDeleteDate={handleDeleteDate}
                className="shadow-[var(--shadow-xs)]"
              />
            </div>

            <div className="block sm:hidden scale-in">
              <QuickActions
                onAddEvent={() => setIsAddDialogOpen(true)}
                onExport={() => exportMenuRef.current?.click()}
                onImport={() => dataManagementRef.current?.triggerFileImport()}
                onStartNewSchedule={handleStartNewSchedule}
                onLoadExample={hasEvents ? undefined : handleLoadExample}
                onShowGuide={() => setIsGuideOpen(true)}
                className="shadow-[var(--shadow-xs)]"
              />
            </div>

            <div id="schedule-grid" role="main" aria-label="Weekly schedule grid" className="relative scale-in">
              <WeekGrid
                events={allEvents}
                activeFilter={activeFilter}
                timeZone={timeZone}
                onEventClick={handleEventClick}
              />
            </div>

            <div className="glass-card p-3 sm:p-4 rounded-lg scale-in shadow-[var(--shadow-xs)]">
              <h3 className="font-semibold mb-2.5 sm:mb-3 text-xs sm:text-sm text-foreground uppercase tracking-wide">Event Types</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-[11px] sm:text-xs">
                <div className="flex items-center gap-1.5 group">
                  <div
                    className="w-3.5 h-3.5 rounded flex-shrink-0 group-hover:scale-110 transition-transform border"
                    style={{ backgroundColor: "var(--event-inperson)", borderColor: "var(--event-inperson)", opacity: 0.25 }}
                  ></div>
                  <span className="truncate text-muted-foreground group-hover:text-foreground transition-colors">
                    In-person Classes
                  </span>
                </div>
                <div className="flex items-center gap-1.5 group">
                  <div
                    className="w-3.5 h-3.5 rounded flex-shrink-0 group-hover:scale-110 transition-transform border"
                    style={{ backgroundColor: "var(--event-online)", borderColor: "var(--event-online)", opacity: 0.25 }}
                  ></div>
                  <span className="truncate text-muted-foreground group-hover:text-foreground transition-colors">
                    Online Classes
                  </span>
                </div>
                <div className="flex items-center gap-1.5 group">
                  <div
                    className="w-3.5 h-3.5 rounded flex-shrink-0 group-hover:scale-110 transition-transform border"
                    style={{ backgroundColor: "var(--event-study)", borderColor: "var(--event-study)", opacity: 0.25 }}
                  ></div>
                  <span className="truncate text-muted-foreground group-hover:text-foreground transition-colors">
                    Study Blocks
                  </span>
                </div>
                <div className="flex items-center gap-1.5 group">
                  <div
                    className="w-3.5 h-3.5 rounded flex-shrink-0 group-hover:scale-110 transition-transform border"
                    style={{ backgroundColor: "var(--event-exam)", borderColor: "var(--event-exam)", opacity: 0.25 }}
                  ></div>
                  <span className="truncate text-muted-foreground group-hover:text-foreground transition-colors">Exams</span>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4 sm:space-y-5 lg:space-y-6">
            <div className="hidden lg:block scale-in">
              <QuickActions
                onAddEvent={() => setIsAddDialogOpen(true)}
                onExport={() => exportMenuRef.current?.click()}
                onImport={() => dataManagementRef.current?.triggerFileImport()}
                onStartNewSchedule={handleStartNewSchedule}
                onLoadExample={hasEvents ? undefined : handleLoadExample}
                onShowGuide={() => setIsGuideOpen(true)}
                className="shadow-[var(--shadow-xs)]"
              />
            </div>

            <div className="hidden lg:block scale-in">
              <OverviewSection
                dates={importantDates}
                onAddDate={handleAddDate}
                onDeleteDate={handleDeleteDate}
                className="shadow-[var(--shadow-xs)]"
              />
            </div>
          </aside>
        </div>
      </main>

      <Suspense fallback={null}>
        <EditEventDialog
          event={editingEvent}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setEditingEvent(null)
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      </Suspense>

      <Suspense fallback={null}>
        <AddEventDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onAdd={handleAddEvent} />
      </Suspense>

      <Suspense fallback={null}>
        <OnboardingGuideDialog
          open={isGuideOpen}
          onOpenChange={setIsGuideOpen}
          onLoadExample={handleLoadExample}
          onAddEvent={() => setIsAddDialogOpen(true)}
          onManageData={() => dataManagementRef.current?.openMenu()}
        />
      </Suspense>
    </div>
  )
}
