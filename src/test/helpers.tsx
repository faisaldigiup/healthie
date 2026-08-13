import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'

import type { Character, KanbanItem } from '#/lib/types'
import { useKanbanStore } from '#/stores/kanban'
import { TooltipProvider } from '@/components/ui/tooltip'

export const rick: Character = {
  id: '1',
  name: 'Rick Sanchez',
  image: 'https://example.com/rick.png',
  status: 'Alive',
  species: 'Human',
}

export const morty: Character = {
  id: '2',
  name: 'Morty Smith',
  image: 'https://example.com/morty.png',
  status: 'Alive',
  species: 'Human',
}

export function makeItem(overrides: Partial<KanbanItem> = {}): KanbanItem {
  return {
    id: 'item-1',
    title: 'Review lab notes',
    notes: '',
    character: rick,
    createdAt: 1_700_000_000_000,
    ...overrides,
  }
}

export function resetKanban() {
  useKanbanStore.setState({
    items: {},
    columns: { todo: [], doing: [], done: [] },
  })
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
    },
  })
}

export function renderWithProviders(ui: ReactNode, client = createTestQueryClient()) {
  return {
    client,
    ...render(
      <QueryClientProvider client={client}>
        <TooltipProvider>{ui}</TooltipProvider>
      </QueryClientProvider>,
    ),
  }
}
