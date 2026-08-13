import type { ColumnId } from '#/lib/types'

const DISTANCE_OFFSET = 50

export function getIndicators(columnId: ColumnId) {
  return [...document.querySelectorAll<HTMLElement>(`[data-column="${columnId}"]`)]
}

export function clearHighlights(columnId?: ColumnId) {
  const indicators = columnId
    ? getIndicators(columnId)
    : [...document.querySelectorAll<HTMLElement>('[data-before]')]

  for (const indicator of indicators) {
    indicator.style.opacity = '0'
  }
}

function nearestIndicator(clientY: number, indicators: Array<HTMLElement>) {
  const last = indicators.at(-1)
  if (!last) return null

  return indicators.reduce(
    (closest, indicator) => {
      const box = indicator.getBoundingClientRect()
      const offset = clientY - (box.top + DISTANCE_OFFSET)
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: indicator }
      }
      return closest
    },
    { offset: Number.NEGATIVE_INFINITY, element: last },
  )
}

export function highlightIndicator(clientY: number, columnId: ColumnId) {
  const indicators = getIndicators(columnId)
  clearHighlights(columnId)
  const match = nearestIndicator(clientY, indicators)
  if (!match) return null
  match.element.style.opacity = '1'
  return match.element
}
