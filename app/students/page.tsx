'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  Users,
  Plus,
  Trash2,
  FileSpreadsheet,
  Search,
  Pencil,
  Save,
  X,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'react-hot-toast'
import { STUDENT_COLORS, DAYS_OF_WEEK } from '../../constants'
import { Modal } from '@/components/Modal'
import { useEtut } from '@/context/EtutContext'
import { Session } from '../../types'
import {
  Calendar,
  Clock,
  BookOpen,
  ChevronRight,
  UserCheck,
  UserX,
  Minus,
} from 'lucide-react'

// --- Helpers ---
const getMonday = (date: Date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function StudentsPage() {
  const {
    students,
    deleteStudent,
    updateStudent,
    allSessions,
    removeSession,

    addStudent: addStudentToDb,
    addManyStudents,
  } = useEtut()
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentGrade, setNewStudentGrade] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editGrade, setEditGrade] = useState('')

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId)
  }, [students, selectedStudentId])

  // Initialize edit fields when student is selected
  useEffect(() => {
    if (selectedStudent) {
      setEditName(selectedStudent.name)
      setEditGrade(selectedStudent.grade || '')
      setIsEditing(false)
    }
  }, [selectedStudent])

  const studentSessionsInProgress = useMemo(() => {
    if (!selectedStudentId) return []
    return allSessions
      .filter((s) => s.studentId === selectedStudentId)
      .sort((a, b) => b.weekOffset - a.weekOffset || b.createdAt - a.createdAt)
  }, [allSessions, selectedStudentId])

  const getSessionDate = (session: Session) => {
    const monday = new Date()
    monday.setDate(monday.getDate() + session.weekOffset * 7)

    const currentMonday = getMonday(monday)
    const dayIndex = DAYS_OF_WEEK.indexOf(session.day)

    const sessionDate = new Date(currentMonday)
    sessionDate.setDate(sessionDate.getDate() + dayIndex)

    return formatDate(sessionDate)
  }

  const studentStats = useMemo(() => {
    const stats: Record<string, number> = {}
    // Calculate TOTAL sessions for each student, not just current week
    allSessions.forEach((s) => {
      stats[s.studentId] = (stats[s.studentId] || 0) + 1
    })
    return stats
  }, [allSessions])

  // Attendance rate calculation per student
  const attendanceStats = useMemo(() => {
    const stats: Record<
      string,
      { total: number; attended: number; absent: number }
    > = {}
    allSessions.forEach((s) => {
      if (!stats[s.studentId]) {
        stats[s.studentId] = { total: 0, attended: 0, absent: 0 }
      }
      stats[s.studentId].total++
      if (s.attended === true) stats[s.studentId].attended++
      if (s.attended === false) stats[s.studentId].absent++
    })
    return stats
  }, [allSessions])

  const getAttendanceRate = (studentId: string) => {
    const stat = attendanceStats[studentId]
    if (!stat || stat.total === 0) return null
    const decidedSessions = stat.attended + stat.absent
    if (decidedSessions === 0) return null
    return Math.round((stat.attended / decidedSessions) * 100)
  }

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students
    const query = searchQuery.toLowerCase()
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.grade.toLowerCase().includes(query),
    )
  }, [students, searchQuery])

  const addStudent = async () => {
    if (!newStudentName) return
    await addStudentToDb(newStudentName, newStudentGrade)
    setNewStudentName('')
    setNewStudentGrade('')
    setShowAddStudent(false)
  }

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname], {
          header: 1,
        }) as (string | number)[][]
        const importedStudentsData = data
          .slice(1)
          .filter((row) => row[0])
          .map((row, index) => ({
            name: String(row[0]),
            grade: row[1] ? String(row[1]) : 'Belirtilmedi',
            color:
              STUDENT_COLORS[(students.length + index) % STUDENT_COLORS.length],
          }))

        // ...x

        if (importedStudentsData.length > 0) {
          addManyStudents(importedStudentsData)
        }
      } catch (err) {
        console.error('Dosya okuma hatası:', err)
        toast.error('Dosya okunurken bir hata oluştu.')
      }
    }
    reader.readAsBinaryString(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleExcelImport}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-black text-gray-800 flex items-center">
          <Users className="w-8 h-8 mr-3 text-indigo-600" /> Öğrenci Portföyü
        </h2>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none bg-emerald-50 text-emerald-700 border-2 border-emerald-100 px-5 py-3 rounded-2xl flex items-center justify-center space-x-2 hover:bg-emerald-100 transition-all font-black text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel&apos;den Aktar</span>
          </button>
          <button
            onClick={() => setShowAddStudent(true)}
            className="flex-1 sm:flex-none bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 font-black text-sm active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Yeni Öğrenci</span>
          </button>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Öğrenci adı veya sınıfı ile ara..."
          className="w-full pl-14 pr-6 py-5 bg-white border-2 border-transparent rounded-[1.5rem] shadow-sm focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 focus:outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {students.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white rounded-[2rem] border-4 border-dashed border-gray-100 flex flex-col items-center">
            <div className="bg-indigo-50 p-8 rounded-full mb-6">
              <Users className="w-16 h-16 text-indigo-300" />
            </div>
            <h3 className="text-xl font-black text-gray-800">
              Öğrenci Listeniz Boş
            </h3>
            <p className="text-gray-400 font-medium mt-2">
              Hemen sağ üstteki butondan ilk öğrencinizi ekleyin.
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-black text-gray-800">
              Sonuç Bulunamadı
            </h3>
            <p className="text-gray-400 font-medium mt-1">
              &quot;{searchQuery}&quot; kriterine uygun öğrenci bulunamadı.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-indigo-600 font-black text-sm hover:underline"
            >
              Aramayı Temizle
            </button>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className="bg-white rounded-[1.5rem] border border-gray-100 p-6 shadow-sm hover:shadow-2xl transition-all relative group overflow-hidden hover:-translate-y-1 cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteStudent(student.id)
                  }}
                  className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center space-x-5">
                <div
                  className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center font-black text-2xl shrink-0 shadow-inner group-hover:rotate-3 transition-transform ${student.color}`}
                >
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-900 truncate text-xl leading-tight">
                    {student.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-lg uppercase tracking-widest">
                      {student.grade}
                    </span>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                      {studentStats[student.id] || 0} Etüt
                    </span>
                  </div>
                  {/* Attendance Stats - Separate Row */}
                  {attendanceStats[student.id] &&
                    (attendanceStats[student.id].attended > 0 ||
                      attendanceStats[student.id].absent > 0) && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          {attendanceStats[student.id].attended} Katıldı
                        </span>
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                          <UserX className="w-3 h-3" />
                          {attendanceStats[student.id].absent} Gelmedi
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedStudent && (
        <Modal
          title="Öğrenci Detayları"
          onClose={() => setSelectedStudentId(null)}
          footer={
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      if (selectedStudent && editName.trim()) {
                        updateStudent(selectedStudent.id, editName, editGrade)
                        setIsEditing(false)
                      }
                    }}
                    className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Kaydet
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      if (selectedStudent) {
                        setEditName(selectedStudent.name)
                        setEditGrade(selectedStudent.grade || '')
                      }
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    İptal
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-amber-50 text-amber-700 border-2 border-amber-100 py-4 rounded-2xl font-black text-lg hover:bg-amber-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Pencil className="w-5 h-5" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => {
                      if (selectedStudent) {
                        deleteStudent(selectedStudent.id)
                        setSelectedStudentId(null)
                      }
                    }}
                    className="flex-1 bg-rose-50 text-rose-600 border-2 border-rose-100 py-4 rounded-2xl font-black text-lg hover:bg-rose-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Sil
                  </button>
                  <button
                    onClick={() => setSelectedStudentId(null)}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                  >
                    Kapat
                  </button>
                </>
              )}
            </div>
          }
        >
          <div className="space-y-8">
            <div className="flex items-center space-x-6 bg-indigo-50/50 p-6 rounded-[2.5rem] border border-indigo-100">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center font-black text-3xl shadow-xl ${selectedStudent.color}`}
              >
                {(isEditing ? editName : selectedStudent.name)
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Öğrenci adı"
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-bold text-lg"
                    />
                    <input
                      type="text"
                      value={editGrade}
                      onChange={(e) => setEditGrade(e.target.value)}
                      placeholder="Sınıf bilgisi"
                      className="w-full px-4 py-2 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-semibold text-sm"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-black text-gray-900">
                      {selectedStudent.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-3 py-1 bg-white border border-indigo-100 rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                        {selectedStudent.grade}
                      </span>
                      <span className="px-3 py-1 bg-indigo-600 rounded-lg text-[10px] font-black text-white uppercase tracking-widest">
                        Toplam {studentSessionsInProgress.length} Etüt
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Attendance Summary */}
            {attendanceStats[selectedStudent.id] &&
              (attendanceStats[selectedStudent.id].attended > 0 ||
                attendanceStats[selectedStudent.id].absent > 0) && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-2xl font-black text-emerald-700">
                        {attendanceStats[selectedStudent.id].attended}
                      </p>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                        Katıldı
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 rounded-xl border border-rose-100">
                    <UserX className="w-5 h-5 text-rose-600" />
                    <div>
                      <p className="text-2xl font-black text-rose-700">
                        {attendanceStats[selectedStudent.id].absent}
                      </p>
                      <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">
                        Gelmedi
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 rounded-xl border border-gray-200">
                    <Minus className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-2xl font-black text-gray-700">
                        {attendanceStats[selectedStudent.id].total -
                          attendanceStats[selectedStudent.id].attended -
                          attendanceStats[selectedStudent.id].absent}
                      </p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Belirsiz
                      </p>
                    </div>
                  </div>
                </div>
              )}

            <div className="space-y-4">
              <h4 className="flex items-center text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                <Calendar className="w-4 h-4 mr-2 text-indigo-400" /> Etüt
                Geçmişi
              </h4>

              {studentSessionsInProgress.length === 0 ? (
                <div className="p-12 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold">
                    Henüz etüt kaydı bulunmuyor.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {studentSessionsInProgress.map((session) => (
                    <div
                      key={session.id}
                      className="group flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all relative"
                    >
                      {/* Delete Button - Shows on Hover */}
                      <button
                        onClick={() => removeSession(session.id)}
                        className="absolute top-3 right-3 p-1.5 bg-rose-50 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all"
                        title="Etüdü Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-gray-900">
                            {getSessionDate(session)}
                          </p>
                          <p className="text-xs font-bold text-gray-400 flex items-center mt-1">
                            <span className="text-indigo-600 mr-2">
                              {session.day}
                            </span>
                            {session.timeSlot}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* Attendance Status */}
                        <div
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 ${
                            session.attended === true
                              ? 'bg-emerald-100 text-emerald-700'
                              : session.attended === false
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {session.attended === true && (
                            <>
                              <UserCheck className="w-3 h-3" /> Katıldı
                            </>
                          )}
                          {session.attended === false && (
                            <>
                              <UserX className="w-3 h-3" /> Gelmedi
                            </>
                          )}
                          {session.attended == null && (
                            <>
                              <Minus className="w-3 h-3" /> Belirsiz
                            </>
                          )}
                        </div>
                        {session.note && (
                          <div
                            title={session.note}
                            className="p-2 text-gray-300 hover:text-indigo-400 cursor-help transition-colors"
                          >
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {showAddStudent && (
        <Modal
          title="Öğrenci Kayıt Formu"
          onClose={() => setShowAddStudent(false)}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                Tam Ad Soyad
              </label>
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Örn: Mert Karakuş"
                className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                Sınıf Bilgisi
              </label>
              <input
                type="text"
                value={newStudentGrade}
                onChange={(e) => setNewStudentGrade(e.target.value)}
                placeholder="Örn: 12-B LGS"
                className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all font-bold"
              />
            </div>
            <button
              onClick={addStudent}
              className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              Öğrenciyi Kaydet
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
