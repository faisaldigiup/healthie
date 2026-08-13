import type { ColumnId } from '#/lib/types'

export const COLUMN_IDS = ['todo', 'doing', 'done'] as const satisfies ReadonlyArray<ColumnId>

export const COLUMNS = [
  {
    id: 'todo',
    title: 'To Do',
    hint: 'Ready when you are',
  },
  {
    id: 'doing',
    title: 'Doing',
    hint: 'In motion',
  },
  {
    id: 'done',
    title: 'Done',
    hint: 'Set down',
  },
] as const satisfies ReadonlyArray<{
  id: ColumnId
  title: string
  hint: string
}>
