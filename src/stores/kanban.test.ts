import { beforeEach, describe, expect, it } from 'vitest'

import { makeItem, resetKanban } from '#/test/helpers'
import { useKanbanStore } from '#/stores/kanban'

describe('useKanbanStore', () => {
  beforeEach(() => {
    localStorage.clear()
    resetKanban()
  })

  it('adds items to the front of To Do', () => {
    const first = makeItem({ id: 'a', title: 'First' })
    const second = makeItem({ id: 'b', title: 'Second' })

    useKanbanStore.getState().addItem(first)
    useKanbanStore.getState().addItem(second)

    const { items, columns } = useKanbanStore.getState()
    expect(items.a).toEqual(first)
    expect(items.b).toEqual(second)
    expect(columns.todo).toEqual(['b', 'a'])
    expect(columns.doing).toEqual([])
    expect(columns.done).toEqual([])
  })

  it('removes an item from every column', () => {
    const item = makeItem()
    useKanbanStore.getState().addItem(item)
    useKanbanStore.getState().moveItem(item.id, 'doing', null)
    useKanbanStore.getState().removeItem(item.id)

    const { items, columns } = useKanbanStore.getState()
    expect(items[item.id]).toBeUndefined()
    expect(columns.todo).toEqual([])
    expect(columns.doing).toEqual([])
    expect(columns.done).toEqual([])
  })

  it('moves an item between columns', () => {
    const item = makeItem()
    useKanbanStore.getState().addItem(item)
    useKanbanStore.getState().moveItem(item.id, 'done', null)

    const { columns } = useKanbanStore.getState()
    expect(columns.todo).toEqual([])
    expect(columns.done).toEqual([item.id])
  })

  it('inserts before a sibling in the destination column', () => {
    const alpha = makeItem({ id: 'alpha' })
    const beta = makeItem({ id: 'beta' })
    const gamma = makeItem({ id: 'gamma' })

    useKanbanStore.getState().addItem(alpha)
    useKanbanStore.getState().addItem(beta)
    useKanbanStore.getState().addItem(gamma)
    // todo is [gamma, beta, alpha] after prepends
    useKanbanStore.getState().moveItem('gamma', 'doing', null)
    useKanbanStore.getState().moveItem('alpha', 'doing', null)
    useKanbanStore.getState().moveItem('beta', 'doing', 'alpha')

    expect(useKanbanStore.getState().columns.doing).toEqual(['gamma', 'beta', 'alpha'])
  })

  it('appends when the before target is missing', () => {
    const item = makeItem()
    useKanbanStore.getState().addItem(item)
    useKanbanStore.getState().moveItem(item.id, 'doing', 'missing')

    expect(useKanbanStore.getState().columns.doing).toEqual([item.id])
  })

  it('does nothing when the item is already in the drop position', () => {
    const item = makeItem()
    useKanbanStore.getState().addItem(item)
    const before = useKanbanStore.getState().columns

    useKanbanStore.getState().moveItem(item.id, 'todo', null)

    expect(useKanbanStore.getState().columns).toEqual(before)
  })

  it('does nothing for an unknown item', () => {
    useKanbanStore.getState().moveItem('missing', 'doing', null)
    expect(useKanbanStore.getState().columns).toEqual({
      todo: [],
      doing: [],
      done: [],
    })
  })
})
