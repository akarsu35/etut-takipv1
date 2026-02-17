'use server'

import prisma from '@/services/db'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getAbsoluteWeek } from '@/lib/dateUtils'

async function getUserId() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    console.log('getUserId: session found?', !!session)
    if (!session) {
      console.warn('getUserId: No session found')
      throw new Error('Oturum bulunamadı')
    }
    return session.user.id
  } catch (error: any) {
    console.error('getUserId Error Detail:', error)
    if (error instanceof Error) {
      console.error('Error Message:', error.message)
      console.error('Error Stack:', error.stack)
    }
    throw error
  }
}

export async function getInitialData() {
  try {
    const userId = await getUserId()

    const students = await prisma.student.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    })
    const sessions = await prisma.etutSession.findMany({
      where: { userId },
    })

    // --- MIGRATION & RECOVERY LOGIC ---
    const WEEKS_BETWEEN_1970_2024 = 2817

    // Recovery constants
    const FUTURE_CORRUPTION_THRESHOLD = 3500
    const CORRUPTION_SHIFT = 984 // 3912 -> 2928

    const migratedSessions = await Promise.all(
      sessions.map(async (s) => {
        let newAbsoluteOffset = 0

        // Case 1: RECOVERY (Fix data shifted 19 years into future)
        if (s.weekOffset > FUTURE_CORRUPTION_THRESHOLD) {
          newAbsoluteOffset = s.weekOffset - CORRUPTION_SHIFT
          console.log(
            `[RECOVERY] Fixing session ${s.id}: ${s.weekOffset} -> ${newAbsoluteOffset}`,
          )

          await prisma.etutSession.update({
            where: { id: s.id },
            data: { weekOffset: newAbsoluteOffset },
          })
          return { ...s, weekOffset: newAbsoluteOffset }
        }

        // Case 2: Already correct (1970-based, ~2900 range)
        if (s.weekOffset > 2000) {
          return s
        }

        // Case 3: 2024-Absolute (Buggy migration artifacts, 20-100 range)
        if (s.weekOffset > 20) {
          newAbsoluteOffset = s.weekOffset + WEEKS_BETWEEN_1970_2024
        }
        // Case 4: Relative (Legacy data, 0, 1 range)
        else {
          const absWeekOfCreation = getAbsoluteWeek(s.createdAt)
          newAbsoluteOffset = absWeekOfCreation + s.weekOffset
        }

        // DB Update for Cases 3 & 4
        await prisma.etutSession.update({
          where: { id: s.id },
          data: { weekOffset: newAbsoluteOffset },
        })

        return { ...s, weekOffset: newAbsoluteOffset }
      }),
    )
    // ---------------------------------------------
    const archives = await prisma.archivedWeek.findMany({
      where: { userId },
      include: { sessions: true },
      orderBy: { id: 'desc' },
    })

    const days = await prisma.programDay.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    })
    const slots = await prisma.timeSlot.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    })

    return {
      students: JSON.parse(JSON.stringify(students)),
      sessions: JSON.parse(JSON.stringify(migratedSessions)),
      archives: JSON.parse(JSON.stringify(archives)),
      programDays: JSON.parse(JSON.stringify(days)),
      timeSlots: JSON.parse(JSON.stringify(slots)),
    }
  } catch (error) {
    console.error('Veri çekme hatası:', error)
    return {
      students: [],
      sessions: [],
      archives: [],
      programDays: [],
      timeSlots: [],
    }
  }
}

export async function addStudentAction(data: {
  name: string
  grade: string
  color: string
}) {
  const userId = await getUserId()
  const student = await prisma.student.create({
    data: {
      name: data.name,
      grade: data.grade,
      color: data.color,
      userId,
    },
  })
  return JSON.parse(JSON.stringify(student))
}

export async function addManyStudentsAction(
  studentsData: { name: string; grade: string; color: string }[],
) {
  const userId = await getUserId()
  const createdStudents = await Promise.all(
    studentsData.map((data) =>
      prisma.student.create({
        data: {
          name: data.name,
          grade: data.grade,
          color: data.color,
          userId,
        },
      }),
    ),
  )
  return JSON.parse(JSON.stringify(createdStudents))
}

export async function deleteStudentAction(id: string) {
  const userId = await getUserId()
  await prisma.student.delete({
    where: { id, userId },
  })
}

export async function updateStudentAction(
  id: string,
  data: { name: string; grade: string },
) {
  const userId = await getUserId()
  const updated = await prisma.student.update({
    where: { id, userId },
    data: { name: data.name, grade: data.grade },
  })
  return JSON.parse(JSON.stringify(updated))
}

export async function addSessionsAction(sessionData: any[]) {
  const userId = await getUserId()
  const newSessions = await Promise.all(
    sessionData.map((s) =>
      prisma.etutSession.create({
        data: {
          studentId: s.studentId,
          day: s.day,
          timeSlot: s.timeSlot,
          note: s.note,
          weekOffset: s.weekOffset,
          userId,
        },
      }),
    ),
  )
  return JSON.parse(JSON.stringify(newSessions))
}

export async function removeSessionAction(id: string) {
  const userId = await getUserId()
  await prisma.etutSession.delete({
    where: { id, userId },
  })
}

export async function archiveWeekAction(weekRange: string, sessions: any[]) {
  const userId = await getUserId()
  // İlk olarak arşivi oluştur
  const archive = await prisma.archivedWeek.create({
    data: {
      weekRange: weekRange,
      userId,
    },
  })

  // Oturumları bu arşive bağla
  await Promise.all(
    sessions.map((s) =>
      prisma.etutSession.update({
        where: { id: s.id, userId },
        data: { archivedWeekId: archive.id },
      }),
    ),
  )

  const finalArchive = await prisma.archivedWeek.findUnique({
    where: { id: archive.id, userId },
    include: { sessions: true },
  })

  return JSON.parse(JSON.stringify(finalArchive))
}

export async function deleteArchivedWeekAction(id: string) {
  const userId = await getUserId()
  await prisma.archivedWeek.delete({
    where: { id, userId },
  })
}

export async function updateSessionAttendanceAction(
  sessionId: string,
  attended: boolean | null,
) {
  const userId = await getUserId()
  const updated = await prisma.etutSession.update({
    where: { id: sessionId, userId },
    data: { attended },
  })
  return JSON.parse(JSON.stringify(updated))
}
