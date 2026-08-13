import { afterEach, describe, expect, it } from 'vitest'

import { clearHighlights, getIndicators, highlightIndicator } from '#/lib/drop'

function makeIndicator(columnId: string, before: string, top: number) {
  const element = document.createElement('div')
  element.dataset.column = columnId
  element.dataset.before = before
  element.style.opacity = '0'
  element.getBoundingClientRect = () =>
    ({
      x: 0,
      y: top,
      top,
      bottom: top + 2,
      left: 0,
      right: 100,
      width: 100,
      height: 2,
      toJSON: () => ({}),
    }) as DOMRect
  document.body.appendChild(element)
  return element
}

describe('drop indicators', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('finds indicators for a column', () => {
    makeIndicator('todo', 'a', 10)
    makeIndicator('doing', 'b', 10)
    expect(getIndicators('todo')).toHaveLength(1)
    expect(getIndicators('done')).toHaveLength(0)
  })

  it('clears highlighted indicators', () => {
    const indicator = makeIndicator('todo', 'a', 10)
    indicator.style.opacity = '1'
    clearHighlights('todo')
    expect(indicator.style.opacity).toBe('0')
  })

  it('highlights the nearest indicator above the pointer', () => {
    const first = makeIndicator('todo', 'a', 100)
    const second = makeIndicator('todo', 'b', 200)
    const last = makeIndicator('todo', '-1', 300)

    const match = highlightIndicator(140, 'todo')

    expect(match).toBe(first)
    expect(first.style.opacity).toBe('1')
    expect(second.style.opacity).toBe('0')
    expect(last.style.opacity).toBe('0')
  })

  it('falls back to the last indicator when none are above the pointer', () => {
    makeIndicator('todo', 'a', 100)
    const last = makeIndicator('todo', '-1', 300)

    expect(highlightIndicator(400, 'todo')).toBe(last)
    expect(last.style.opacity).toBe('1')
  })
})
