export function buildHeatmapCells(
  heatmapData: { date: string; review_count: number }[] | undefined,
): (0 | 1 | 2 | 3)[] {
  const today = new Date()
  const cells: (0 | 1 | 2 | 3)[] = []

  const countByDate = new Map<string, number>()
  heatmapData?.forEach((d) => countByDate.set(d.date, d.review_count))

  for (let i = 20; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const key = date.toISOString().slice(0, 10)
    const count = countByDate.get(key) ?? 0
    let level: 0 | 1 | 2 | 3
    if (count === 0) level = 0
    else if (count <= 3) level = 1
    else if (count <= 9) level = 2
    else level = 3
    cells.push(level)
  }

  return cells
}
