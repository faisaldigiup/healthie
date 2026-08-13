export type ColumnId = 'todo' | 'doing' | 'done'

export type Character = {
  id: string
  name: string
  image: string
  status: string
  species: string
}

export type KanbanItem = {
  id: string
  title: string
  notes: string
  character: Character
  createdAt: number
}

export type Point = {
  x: number
  y: number
}
