import React from 'react'
import { BrainCircuit, RotateCcw } from 'lucide-react'

interface HeaderProps {
  weekRangeLabel: string
  handleAiAnalysis: () => void
  isGeneratingReport: boolean
  sessionsLength: number
  archiveCurrentWeek: () => void
}

export const Header: React.FC<HeaderProps> = ({
  weekRangeLabel,
  handleAiAnalysis,
  isGeneratingReport,
  sessionsLength,
  archiveCurrentWeek,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-indigo-100 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      <div>
        <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest">
          Çalışma Planı
        </h2>
        <p className="text-2xl font-black text-gray-900 leading-tight">
          {weekRangeLabel}
        </p>
      </div>

      <div className="flex items-center space-x-3 w-full md:w-auto">
        <button
          onClick={handleAiAnalysis}
          disabled={isGeneratingReport || sessionsLength === 0}
          className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-100 transition-all disabled:opacity-50 active:scale-95 border border-indigo-100 shadow-sm"
        >
          <BrainCircuit className="w-5 h-5" />
          <span>Haftalık Analiz</span>
        </button>
        <button
          onClick={archiveCurrentWeek}
          className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Yeni Hafta</span>
        </button>
      </div>
    </div>
  )
}
