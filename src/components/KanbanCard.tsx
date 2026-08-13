import { motion } from 'motion/react'
import { Trash2Icon } from 'lucide-react'
import { useState, type DragEvent } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { clearHighlights } from '#/lib/drop'
import type { KanbanItem } from '#/lib/types'
import { useKanbanStore } from '#/stores/kanban'

type KanbanCardProps = {
  item: KanbanItem
}

export function KanbanCard({ item }: KanbanCardProps) {
  const removeItem = useKanbanStore((state) => state.removeItem)
  const [dragging, setDragging] = useState(false)
  const initials = item.character.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')

  function handleDragStart(event: DragEvent<HTMLDivElement>) {
    event.dataTransfer.setData('cardId', item.id)
    event.dataTransfer.setData('text/plain', item.id)
    event.dataTransfer.effectAllowed = 'move'
    setDragging(true)
  }

  return (
    <motion.div
      layout
      layoutId={item.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 480, damping: 38 }}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: native HTML5 drag source */}
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={() => {
          setDragging(false)
          clearHighlights()
        }}
        className={cn(
          'cursor-grab select-none active:cursor-grabbing',
          dragging && 'opacity-40',
        )}
      >
        <Card size="sm" className="overflow-visible bg-card py-3 shadow-none">
          <CardContent className="flex items-start gap-3">
            <Avatar size="sm" className="mt-0.5">
              <AvatarImage src={item.character.image} alt={item.character.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm leading-snug font-medium">{item.title}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Remove ${item.title}`}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground"
                    >
                      <Trash2Icon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove</TooltipContent>
                </Tooltip>
              </div>
              {item.notes ? (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {item.notes}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">{item.character.name}</span>
                <Badge variant="outline">{item.character.species}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
