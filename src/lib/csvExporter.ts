const CSV_HEADERS = ["word", "meaning", "example", "pronunciation", "synonyms", "tags"] as const
const CSV_HEADERS_WITH_DECK = ["deck", ...CSV_HEADERS] as const

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export interface ExportableCard {
  word: string
  meaning: string
  example?: string | null
  pronunciation?: string | null
  synonyms?: string[] | null
  tags?: string[] | null
  deckName?: string
}

export function generateCsv(cards: ExportableCard[], includeDeck = false): string {
  const headers = includeDeck ? CSV_HEADERS_WITH_DECK : CSV_HEADERS
  const lines = [headers.join(",")]

  for (const card of cards) {
    const row = [
      ...(includeDeck ? [escapeCsvField(card.deckName ?? "")] : []),
      escapeCsvField(card.word),
      escapeCsvField(card.meaning),
      escapeCsvField(card.example ?? ""),
      escapeCsvField(card.pronunciation ?? ""),
      escapeCsvField((card.synonyms ?? []).join(";")),
      escapeCsvField((card.tags ?? []).join(";")),
    ]
    lines.push(row.join(","))
  }

  return lines.join("\n")
}

export function downloadCsv(cards: ExportableCard[], deckName: string, includeDeck = false): void {
  const csv = generateCsv(cards, includeDeck)
  const bom = "\uFEFF"
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const date = new Date()
  const yyyymmdd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`
  const filename = `${deckName}_${yyyymmdd}.csv`

  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
