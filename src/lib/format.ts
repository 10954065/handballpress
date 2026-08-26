const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatDate(date: Date | string | null | undefined): string | null {
  if (!date) return null
  return dateFormatter.format(new Date(date))
}

export function formatMonthYear(year: number, month: number): string {
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(year, month - 1, 1))
  )
}
