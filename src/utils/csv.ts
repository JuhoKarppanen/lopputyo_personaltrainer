export function exportToCSV(data: any[], filename: string, columns: string[]) {
 
  const header = columns.join(',')


  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col] ?? ''
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"` 
        }
        return stringValue
      })
      .join(','),
  )

  const csv = [header, ...rows].join('\n')


  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
