export enum Day {
  MONDAY = 'Pazartesi',
  TUESDAY = 'Salı',
  WEDNESDAY = 'Çarşamba',
  THURSDAY = 'Perşembe',
  FRIDAY = 'Cuma',
  SATURDAY = 'Cumartesi',
  SUNDAY = 'Pazar',
}

export interface Student {
  id: string
  name: string
  grade: string
  color: string
}

export interface Session {
  id: string
  studentId: string
  day: Day
  timeSlot: string
  note?: string
  createdAt: number
  weekOffset: number // Hangi haftaya ait olduğunu takip eder
}

export interface WeekStats {
  totalSessions: number
  dayCounts: Record<string, number>
  studentCounts: Record<string, number>
}

export interface ArchivedWeek {
  id: string
  weekRange: string
  sessions: Session[]
}

export interface AiReport {
  summary: string
  focusStudents: { name: string; reason: string }[]
  busyDays: { day: string; count: number }[]
  pedagogicalAdvice: string
  mood: 'happy' | 'neutral' | 'busy' | 'productive'
}
