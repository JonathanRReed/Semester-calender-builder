"use client"

import { useState, useEffect, useRef } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CourseEvent, StudyBlock, FilterType, TimeZone, ScheduleEvent, ImportantDate } from "@/types/schedule"
import { SEED_COURSES, SEED_STUDY_BLOCKS, IMPORTANT_DATES } from "@/lib/schedule-data"
import { saveScheduleData, loadScheduleData } from "@/lib/schedule-utils"
import { WeekGrid } from "@/components/schedule/week-grid"
import { EditEventDialog } from "@/components/schedule/edit-event-dialog"
import { AddEventDialog } from "@/components/schedule/add-event-dialog"
import { ExportMenu } from "@/components/schedule/export-menu"
import { OverviewSection } from "@/components/schedule/overview-section"
import { DataManagement } from "@/components/schedule/data-management"
import { OnboardingBanner } from "@/components/schedule/onboarding-banner"
import { QuickActions } from "@/components/schedule/quick-actions"

export default function SchedulePage() {
  const [courses, setCourses] = useState<CourseEvent[]>([])
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>([])
  const [importantDates, setImportantDates] = useState<ImportantDate[]>(IMPORTANT_DATES)
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [timeZone, setTimeZone] = useState<TimeZone>("CT")
  const [isLoaded, setIsLoaded] = useState(false)

  // Dialog states
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Refs for quick actions
  const dataManagementRef = useRef<HTMLButtonElement>(null)
  const exportMenuRef = useRef<HTMLButtonElement>(null)

  // Load data on mount
  useEffect(() => {
    const { courses: savedCourses, studyBlocks: savedStudyBlocks } = loadScheduleData()

    if (savedCourses.length === 0 && savedStudyBlocks.length === 0) {
      // First time loading - use seed data
      setCourses(SEED_COURSES)
      setStudyBlocks(SEED_STUDY_BLOCKS)
      saveScheduleData(SEED_COURSES, SEED_STUDY_BLOCKS)
    } else {
      setCourses(savedCourses)
      setStudyBlocks(savedStudyBlocks)
    }

    setIsLoaded(true)
  }, [])

  // Auto-save when data changes (debounced)
  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveScheduleData(courses, studyBlocks)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [courses, studyBlocks, isLoaded])

  // resetToSeedData removed (unused)

  const handleDataUpdate = (data: {
    courses: CourseEvent[]
    studyBlocks: StudyBlock[]
    importantDates: ImportantDate[]
  }) => {
    if (data.courses.length > 0) {
      setCourses((prev) => [...prev, ...data.courses])
    }
    if (data.studyBlocks.length > 0) {
      setStudyBlocks((prev) => [...prev, ...data.studyBlocks])
    }
    if (data.importantDates.length > 0) {
      setImportantDates((prev) => [...prev, ...data.importantDates])
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
    const id = `${newEvent.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const eventWithId = { ...newEvent, id }

    if (newEvent.type === "study") {
      setStudyBlocks((prev) => [...prev, eventWithId as StudyBlock])
    } else {
      setCourses((prev) => [...prev, eventWithId as CourseEvent])
    }
  }

  const handleAddDate = (newDate: Omit<ImportantDate, "id">) => {
    const id = `date-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setImportantDates((prev) => [...prev, { ...newDate, id }])
  }

  const handleDeleteDate = (dateId: string) => {
    setImportantDates((prev) => prev.filter((date) => date.id !== dateId))
  }

  const allEvents = [...courses, ...studyBlocks]
  const hasEvents = allEvents.length > 0

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
      <header className="glass-header p-3 sm:p-4 sticky top-0 z-30 slide-up">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Semester Calendar Builder</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {hasEvents ? `${allEvents.length} events scheduled` : "Build your perfect semester schedule"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <DataManagement ref={dataManagementRef} onDataUpdate={handleDataUpdate} />
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  size="sm"
                  className="btn-primary flex items-center gap-1 text-xs sm:text-sm text-white scale-in"
                  aria-label="Add new event or study block"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Add Event</span>
                  <span className="xs:hidden">Add</span>
                </Button>
                <ExportMenu ref={exportMenuRef} events={allEvents} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1 glass-card rounded-lg p-1 w-fit">
                {(["PT", "MT", "CT", "ET"] as TimeZone[]).map((tz) => (
                  <button
                    key={tz}
                    onClick={() => setTimeZone(tz)}
                    className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                      timeZone === tz
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                    aria-pressed={timeZone === tz}
                  >
                    {tz}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {(["all", "inperson", "online", "study", "exam"] as FilterType[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 capitalize focus:outline-none focus:ring-2 focus:ring-ring/50 transform hover:scale-105 ${
                      activeFilter === filter
                        ? "btn-primary text-white shadow-lg"
                        : "btn-secondary text-muted-foreground hover:text-foreground"
                    }`}
                    aria-pressed={activeFilter === filter}
                  >
                    {filter === "inperson" ? "In-person" : filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content p-3 sm:p-4 pb-20 sm:pb-4">
        <div className="schedule-container max-w-7xl mx-auto space-y-6">
          <OnboardingBanner
            hasEvents={hasEvents}
            onAddEvent={() => setIsAddDialogOpen(true)}
            onManageData={() => dataManagementRef.current?.click()}
          />

          <div className="scale-in">
            <OverviewSection dates={importantDates} onAddDate={handleAddDate} onDeleteDate={handleDeleteDate} />
          </div>

          <div className="block sm:hidden scale-in">
            <QuickActions
              onAddEvent={() => setIsAddDialogOpen(true)}
              onExport={() => exportMenuRef.current?.click()}
              onImport={() => dataManagementRef.current?.click()}
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

          <div className="mt-4 sm:mt-6 glass-card p-4 sm:p-6 rounded-lg scale-in">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-foreground">Event Types</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2 group">
                <div
                  className="w-4 h-4 rounded flex-shrink-0 group-hover:scale-110 transition-transform border"
                  style={{ backgroundColor: "var(--event-inperson)", borderColor: "var(--event-inperson)", opacity: 0.25 }}
                ></div>
                <span className="truncate text-muted-foreground group-hover:text-foreground transition-colors">
                  In-person Classes
                </span>
              </div>
              <div className="flex items-center gap-2 group">
                <div
                  className="w-4 h-4 rounded flex-shrink-0 group-hover:scale-110 transition-transform border"
                  style={{ backgroundColor: "var(--event-online)", borderColor: "var(--event-online)", opacity: 0.25 }}
                ></div>
                <span className="truncate text-muted-foreground group-hover:text-foreground transition-colors">
                  Online Classes
                </span>
              </div>
              <div className="flex items-center gap-2 group">
                <div
                  className="w-4 h-4 rounded flex-shrink-0 group-hover:scale-110 transition-transform border"
                  style={{ backgroundColor: "var(--event-study)", borderColor: "var(--event-study)", opacity: 0.25 }}
                ></div>
                <span className="truncate text-muted-foreground group-hover:text-foreground transition-colors">
                  Study Blocks
                </span>
              </div>
              <div className="flex items-center gap-2 group">
                <div
                  className="w-4 h-4 rounded flex-shrink-0 group-hover:scale-110 transition-transform border"
                  style={{ backgroundColor: "var(--event-exam)", borderColor: "var(--event-exam)", opacity: 0.25 }}
                ></div>
                <span className="truncate text-muted-foreground group-hover:text-foreground transition-colors">Exams</span>
              </div>
            </div>
          </div>
        </div>
      </main>

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

      <AddEventDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onAdd={handleAddEvent} />
    </div>
  )
}
