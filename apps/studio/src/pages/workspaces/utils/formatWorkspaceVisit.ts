export function formatWorkspaceVisit(time: number, locale: string) {
  const minutes = Math.min(0, Math.round((time - Date.now()) / 60000))
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (minutes > -60) return formatter.format(minutes, 'minute')
  if (minutes > -1440) return formatter.format(Math.round(minutes / 60), 'hour')
  return formatter.format(Math.round(minutes / 1440), 'day')
}
