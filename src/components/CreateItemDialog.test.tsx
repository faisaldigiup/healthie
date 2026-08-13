import { beforeEach, describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'

import { CreateItemDialog } from '#/components/CreateItemDialog'
import { charactersQueryKey } from '#/lib/characters'
import {
  createTestQueryClient,
  renderWithProviders,
  resetKanban,
  rick,
} from '#/test/helpers'
import { useKanbanStore } from '#/stores/kanban'

function renderDialog() {
  const client = createTestQueryClient()
  client.setQueryData(charactersQueryKey(1), [rick])
  return renderWithProviders(<CreateItemDialog open onClose={() => {}} />, client)
}

describe('CreateItemDialog', () => {
  beforeEach(() => {
    resetKanban()
  })

  it('requires a title', async () => {
    const user = userEvent.setup()
    const { getByRole, findByText } = renderDialog()

    await user.click(getByRole('button', { name: 'Add to To Do' }))

    expect(await findByText('A title is required.')).toBeInTheDocument()
    expect(useKanbanStore.getState().columns.todo).toEqual([])
  })

  it('requires a character', async () => {
    const user = userEvent.setup()
    const { getByLabelText, getByRole, findByText } = renderDialog()

    await user.type(getByLabelText('Title'), 'Portal calibration')
    await user.click(getByRole('button', { name: 'Add to To Do' }))

    expect(await findByText('Assign a character to continue.')).toBeInTheDocument()
    expect(useKanbanStore.getState().columns.todo).toEqual([])
  })

  it('adds a titled item assigned to a character', async () => {
    const user = userEvent.setup()
    const { getByLabelText, getByRole } = renderDialog()

    await user.type(getByLabelText('Title'), 'Portal calibration')
    await user.type(getByLabelText('Notes'), 'Check the fluid')
    await user.click(getByRole('button', { name: /Rick Sanchez/ }))
    await user.click(getByRole('button', { name: 'Add to To Do' }))

    const { items, columns } = useKanbanStore.getState()
    const item = Object.values(items)[0]
    expect(item?.title).toBe('Portal calibration')
    expect(item?.notes).toBe('Check the fluid')
    expect(item?.character).toEqual(rick)
    expect(columns.todo).toEqual([item?.id])
  })
})
