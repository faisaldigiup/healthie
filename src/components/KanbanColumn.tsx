import { Rows3Icon } from 'lucide-react'
import { Fragment, useState, type DragEvent } from 'react'

import { KanbanCard } from '#/components/KanbanCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import { clearHighlights, highlightIndicator } from '#/lib/drop'
import type { ColumnId, KanbanItem, Point } from '#/lib/types'
import { useKanbanStore } from '#/stores/kanban'

type ColumnConfig = {
  id: ColumnId
  title: string
  hint: string
}

type KanbanColumnProps = {
  column: ColumnConfig
  itemIds: Array<string>
  items: Record<string, KanbanItem>
  onCelebrate: (point: Point) => void
}

function DropIndicator({
  beforeId,
  columnId,
}: {
  beforeId: string | null
  columnId: ColumnId
}) {
  return (
    <div
      data-before={beforeId ?? '-1'}
      data-column={columnId}
      className="h-0.5 w-full rounded-full bg-primary opacity-0"
    />
  )
}

export function KanbanColumn({ column, itemIds, items, onCelebrate }: KanbanColumnProps) {
  const moveItem = useKanbanStore((state) => state.moveItem)
  const [active, setActive] = useState(false)
  const cards = itemIds.flatMap((id) => {
    const item = items[id]
    return item ? [item] : []
  })

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setActive(true)
    highlightIndicator(event.clientY, column.id)
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return
    setActive(false)
    clearHighlights(column.id)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setActive(false)

    const cardId =
      event.dataTransfer.getData('cardId') || event.dataTransfer.getData('text/plain')
    const indicator = highlightIndicator(event.clientY, column.id)
    const beforeId = indicator?.dataset.before
    clearHighlights(column.id)

    if (!cardId || beforeId === cardId) return

    const alreadyDone = useKanbanStore.getState().columns.done.includes(cardId)
    moveItem(cardId, column.id, beforeId && beforeId !== '-1' ? beforeId : null)

    if (column.id === 'done' && !alreadyDone) {
      onCelebrate({ x: event.clientX, y: event.clientY })
    }
  }

  return (
    <Card
      className={cn(
        'min-h-[32rem] overflow-visible bg-transparent py-5 shadow-none ring-foreground/8 transition-shadow',
        active && 'ring-2 ring-primary/40',
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{column.title}</CardTitle>
            <CardDescription>{column.hint}</CardDescription>
          </div>
          <Badge variant="secondary">{cards.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-visible">
        {/* biome-ignore lint/a11y/noStaticElementInteractions: native HTML5 drop target */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="flex min-h-48 flex-1 flex-col"
        >
          <div className="flex flex-col">
            {cards.map((item) => (
              <Fragment key={item.id}>
                <DropIndicator beforeId={item.id} columnId={column.id} />
                <div className="py-2">
                  <KanbanCard item={item} />
                </div>
              </Fragment>
            ))}
            <DropIndicator beforeId={null} columnId={column.id} />
          </div>
          {cards.length === 0 ? (
            <Empty className="mt-2 min-h-48 border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Rows3Icon />
                </EmptyMedia>
                <EmptyTitle>Nothing here</EmptyTitle>
                <EmptyDescription>Drop a card into this column.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
