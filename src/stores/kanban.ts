import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { COLUMN_IDS } from '#/lib/columns'
import type { ColumnId, KanbanItem } from '#/lib/types'

type KanbanData = {
  items: Record<string, KanbanItem>
  columns: Record<ColumnId, Array<string>>
}

type KanbanActions = {
  addItem: (item: KanbanItem) => void
  removeItem: (itemId: string) => void
  moveItem: (itemId: string, to: ColumnId, beforeId: string | null) => void
}

export type KanbanState = KanbanData & KanbanActions

const emptyColumns: Record<ColumnId, Array<string>> = {
  todo: [],
  doing: [],
  done: [],
}

function columnOf(
  columns: Record<ColumnId, Array<string>>,
  itemId: string,
): ColumnId | null {
  return COLUMN_IDS.find((columnId) => columns[columnId].includes(itemId)) ?? null
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      items: {},
      columns: emptyColumns,
      addItem: (item) => {
        set((state) => ({
          items: { ...state.items, [item.id]: item },
          columns: {
            ...state.columns,
            todo: [item.id, ...state.columns.todo],
          },
        }))
      },
      removeItem: (itemId) => {
        set((state) => {
          const items = { ...state.items }
          delete items[itemId]
          return {
            items,
            columns: {
              todo: state.columns.todo.filter((id) => id !== itemId),
              doing: state.columns.doing.filter((id) => id !== itemId),
              done: state.columns.done.filter((id) => id !== itemId),
            },
          }
        })
      },
      moveItem: (itemId, to, beforeId) => {
        const { columns } = get()
        const from = columnOf(columns, itemId)
        if (!from) return
        if (
          from === to &&
          (beforeId === itemId || (beforeId === null && columns[to].at(-1) === itemId))
        ) {
          return
        }

        const fromIds = columns[from].filter((id) => id !== itemId)
        const toIds = (from === to ? fromIds : columns[to].filter((id) => id !== itemId)).slice()

        if (beforeId) {
          const insertAt = toIds.indexOf(beforeId)
          if (insertAt === -1) toIds.push(itemId)
          else toIds.splice(insertAt, 0, itemId)
        } else {
          toIds.push(itemId)
        }

        set({
          columns: {
            ...columns,
            [from]: from === to ? toIds : fromIds,
            [to]: toIds,
          },
        })
      },
    }),
    {
      name: 'healthie-kanban',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        columns: state.columns,
      }),
    },
  ),
)
