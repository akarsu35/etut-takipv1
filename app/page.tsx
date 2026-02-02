'use client'

import React, { useState, useMemo } from 'react'
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Check,
  AlertCircle,
  GripVertical,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Sun,
  Activity,
  Smile,
  Meh,
  Zap,
  Search,
  ChevronDown,
} from 'lucide-react'
import { Day, Student, AiReport } from '../types'
// DAYS_OF_WEEK ve TIME_SLOTS artık context'ten gelecek
import { generateWeeklyReport } from '../services/geminiService'
import { Modal } from '@/components/Modal'
import { Header } from '@/components/Header'
import { useEtut } from '@/context/EtutContext'

// --- Helpers ---
const getMonday = (date: Date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

const formatDate = (date: Date | undefined) => {
  if (!date) return '-'
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
}

export default function CalendarPage() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const {
    students,
    allSessions,
    weekOffset,
    setWeekOffset,
    removeSession,
    addSessions,
    archiveCurrentWeek,
    programDays,
    timeSlots,
  } = useEtut()

  // Drag State
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null)

  // Modal states
  const [showAddSession, setShowAddSession] = useState<{
    day: Day
    slot: string
  } | null>(null)
  const [aiReport, setAiReport] = useState<AiReport | string | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [showArchiveSummary, setShowArchiveSummary] = useState<{
    neglected: Student[]
    total: number
  } | null>(null)

  // Form states
  const [sessionNote, setSessionNote] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

  // Neglected students UI states
  const [isNeglectedExpanded, setIsNeglectedExpanded] = useState(false)
  const [neglectedSearchQuery, setNeglectedSearchQuery] = useState('')

  // Date Calculation
  const currentMonday = useMemo(() => {
    const today = new Date()
    today.setDate(today.getDate() + weekOffset * 7)
    return getMonday(today)
  }, [weekOffset])

  const weekDates = useMemo(() => {
    return programDays.map((_, index) => {
      const d = new Date(currentMonday)
      d.setDate(d.getDate() + index)
      return d
    })
  }, [currentMonday, programDays])

  const weekRangeLabel = useMemo(() => {
    if (!mounted || weekDates.length === 0) return 'Yükleniyor...'
    return `${formatDate(weekDates[0])} - ${formatDate(weekDates[weekDates.length - 1])}`
  }, [weekDates, mounted])

  const currentWeekSessions = useMemo(() => {
    return allSessions.filter((s) => s.weekOffset === weekOffset)
  }, [allSessions, weekOffset])

  // --- Neglected Logic ---
  const neglectedFromLastWeek = useMemo(() => {
    const lastWeekSessions = allSessions.filter(
      (s) => s.weekOffset === weekOffset - 1,
    )
    const currentSessions = allSessions.filter(
      (s) => s.weekOffset === weekOffset,
    )

    return students.filter(
      (s) =>
        !lastWeekSessions.some((sess) => sess.studentId === s.id) &&
        !currentSessions.some((sess) => sess.studentId === s.id),
    )
  }, [students, allSessions, weekOffset])

  const currentlyNeglected = useMemo(() => {
    return students.filter(
      (s) => !currentWeekSessions.some((sess) => sess.studentId === s.id),
    )
  }, [students, currentWeekSessions])

  // Filtered neglected students based on search
  const filteredNeglectedStudents = useMemo(() => {
    if (!neglectedSearchQuery.trim()) return neglectedFromLastWeek
    return neglectedFromLastWeek.filter((s) =>
      s.name.toLowerCase().includes(neglectedSearchQuery.toLowerCase()),
    )
  }, [neglectedFromLastWeek, neglectedSearchQuery])

  // Actions
  const addSelectedSessions = async () => {
    if (!showAddSession || selectedStudentIds.length === 0) return
    const sessionData = selectedStudentIds.map((sid) => ({
      studentId: sid,
      day: showAddSession.day,
      timeSlot: showAddSession.slot,
      note: sessionNote,
      weekOffset: weekOffset,
    }))
    await addSessions(sessionData)
    setShowAddSession(null)
    setSessionNote('')
    setSelectedStudentIds([])
  }

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    )
  }

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, studentId: string) => {
    e.dataTransfer.setData('studentId', studentId)
    setDraggedStudentId(studentId)
  }

  const handleDragEnd = () => {
    setDraggedStudentId(null)
  }

  const handleDrop = async (e: React.DragEvent, day: Day, slot: string) => {
    e.preventDefault()
    const studentId = e.dataTransfer.getData('studentId')
    if (!studentId) return

    const exists = currentWeekSessions.some(
      (s) => s.studentId === studentId && s.day === day && s.timeSlot === slot,
    )
    if (exists) return

    await addSessions([
      {
        studentId,
        day,
        timeSlot: slot,
        note: 'Geçen haftadan telafi (Sürükle-Bırak)',
        weekOffset: weekOffset,
      },
    ])
    setDraggedStudentId(null)
  }

  const handleAiAnalysis = async () => {
    setIsGeneratingReport(true)
    const report = await generateWeeklyReport(students, currentWeekSessions)
    setAiReport(report)
    setIsGeneratingReport(false)
  }

  const handleArchive = () => {
    const confirmMessage =
      'Mevcut programı arşive taşıyıp bir sonraki boş haftaya geçmek istediğinize emin misiniz?'
    if (!confirm(confirmMessage)) return

    setShowArchiveSummary({
      neglected: currentlyNeglected,
      total: currentWeekSessions.length,
    })

    archiveCurrentWeek(weekRangeLabel, currentlyNeglected, currentWeekSessions)
  }

  return (
    <div className="space-y-6">
      <Header
        weekRangeLabel={weekRangeLabel}
        handleAiAnalysis={handleAiAnalysis}
        isGeneratingReport={isGeneratingReport}
        sessionsLength={currentWeekSessions.length}
        archiveCurrentWeek={handleArchive}
      />

      {/* Week Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="p-2 hover:bg-gray-100 rounded-lg border text-gray-600 transition-all active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 text-center min-w-[160px]">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {weekOffset === 0
                ? 'Güncel Hafta'
                : `${weekOffset} Hafta ${weekOffset > 0 ? 'Sonra' : 'Önce'}`}
            </p>
            <p className="font-black text-gray-800 text-sm">{weekRangeLabel}</p>
          </div>
          <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="p-2 hover:bg-gray-100 rounded-lg border text-gray-600 transition-all active:scale-90"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="ml-2 text-[10px] font-black text-indigo-600 underline"
            >
              Güncel Haftaya Git
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-indigo-50 text-indigo-700 text-xs font-black px-4 py-2 rounded-xl border border-indigo-100">
            Bu Haftada {currentWeekSessions.length} Etüt
          </span>
        </div>
      </div>

      {/* Neglected From PREVIOUS Week Alert - Modern Collapsible Design */}
      {neglectedFromLastWeek.length > 0 &&
        students.length > 0 &&
        weekOffset >= 0 && (
          <div className="bg-gradient-to-br from-rose-50 via-rose-50/50 to-orange-50/30 border border-rose-200 rounded-2xl overflow-hidden shadow-lg shadow-rose-100/50 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Header - Always Visible */}
            <div
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-rose-100/30 transition-all"
              onClick={() => setIsNeglectedExpanded(!isNeglectedExpanded)}
            >
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-3 rounded-xl shrink-0 shadow-lg shadow-rose-300/50">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-rose-900 font-black text-base flex items-center gap-2">
                    Geçen Haftadan Unutulanlar
                    <span className="bg-rose-600 text-white text-xs px-2.5 py-1 rounded-full font-black shadow-sm">
                      {neglectedFromLastWeek.length}
                    </span>
                  </h4>
                  <p className="text-rose-600 text-xs font-medium mt-0.5">
                    {isNeglectedExpanded
                      ? 'Listeyi gizle'
                      : 'Listeyi görüntüle ve takvime sürükle'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-[10px] font-bold text-rose-500 bg-white px-3 py-1.5 rounded-full border border-rose-200">
                  Sürükle & Bırak
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-rose-600 transition-transform duration-300 ${isNeglectedExpanded ? 'rotate-180' : ''}`}
                />
              </div>
            </div>

            {/* Expandable Content */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isNeglectedExpanded
                  ? 'max-h-[600px] opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-5 pb-5 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
                  <input
                    type="text"
                    value={neglectedSearchQuery}
                    onChange={(e) => setNeglectedSearchQuery(e.target.value)}
                    placeholder="Öğrenci ara..."
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-rose-200 rounded-xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 focus:outline-none font-semibold text-sm text-gray-700 placeholder:text-rose-300 transition-all"
                  />
                  {neglectedSearchQuery && (
                    <button
                      onClick={() => setNeglectedSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-600 text-xs font-bold"
                    >
                      Temizle
                    </button>
                  )}
                </div>

                {/* Info Text */}
                <div className="flex items-start gap-2 bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-rose-100">
                  <GripVertical className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-rose-700 text-xs font-medium leading-relaxed">
                    Bu öğrencileri aşağıdaki takvimde istediğiniz gün ve saate
                    sürükleyerek etüt ekleyebilirsiniz.
                  </p>
                </div>

                {/* Students Grid */}
                <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredNeglectedStudents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredNeglectedStudents.map((s) => (
                        <div
                          key={s.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, s.id)}
                          onDragEnd={handleDragEnd}
                          className="group relative bg-white border-2 border-rose-200 rounded-xl p-3 shadow-sm hover:shadow-lg hover:scale-[1.02] hover:border-rose-400 transition-all cursor-grab active:cursor-grabbing active:scale-95"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm shadow-inner ${s.color || 'bg-rose-100 text-rose-600'} group-hover:scale-110 transition-transform`}
                            >
                              {s.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-sm text-gray-900 truncate">
                                {s.name}
                              </p>
                              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-tight">
                                {s.grade}
                              </p>
                            </div>
                            <GripVertical className="w-4 h-4 text-rose-300 group-hover:text-rose-500 transition-colors shrink-0" />
                          </div>

                          {/* Drag Indicator */}
                          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-rose-400 text-sm font-semibold">
                        {neglectedSearchQuery
                          ? `"${neglectedSearchQuery}" için sonuç bulunamadı`
                          : 'Öğrenci bulunamadı'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Stats */}
                {filteredNeglectedStudents.length > 0 && (
                  <div className="flex items-center justify-between pt-3 border-t border-rose-200">
                    <p className="text-xs font-semibold text-rose-600">
                      {neglectedSearchQuery
                        ? `${filteredNeglectedStudents.length} / ${neglectedFromLastWeek.length} öğrenci gösteriliyor`
                        : `Toplam ${neglectedFromLastWeek.length} öğrenci`}
                    </p>
                    <button
                      onClick={() => {
                        setIsNeglectedExpanded(false)
                        setNeglectedSearchQuery('')
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 underline transition-colors"
                    >
                      Kapat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Calendar Grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-r w-32">
                Saat / Gün
              </th>
              {programDays.map((day, idx) => (
                <th
                  key={day.id}
                  className="px-4 py-4 text-center border-r last:border-r-0"
                >
                  <span className="block text-indigo-600 font-black text-xs mb-1 uppercase tracking-wider">
                    {day.name}
                  </span>
                  <span className="text-[11px] text-gray-500 font-bold bg-white border border-gray-100 px-2 py-1 rounded-lg shadow-sm">
                    {formatDate(weekDates[idx])}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeSlots.map((slot) => (
              <tr
                key={slot.id}
                className="hover:bg-gray-50/30 transition-colors"
              >
                <td className="px-4 py-4 whitespace-nowrap text-[11px] font-black text-gray-400 border-r bg-gray-50/20">
                  {slot.label}
                </td>
                {programDays.map((day) => {
                  const cellSessions = currentWeekSessions.filter(
                    (s) => s.day === day.name && s.timeSlot === slot.label,
                  )
                  return (
                    <td
                      key={day.id}
                      className={`px-2 py-2 min-w-[180px] align-top border-r last:border-r-0 transition-all duration-200 ${draggedStudentId ? 'bg-indigo-50/20' : ''}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, day.name as Day, slot.label)}
                    >
                      <div className="space-y-2">
                        {cellSessions.map((sess) => {
                          const student = students.find(
                            (s) => s.id === sess.studentId,
                          )
                          return (
                            <div
                              key={sess.id}
                              className={`group flex flex-col p-3 rounded-2xl border text-xs font-medium shadow-sm transition-all hover:scale-[1.03] hover:shadow-md ${student?.color || 'bg-gray-100 border-gray-200'}`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="truncate font-black text-gray-900">
                                  {student?.name || 'Bilinmiyor'}
                                </span>
                                <button
                                  onClick={() => removeSession(sess.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/50 rounded-full transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </button>
                              </div>
                              {sess.note && (
                                <div className="flex items-start space-x-1.5 text-[10px] opacity-70 border-t border-black/5 pt-2 mt-1">
                                  <BookOpen className="w-3 h-3 shrink-0" />
                                  <span className="italic line-clamp-3">
                                    {sess.note}
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        })}
                        <button
                          onClick={() => {
                            setSessionNote('')
                            setSelectedStudentIds([])
                            setShowAddSession({
                              day: day.name as Day,
                              slot: slot.label,
                            })
                          }}
                          className={`w-full py-3 border-2 border-dashed rounded-2xl transition-all flex justify-center items-center group ${draggedStudentId ? 'border-indigo-400 bg-indigo-50/50 scale-105 shadow-inner animate-pulse' : 'border-gray-100 text-gray-300 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30'}`}
                        >
                          {draggedStudentId ? (
                            <div className="text-[10px] font-black text-indigo-500">
                              BURAYA BIRAK
                            </div>
                          ) : (
                            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                          )}
                        </button>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAddSession && (
        <Modal
          title={`${showAddSession.day} - Program Girişi`}
          onClose={() => setShowAddSession(null)}
        >
          <div className="space-y-6">
            <div className="relative group">
              <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={sessionNote}
                onChange={(e) => setSessionNote(e.target.value)}
                placeholder="Konu, ödev veya hatırlatma..."
                className="w-full pl-14 pr-5 py-4 border-2 border-gray-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none font-bold text-sm transition-all"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
              {students.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id)
                const count = allSessions.filter(
                  (s) =>
                    s.studentId === student.id && s.weekOffset === weekOffset,
                ).length
                return (
                  <button
                    key={student.id}
                    onClick={() => toggleStudentSelection(student.id)}
                    className={`flex items-center space-x-4 p-4 border-2 rounded-[1.25rem] transition-all text-left group ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 shadow-lg translate-x-1'
                        : 'bg-white border-gray-100 hover:border-indigo-200'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-inner transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white rotate-6'
                          : student.color
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        student.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p
                        className={`font-black text-sm truncate ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}
                      >
                        {student.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                        {student.grade}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-indigo-200 text-indigo-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {count} ETÜT
                    </div>
                  </button>
                )
              })}
            </div>
            <button
              onClick={addSelectedSessions}
              disabled={selectedStudentIds.length === 0}
              className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-30 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center space-x-3"
            >
              <Plus className="w-6 h-6" />
              <span>
                {selectedStudentIds.length > 0
                  ? `${selectedStudentIds.length} Öğrenciyi Ekle`
                  : 'Öğrenci Seçin'}
              </span>
            </button>
          </div>
        </Modal>
      )}

      {aiReport && (
        <Modal
          title={typeof aiReport === 'string' ? 'Hata' : 'Zeki Analiz Raporu'}
          onClose={() => setAiReport(null)}
        >
          {typeof aiReport === 'string' ? (
            <div className="bg-rose-50 p-8 rounded-[2rem] border border-rose-100 text-rose-900 font-medium">
              {aiReport}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Özet Kartı */}
              <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                <Sparkles className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12" />
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      {aiReport.mood === 'happy' && (
                        <Smile className="w-5 h-5" />
                      )}
                      {aiReport.mood === 'productive' && (
                        <Zap className="w-5 h-5" />
                      )}
                      {aiReport.mood === 'busy' && (
                        <Activity className="w-5 h-5" />
                      )}
                      {aiReport.mood === 'neutral' && (
                        <Meh className="w-5 h-5" />
                      )}
                    </span>
                    <h3 className="font-black uppercase tracking-widest text-xs opacity-80">
                      Haftalık Özet
                    </h3>
                  </div>
                  <p className="text-xl font-bold leading-relaxed">
                    {aiReport.summary}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Öğrenci Odağı */}
                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                  <div className="flex items-center space-x-3 mb-4 text-emerald-700">
                    <TrendingUp className="w-5 h-5" />
                    <h4 className="font-black uppercase tracking-wider text-xs">
                      Öğrenci Odağı
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {aiReport.focusStudents.map((item, i) => (
                      <div
                        key={i}
                        className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm"
                      >
                        <p className="font-black text-emerald-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-emerald-700 mt-1 font-medium">
                          {item.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Yoğun Günler */}
                <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
                  <div className="flex items-center space-x-3 mb-4 text-amber-700">
                    <Sun className="w-5 h-5" />
                    <h4 className="font-black uppercase tracking-wider text-xs">
                      Yoğun Günler
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {aiReport.busyDays.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-amber-100 shadow-sm"
                      >
                        <span className="font-bold text-amber-900 text-sm">
                          {item.day}
                        </span>
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black">
                          {item.count} ETÜT
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pedagojik Tavsiye */}
              <div className="bg-white p-6 rounded-[2rem] border-2 border-dashed border-indigo-100">
                <div className="flex items-center space-x-3 mb-3 text-indigo-600">
                  <BookOpen className="w-5 h-5" />
                  <h4 className="font-black uppercase tracking-wider text-xs">
                    Eğitimci Tavsiyesi
                  </h4>
                </div>
                <p className="text-sm font-medium text-gray-600 leading-relaxed italic">
                  &quot;{aiReport.pedagogicalAdvice}&quot;
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setAiReport(null)}
            className="w-full mt-8 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            Anladım
          </button>
        </Modal>
      )}

      {showArchiveSummary && (
        <Modal
          title="Yeni Haftaya Hazırlık"
          onClose={() => setShowArchiveSummary(null)}
        >
          <div className="flex flex-col space-y-8">
            <div className="flex items-center space-x-5 text-emerald-600 bg-emerald-50 p-6 rounded-[2rem] border-2 border-emerald-100">
              <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-xl shadow-emerald-100">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <p className="font-black text-xl">Hafta Kapatıldı!</p>
                <p className="text-sm font-bold opacity-80 uppercase tracking-tighter">
                  Bir sonraki döneme geçiş yapıldı.
                </p>
              </div>
            </div>

            {showArchiveSummary.neglected.length > 0 && (
              <div className="space-y-4 bg-rose-50/50 p-6 rounded-[2rem] border-2 border-rose-100">
                <div className="flex items-center space-x-3 text-rose-600">
                  <AlertCircle className="w-6 h-6" />
                  <h4 className="font-black uppercase tracking-wider text-sm">
                    Takviye Bekleyenler ({showArchiveSummary.neglected.length})
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-3 custom-scrollbar">
                  {showArchiveSummary.neglected.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center space-x-3 p-3 bg-white rounded-2xl border border-rose-100 text-xs font-black text-gray-700 truncate shadow-sm"
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs text-white font-black bg-rose-500`}
                      >
                        {s.name.charAt(0)}
                      </div>
                      <span className="truncate">{s.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-rose-400 font-bold italic text-center">
                  Bu öğrencilerin mağdur olmaması için yeni haftada ilk onlara
                  etüt yazmayı unutmayın.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowArchiveSummary(null)}
              className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Yolumuza Devam Edelim
            </button>
          </div>
        </Modal>
      )}

      {isGeneratingReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[60] flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] flex flex-col items-center max-w-sm w-full animate-in zoom-in duration-500">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-[12px] border-indigo-50 rounded-full"></div>
              <div className="absolute inset-0 border-[12px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="font-black text-gray-800 text-2xl tracking-tight">
              AI Analiz Ediyor
            </p>
            <p className="text-sm text-gray-400 font-bold mt-3 text-center leading-relaxed uppercase tracking-widest px-4 opacity-60">
              Etüt verileriniz işleniyor...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
