import { beforeEach, describe, expect, it, vi } from 'vitest'

import { KanbanColumn } from '#/components/KanbanColumn'
import { makeItem, renderWithProviders, resetKanban } from '#/test/helpers'

const todoColumn = {
  id: 'todo' as const,
  title: 'To Do',
  hint: 'Ready when you are',
}

describe('KanbanColumn', () => {
  beforeEach(() => {
    resetKanban()
  })

  it('shows an empty state when there are no cards', () => {
    const { getByText } = renderWithProviders(
      <KanbanColumn column={todoColumn} itemIds={[]} items={{}} onCelebrate={vi.fn()} />,
    )

    expect(getByText('Nothing here')).toBeInTheDocument()
    expect(getByText('Drop a card into this column.')).toBeInTheDocument()
  })

  it('renders cards and a count badge', () => {
    const item = makeItem()
    const { getByText, queryByText } = renderWithProviders(
      <KanbanColumn
        column={todoColumn}
        itemIds={[item.id]}
        items={{ [item.id]: item }}
        onCelebrate={vi.fn()}
      />,
    )

    expect(getByText('Review lab notes')).toBeInTheDocument()
    expect(getByText('1')).toBeInTheDocument()
    expect(queryByText('Nothing here')).not.toBeInTheDocument()
  })
})
