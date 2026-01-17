export const getDayOfYear = (date = new Date()) => {
  const startOfYear = new Date(date.getFullYear(), 0, 0)
  const diff = date - startOfYear
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export const getDailyReminder = (reminders, date = new Date()) => {
  if (!reminders || reminders.length === 0) return ''
  const dayOfYear = getDayOfYear(date)
  return reminders[(dayOfYear - 1) % reminders.length]
}
