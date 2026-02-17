export const getMonday = (date: Date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export const getAbsoluteWeek = (date: Date) => {
  // Create a UTC-based date to avoid timezone offset issues
  // We want the "Absolute Week" to be independent of the user's local time
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)

  // Get UTC day (0 = Sunday, 1 = Monday)
  const day = d.getUTCDay()
  // Adjust to Monday-based week (Mon=0, ..., Sun=6)
  const diffToMonday = d.getUTCDate() - day + (day === 0 ? -6 : 1)
  d.setUTCDate(diffToMonday)

  // Standard UTC Epoch: Dec 29, 1969 is the first Monday (shifted to align data)
  const EPOCH = new Date('1969-12-29T00:00:00.000Z').getTime()
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

  const diff = d.getTime() - EPOCH
  return Math.round(diff / ONE_WEEK_MS)
}

export const getCurrentAbsoluteWeek = () => {
  return getAbsoluteWeek(new Date())
}
