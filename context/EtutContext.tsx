'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import { toast } from 'react-hot-toast'
import { Student, Session, ArchivedWeek, Day } from '../types'
import {
  getInitialData,
  addStudentAction,
  addManyStudentsAction,
  deleteStudentAction,
  updateStudentAction,
  addSessionsAction,
  removeSessionAction,
  archiveWeekAction,
  deleteArchivedWeekAction,
  updateSessionAttendanceAction,
} from '@/actions/etutActions'
import { seedDefaultsIfEmpty } from '@/actions/programActions'
import { authClient } from '@/lib/auth-client'

interface EtutContextType {
  students: Student[]
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>
  allSessions: Session[]
  setAllSessions: React.Dispatch<React.SetStateAction<Session[]>>
  archivedWeeks: ArchivedWeek[]
  setArchivedWeeks: React.Dispatch<React.SetStateAction<ArchivedWeek[]>>
  programDays: { id: string; name: string; order: number }[]
  timeSlots: { id: string; label: string; order: number }[]
  weekOffset: number
  setWeekOffset: React.Dispatch<React.SetStateAction<number>>
  loading: boolean
  refreshProgram: () => Promise<void>
  user: any

  addStudent: (name: string, grade: string) => Promise<void>
  deleteStudent: (id: string) => Promise<void>
  updateStudent: (id: string, name: string, grade: string) => Promise<void>
  removeSession: (sessionId: string) => Promise<void>
  addSessions: (
    sessionData: {
      studentId: string
      day: Day
      timeSlot: string
      note: string
      weekOffset: number
    }[],
  ) => Promise<void>
  addManyStudents: (
    studentsData: { name: string; grade: string; color: string }[],
  ) => Promise<void>
  archiveCurrentWeek: (
    weekRangeLabel: string,
    currentlyNeglected: Student[],
    currentWeekSessions: Session[],
  ) => Promise<void>
  deleteArchivedWeek: (id: string) => Promise<void>
  updateSessionAttendance: (
    sessionId: string,
    attended: boolean | null,
  ) => Promise<void>
}

const EtutContext = createContext<EtutContextType | undefined>(undefined)

export const EtutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [students, setStudents] = useState<Student[]>([])
  const [allSessions, setAllSessions] = useState<Session[]>([])
  const [archivedWeeks, setArchivedWeeks] = useState<ArchivedWeek[]>([])
  const [programDays, setProgramDays] = useState<
    { id: string; name: string; order: number }[]
  >([])
  const [timeSlots, setTimeSlots] = useState<
    { id: string; label: string; order: number }[]
  >([])
  const [weekOffset, setWeekOffset] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!session) {
      setStudents([])
      setAllSessions([])
      setArchivedWeeks([])
      setProgramDays([])
      setTimeSlots([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Önce boşsa seed et (kullanıcı bazlı)
      await seedDefaultsIfEmpty()

      const data = await getInitialData()
      setStudents(data.students)
      setAllSessions(data.sessions)
      setArchivedWeeks(data.archives)
      setProgramDays(data.programDays)
      setTimeSlots(data.timeSlots)
    } catch (error) {
      console.error('Data loading error:', error)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (!sessionPending) {
      fetchData()
    }
  }, [fetchData, sessionPending])

  // ... (existing imports)

  // ... (inside EtutProvider)

  const addStudent = async (name: string, grade: string) => {
    try {
      const STUDENT_COLORS = [
        'bg-blue-100 border-blue-200 text-blue-800',
        'bg-purple-100 border-purple-200 text-purple-800',
        'bg-emerald-100 border-emerald-200 text-emerald-800',
        'bg-orange-100 border-orange-200 text-orange-800',
        'bg-rose-100 border-rose-200 text-rose-800',
        'bg-indigo-100 border-indigo-200 text-indigo-800',
        'bg-amber-100 border-amber-200 text-amber-800',
      ]

      const color = STUDENT_COLORS[students.length % STUDENT_COLORS.length]
      const newStudent = await addStudentAction({ name, grade, color })
      setStudents((prev) => [...prev, newStudent])
      toast.success('Öğrenci başarıyla eklendi!')
    } catch (error) {
      console.error(error)
      toast.error('Öğrenci eklenirken bir hata oluştu.')
    }
  }

  const addManyStudents = async (
    studentsData: { name: string; grade: string; color: string }[],
  ) => {
    try {
      const newStudents = await addManyStudentsAction(studentsData)
      setStudents((prev) => [...prev, ...newStudents])
      toast.success(`${newStudents.length} öğrenci başarıyla içe aktarıldı!`)
    } catch (error) {
      console.error(error)
      toast.error('Toplu ekleme sırasında hata oluştu.')
    }
  }

  const deleteStudent = async (id: string) => {
    if (
      !confirm(
        'Bu öğrenciyi ve tüm etütlerini silmek istediğinize emin misiniz?',
      )
    )
      return

    try {
      await deleteStudentAction(id)
      setStudents((prev) => prev.filter((s) => s.id !== id))
      setAllSessions((prev) => prev.filter((sess) => sess.studentId !== id))
      toast.success('Öğrenci silindi.')
    } catch (error) {
      console.error(error)
      toast.error('Silme işlemi başarısız.')
    }
  }

  const updateStudent = async (id: string, name: string, grade: string) => {
    try {
      const updated = await updateStudentAction(id, { name, grade })
      setStudents((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, name: updated.name, grade: updated.grade } : s,
        ),
      )
      toast.success('Öğrenci bilgileri güncellendi!')
    } catch (error) {
      console.error(error)
      toast.error('Güncelleme başarısız.')
    }
  }

  const removeSession = async (sessionId: string) => {
    try {
      await removeSessionAction(sessionId)
      setAllSessions((prev) => prev.filter((s) => s.id !== sessionId))
      toast.success('Etüt iptal edildi.')
    } catch (error) {
      console.error(error)
      toast.error('İptal işlemi başarısız.')
    }
  }

  const addSessions = async (
    sessionData: {
      studentId: string
      day: Day
      timeSlot: string
      note: string
      weekOffset: number
    }[],
  ) => {
    try {
      const newSessions = await addSessionsAction(sessionData)
      setAllSessions((prev) => [...prev, ...newSessions])
      toast.success('Etüt planlandı!')
    } catch (error) {
      console.error(error)
      toast.error('Etüt planlanırken hata oluştu.')
    }
  }

  const archiveCurrentWeek = async (
    weekRangeLabel: string,
    currentlyNeglected: Student[],
    currentWeekSessions: Session[],
  ) => {
    try {
      if (currentWeekSessions.length > 0) {
        const archive = await archiveWeekAction(
          weekRangeLabel,
          currentWeekSessions,
        )
        setArchivedWeeks((prev) => [archive, ...prev])
      }
      setWeekOffset((prev) => prev + 1)
      toast.success('Hafta başarıyla arşivlendi ve yeni haftaya geçildi.')
    } catch (error) {
      console.error(error)
      toast.error('Arşivleme hatası.')
    }
  }

  const deleteArchivedWeek = async (id: string) => {
    if (!confirm('Bu arşivi silmek istediğinizden emin misiniz?')) return
    try {
      await deleteArchivedWeekAction(id)
      setArchivedWeeks((prev) => prev.filter((a) => a.id !== id))
      toast.success('Arşiv silindi.')
    } catch (error) {
      console.error(error)
      toast.error('Arşiv silinemedi.')
    }
  }

  const updateSessionAttendance = async (
    sessionId: string,
    attended: boolean | null,
  ) => {
    try {
      const updated = await updateSessionAttendanceAction(sessionId, attended)
      setAllSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, attended: updated.attended } : s,
        ),
      )
      const statusText =
        attended === true
          ? 'Katıldı'
          : attended === false
            ? 'Gelmedi'
            : 'Belirsiz'
      toast.success(`Katılım durumu: ${statusText}`)
    } catch (error) {
      console.error(error)
      toast.error('Katılım durumu güncellenemedi.')
    }
  }

  return (
    <EtutContext.Provider
      value={{
        students,
        setStudents,
        allSessions,
        setAllSessions,
        archivedWeeks,
        setArchivedWeeks,
        weekOffset,
        setWeekOffset,
        loading: loading || sessionPending,
        addStudent,
        deleteStudent,
        updateStudent,
        removeSession,
        addSessions,
        addManyStudents,
        archiveCurrentWeek,
        deleteArchivedWeek,
        updateSessionAttendance,
        programDays,
        timeSlots,
        refreshProgram: fetchData,
        user: session?.user,
      }}
    >
      {children}
    </EtutContext.Provider>
  )
}

export const useEtut = () => {
  const context = useContext(EtutContext)
  if (context === undefined) {
    throw new Error('useEtut must be used within an EtutProvider')
  }
  return context
}
