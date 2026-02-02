'use server'

import prisma from '@/services/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

async function getUserId() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session) {
      console.warn('getUserId (Program): No session found')
      throw new Error('Oturum bulunamadı')
    }
    return session.user.id
  } catch (error: any) {
    console.error('getUserId (Program) Error Detail:', error)
    throw error
  }
}

export async function getProgramSettings() {
  try {
    const userId = await getUserId()
    const days = await prisma.programDay.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    })
    const slots = await prisma.timeSlot.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    })
    return { days, slots }
  } catch (error) {
    console.error('Program ayarları çekme hatası:', error)
    return { days: [], slots: [] }
  }
}

// Day Actions
export async function addProgramDay(name: string, order: number) {
  const userId = await getUserId()
  const day = await prisma.programDay.create({
    data: { name, order, userId },
  })
  revalidatePath('/')
  return JSON.parse(JSON.stringify(day))
}

export async function updateProgramDay(
  id: string,
  name: string,
  order: number,
) {
  const userId = await getUserId()
  const day = await prisma.programDay.update({
    where: { id, userId },
    data: { name, order },
  })
  revalidatePath('/')
  return JSON.parse(JSON.stringify(day))
}

export async function deleteProgramDay(id: string) {
  const userId = await getUserId()
  await prisma.programDay.delete({
    where: { id, userId },
  })
  revalidatePath('/')
}

// Slot Actions
export async function addTimeSlot(label: string, order: number) {
  const userId = await getUserId()
  const slot = await prisma.timeSlot.create({
    data: { label, order, userId },
  })
  revalidatePath('/')
  return JSON.parse(JSON.stringify(slot))
}

export async function updateTimeSlot(id: string, label: string, order: number) {
  const userId = await getUserId()
  const slot = await prisma.timeSlot.update({
    where: { id, userId },
    data: { label, order },
  })
  revalidatePath('/')
  return JSON.parse(JSON.stringify(slot))
}

export async function deleteTimeSlot(id: string) {
  const userId = await getUserId()
  await prisma.timeSlot.delete({
    where: { id, userId },
  })
  revalidatePath('/')
}

// Initial Seed Logic (User specific)
export async function seedDefaultsIfEmpty() {
  try {
    const userId = await getUserId()

    // Check if models exist on the prisma object (safety for stale client)
    if (!prisma.programDay || !prisma.timeSlot) {
      console.warn('Prisma modelleri henüz hazır değil, seed işlemi atlanıyor.')
      return
    }

    const daysCount = await prisma.programDay.count({ where: { userId } })
    const slotsCount = await prisma.timeSlot.count({ where: { userId } })

    if (daysCount === 0) {
      const defaultDays = [
        { name: 'Pazartesi', order: 0, userId },
        { name: 'Salı', order: 1, userId },
        { name: 'Çarşamba', order: 2, userId },
        { name: 'Perşembe', order: 3, userId },
        { name: 'Cuma', order: 4, userId },
      ]
      for (const d of defaultDays) {
        await prisma.programDay.create({ data: d })
      }
    }

    if (slotsCount === 0) {
      const defaultSlots = [
        { label: '08:20 - 09:00', order: 0, userId },
        { label: '14:25 - 15:05', order: 1, userId },
        { label: '16:40 - 17:20', order: 2, userId },
        { label: 'Etüt Saati (Özel)', order: 3, userId },
      ]
      for (const s of defaultSlots) {
        await prisma.timeSlot.create({ data: s })
      }
    }
  } catch (error) {
    console.error('Seed hatası:', error)
  }
}

// Bulk Reorder Actions
export async function reorderProgramDays(ids: string[]) {
  const userId = await getUserId()
  const updates = ids.map((id, index) =>
    prisma.programDay.update({
      where: { id, userId },
      data: { order: index },
    }),
  )
  await prisma.$transaction(updates)
  revalidatePath('/')
}

export async function reorderTimeSlots(ids: string[]) {
  const userId = await getUserId()
  const updates = ids.map((id, index) =>
    prisma.timeSlot.update({
      where: { id, userId },
      data: { order: index },
    }),
  )
  await prisma.$transaction(updates)
  revalidatePath('/')
}
