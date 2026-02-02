import { GoogleGenerativeAI } from '@google/generative-ai'
import { Student, Session, AiReport } from '../types'

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
)
const model = genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
  generationConfig: { responseMimeType: 'application/json' },
})

export async function generateWeeklyReport(
  students: Student[],
  sessions: Session[],
): Promise<AiReport | string> {
  const studentMap = students.reduce(
    (acc, s) => ({ ...acc, [s.id]: s.name }),
    {} as Record<string, string>,
  )

  const sessionSummary = sessions.map((s) => ({
    student: studentMap[s.studentId],
    day: s.day,
    time: s.timeSlot,
  }))

  const prompt = `
    Aşağıdaki haftalık etüt verilerini analiz et ve bir JSON objesi döndür.
    
    Veriler: ${JSON.stringify(sessionSummary)}
    
    JSON formatı şu şekilde olmalı:
    {
      "summary": "Öğretmen için kısa, motive edici bir özet",
      "focusStudents": [{"name": "Öğrenci Adı", "reason": "Neden bu öğrenciye odaklanılmalı?"}],
      "busyDays": [{"day": "Pazartesi", "count": 5}],
      "pedagogicalAdvice": "Pedagojik bir tavsiye",
      "mood": "happy" | "neutral" | "busy" | "productive"
    }
    
    Dil: Türkçe.
  `

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    return JSON.parse(text) as AiReport
  } catch (error) {
    console.error('AI Raporu oluşturulamadı:', error)
    return 'Şu an rapor oluşturulamıyor, lütfen verileri kontrol edin.'
  }
}
