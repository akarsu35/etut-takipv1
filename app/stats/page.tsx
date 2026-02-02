'use client'

import React, { useMemo } from 'react'
import { BarChart3, Users, Calendar, History, Trash2 } from 'lucide-react'
import { useEtut } from '@/context/EtutContext'

export default function StatsPage() {
  const {
    students,
    allSessions,
    archivedWeeks,
    weekOffset,
    deleteArchivedWeek,
  } = useEtut()

  const currentWeekSessions = useMemo(() => {
    return allSessions.filter((s) => s.weekOffset === weekOffset)
  }, [allSessions, weekOffset])

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border shadow-sm relative overflow-hidden group">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
            Bu Haftanın Toplamı
          </p>
          <h3 className="text-6xl font-black text-indigo-600 mt-3">
            {currentWeekSessions.length}
          </h3>
          <div className="mt-4 flex items-center text-indigo-500 font-bold text-xs bg-indigo-50 w-fit px-3 py-1 rounded-lg">
            <Calendar className="w-3.5 h-3.5 mr-2" /> Haftalık Etüt
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border shadow-sm relative overflow-hidden group">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
            Öğrenci Sayısı
          </p>
          <h3 className="text-6xl font-black text-emerald-600 mt-3">
            {students.length}
          </h3>
          <div className="mt-4 flex items-center text-emerald-500 font-bold text-xs bg-emerald-50 w-fit px-3 py-1 rounded-lg">
            <Users className="w-3.5 h-3.5 mr-2" /> Aktif Portföy
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border shadow-sm relative overflow-hidden group">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
            Günlük Verim
          </p>
          <h3 className="text-6xl font-black text-orange-600 mt-3">
            {(currentWeekSessions.length / 5).toFixed(1)}
          </h3>
          <div className="mt-4 flex items-center text-orange-500 font-bold text-xs bg-orange-50 w-fit px-3 py-1 rounded-lg">
            <BarChart3 className="w-3.5 h-3.5 mr-2" /> Ortalama Seans
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm">
        <h3 className="font-black text-gray-800 mb-8 flex items-center text-xl">
          <History className="w-7 h-7 mr-4 text-indigo-600" /> Arşivlenmiş
          Haftalar
        </h3>
        <div className="divide-y space-y-6 max-h-[600px] overflow-y-auto pr-6 custom-scrollbar">
          {archivedWeeks.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-4 border-dashed border-gray-100">
              <p className="text-gray-400 font-black italic opacity-50 uppercase tracking-widest">
                Henüz Arşiv Verisi Yok
              </p>
            </div>
          ) : (
            archivedWeeks.map((week) => (
              <div
                key={week.id}
                className="py-6 flex justify-between items-center group"
              >
                <div className="flex items-center space-x-6">
                  <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all group-hover:scale-110">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-gray-800 text-xl">
                      {week.weekRange} Dönemi
                    </p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                      {week.sessions.length} Etüt Başarıyla Kapatıldı
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-3">
                    {week.sessions.slice(0, 5).map((s, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 rounded-[1rem] border-4 border-white bg-indigo-100 flex items-center justify-center text-xs text-indigo-700 font-black shrink-0 shadow-md"
                      >
                        {students
                          .find((st) => st.id === s.studentId)
                          ?.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => deleteArchivedWeek(week.id)}
                    className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
