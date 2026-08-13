import { describe, expect, it } from 'vitest'

import { COLUMN_IDS, COLUMNS } from '#/lib/columns'
import { cn } from '#/lib/utils'

describe('columns', () => {
  it('exposes the three board columns in order', () => {
    expect(COLUMN_IDS).toEqual(['todo', 'doing', 'done'])
    expect(COLUMNS.map((column) => column.id)).toEqual([...COLUMN_IDS])
    expect(COLUMNS.map((column) => column.title)).toEqual(['To Do', 'Doing', 'Done'])
  })
})

describe('cn', () => {
  it('merges class names and resolves Tailwind conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})
