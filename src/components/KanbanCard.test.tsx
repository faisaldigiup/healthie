import { beforeEach, describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'

import { KanbanCard } from '#/components/KanbanCard'
import { makeItem, renderWithProviders, resetKanban } from '#/test/helpers'
import { useKanbanStore } from '#/stores/kanban'

describe('KanbanCard', () => {
  beforeEach(() => {
    resetKanban()
  })

  it('renders the title, character, and notes', () => {
    const item = makeItem({ notes: 'Bring the portal gun' })
    const { getByText } = renderWithProviders(<KanbanCard item={item} />)

    expect(getByText('Review lab notes')).toBeInTheDocument()
    expect(getByText('Rick Sanchez')).toBeInTheDocument()
    expect(getByText('Human')).toBeInTheDocument()
    expect(getByText('Bring the portal gun')).toBeInTheDocument()
  })

  it('removes the item from the store', async () => {
    const item = makeItem()
    useKanbanStore.getState().addItem(item)
    const user = userEvent.setup()
    const { getByRole } = renderWithProviders(<KanbanCard item={item} />)

    await user.click(getByRole('button', { name: 'Remove Review lab notes' }))

    expect(useKanbanStore.getState().items[item.id]).toBeUndefined()
    expect(useKanbanStore.getState().columns.todo).toEqual([])
  })
})
