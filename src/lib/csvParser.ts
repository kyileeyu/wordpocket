export interface CsvRow {
  word: string
  meaning: string
  example?: string
  pronunciation?: string
  synonyms?: string
  tags?: string
  deck?: string
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ",") {
        result.push(current)
        current = ""
      } else {
        current += char
      }
    }
  }
  result.push(current)
  return result
}

function splitCsvLines(text: string): string[] {
  const lines: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        current += '""'
        i++
      } else if (char === '"') {
        inQuotes = false
        current += char
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
        current += char
      } else if (char === "\n") {
        lines.push(current)
        current = ""
      } else if (char === "\r") {
        // skip \r, handle \r\n
        if (text[i + 1] === "\n") i++
        lines.push(current)
        current = ""
      } else {
        current += char
      }
    }
  }
  if (current) lines.push(current)
  return lines
}

export function parseCsv(text: string): CsvRow[] {
  const lines = splitCsvLines(text.trim())
  if (lines.length < 2) return []

  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCsvLine(line)
      const row: Record<string, string> = {}
      header.forEach((h, idx) => {
        row[h] = values[idx]?.trim() ?? ""
      })
      return {
        word: row.word ?? "",
        meaning: row.meaning ?? "",
        example: row.example || undefined,
        pronunciation: row.pronunciation || undefined,
        synonyms: row.synonyms || undefined,
        tags: row.tags || undefined,
        deck: row.deck || undefined,
      }
    })
    .filter((r) => r.word && r.meaning)
}
