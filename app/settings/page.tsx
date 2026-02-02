'use client'

import React, { useState } from 'react'
import {
  Settings,
  Plus,
  Trash2,
  Calendar,
  Clock,
  GripVertical,
  Edit2,
  Check,
  X,
} from 'lucide-react'
import { useEtut } from '@/context/EtutContext'
import {
  addProgramDay,
  deleteProgramDay,
  updateProgramDay,
  addTimeSlot,
  deleteTimeSlot,
  updateTimeSlot,
  reorderProgramDays,
  reorderTimeSlots,
} from '@/actions/programActions'

export default function SettingsPage() {
  const { programDays, timeSlots, refreshProgram, loading } = useEtut()
  const [newDay, setNewDay] = useState('')
  const [newSlot, setNewSlot] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleAddDay = async () => {
    if (!newDay.trim()) return
    await addProgramDay(newDay, programDays.length)
    setNewDay('')
    await refreshProgram()
  }

  const handleDeleteDay = async (id: string) => {
    if (!confirm('Bu günü silmek istediğinizden emin misiniz?')) return
    await deleteProgramDay(id)
    await refreshProgram()
  }

  const handleUpdateDay = async (id: string, currentOrder: number) => {
    if (!editValue.trim()) return
    await updateProgramDay(id, editValue, currentOrder)
    setEditingId(null)
    await refreshProgram()
  }

  const handleAddSlot = async () => {
    if (!newSlot.trim()) return
    await addTimeSlot(newSlot, timeSlots.length)
    setNewSlot('')
    await refreshProgram()
  }

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Bu saat dilimini silmek istediğinizden emin misiniz?')) return
    await deleteTimeSlot(id)
    await refreshProgram()
  }

  const handleUpdateSlot = async (id: string, currentOrder: number) => {
    if (!editValue.trim()) return
    await updateTimeSlot(id, editValue, currentOrder)
    setEditingId(null)
    await refreshProgram()
  }

  // --- Drag & Drop Reordering Logic ---
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id)
    e.dataTransfer.setData('itemId', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDayDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedItemId || draggedItemId === targetId) return

    const items = [...programDays].sort((a, b) => a.order - b.order)
    const draggedIdx = items.findIndex((i) => i.id === draggedItemId)
    const targetIdx = items.findIndex((i) => i.id === targetId)

    const [draggedItem] = items.splice(draggedIdx, 1)
    items.splice(targetIdx, 0, draggedItem)

    await reorderProgramDays(items.map((i) => i.id))
    await refreshProgram()
    setDraggedItemId(null)
  }

  const handleSlotDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedItemId || draggedItemId === targetId) return

    const items = [...timeSlots].sort((a, b) => a.order - b.order)
    const draggedIdx = items.findIndex((i) => i.id === draggedItemId)
    const targetIdx = items.findIndex((i) => i.id === targetId)

    const [draggedItem] = items.splice(draggedIdx, 1)
    items.splice(targetIdx, 0, draggedItem)

    await reorderTimeSlots(items.map((i) => i.id))
    await refreshProgram()
    setDraggedItemId(null)
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-gray-900 flex items-center">
            <Settings className="w-10 h-10 mr-4 text-indigo-600" /> Program
            Ayarları
          </h2>
          <p className="text-gray-500 font-medium mt-2 ml-14">
            Takviminizdeki günleri ve saat dilimlerini buradan yönetebilirsiniz.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Gün Yönetimi */}
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-100/50 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-800 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-indigo-500" /> Günler
            </h3>
            <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              {programDays.length} Aktif
            </span>
          </div>

          <div className="space-y-4">
            {programDays.map((day) => (
              <div
                key={day.id}
                draggable
                onDragStart={(e) => handleDragStart(e, day.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDayDrop(e, day.id)}
                className={`flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 rounded-2xl group hover:border-indigo-200 transition-all cursor-move ${draggedItemId === day.id ? 'opacity-40 border-dashed scale-95' : ''}`}
              >
                <div className="flex items-center flex-1 mr-4">
                  <GripVertical className="w-5 h-5 text-gray-300 mr-3 group-hover:text-indigo-400 shrink-0" />
                  {editingId === day.id ? (
                    <div className="flex items-center flex-1 space-x-2">
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          handleUpdateDay(day.id, day.order)
                        }
                        className="flex-1 px-3 py-1 bg-white border border-indigo-300 rounded-lg font-bold outline-none"
                      />
                      <button
                        onClick={() => handleUpdateDay(day.id, day.order)}
                        className="text-emerald-500 hover:text-emerald-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-rose-400 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span
                      className="font-bold text-gray-700 cursor-text"
                      onClick={() => {
                        setEditingId(day.id)
                        setEditValue(day.name)
                      }}
                    >
                      {day.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {editingId !== day.id && (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(day.id)
                          setEditValue(day.name)
                        }}
                        className="p-2.5 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDay(day.id)}
                        className="p-2.5 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex space-x-3">
            <input
              type="text"
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
              placeholder="Yeni Gün Ekle..."
              className="flex-1 px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold transition-all text-sm"
            />
            <button
              onClick={handleAddDay}
              className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Saat Dilimi Yönetimi */}
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-100/50 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-800 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-emerald-500" /> Saat Dilimleri
            </h3>
            <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              {timeSlots.length} Seans
            </span>
          </div>

          <div className="space-y-4">
            {timeSlots.map((slot) => (
              <div
                key={slot.id}
                draggable
                onDragStart={(e) => handleDragStart(e, slot.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleSlotDrop(e, slot.id)}
                className={`flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 rounded-2xl group hover:border-emerald-200 transition-all cursor-move ${draggedItemId === slot.id ? 'opacity-40 border-dashed scale-95' : ''}`}
              >
                <div className="flex items-center flex-1 mr-4">
                  <GripVertical className="w-5 h-5 text-gray-300 mr-3 group-hover:text-emerald-400 shrink-0" />
                  {editingId === slot.id ? (
                    <div className="flex items-center flex-1 space-x-2">
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          handleUpdateSlot(slot.id, slot.order)
                        }
                        className="flex-1 px-3 py-1 bg-white border border-emerald-300 rounded-lg font-bold outline-none"
                      />
                      <button
                        onClick={() => handleUpdateSlot(slot.id, slot.order)}
                        className="text-emerald-500 hover:text-emerald-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-rose-400 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span
                      className="font-bold text-gray-700 cursor-text"
                      onClick={() => {
                        setEditingId(slot.id)
                        setEditValue(slot.label)
                      }}
                    >
                      {slot.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {editingId !== slot.id && (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(slot.id)
                          setEditValue(slot.label)
                        }}
                        className="p-2.5 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-2.5 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex space-x-3">
            <input
              type="text"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              placeholder="Yeni Saat (Örn: 09:00 - 10:00)..."
              className="flex-1 px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none font-bold transition-all text-sm"
            />
            <button
              onClick={handleAddSlot}
              className="bg-emerald-600 text-white p-4 rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100">
        <div className="flex items-start space-x-5">
          <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-amber-900 uppercase tracking-wider text-xs mb-1">
              Önemli Not
            </h4>
            <p className="text-sm text-amber-700 font-medium leading-relaxed">
              Programda yaptığınız değişiklikler ana takvim görünümünü anında
              etkiler. Bir saat dilimini veya günü sildiğinizde, o alana ait
              geçmiş veriler (arşivlenmemişse) takvimden kalkar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
