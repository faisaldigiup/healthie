import { beforeEach, describe, expect, it } from 'vitest'

import { KanbanBoard } from '#/components/KanbanBoard'
import { charactersQueryKey } from '#/lib/characters'
import {
  createTestQueryClient,
  makeItem,
  renderWithProviders,
  resetKanban,
  rick,
} from '#/test/helpers'
import { useKanbanStore } from '#/stores/kanban'

describe('KanbanBoard', () => {
  beforeEach(() => {
    resetKanban()
  })

  it('renders the board header and columns', () => {
    const client = createTestQueryClient()
    client.setQueryData(charactersQueryKey(1), [rick])

    const { getByRole, getByText } = renderWithProviders(<KanbanBoard />, client)

    expect(getByRole('heading', { name: 'Healthie' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'New item' })).toBeInTheDocument()
    expect(getByText('0 items')).toBeInTheDocument()
    expect(getByText('To Do')).toBeInTheDocument()
    expect(getByText('Doing')).toBeInTheDocument()
    expect(getByText('Done')).toBeInTheDocument()
  })

  it('shows the item count from the store', () => {
    useKanbanStore.getState().addItem(makeItem())
    const client = createTestQueryClient()
    client.setQueryData(charactersQueryKey(1), [rick])

    const { getByText } = renderWithProviders(<KanbanBoard />, client)

    expect(getByText('1 item')).toBeInTheDocument()
    expect(getByText('Review lab notes')).toBeInTheDocument()
  })
})
