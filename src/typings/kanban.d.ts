import { TaskBoard } from '@db/taskboard'
import { TaskColumn } from '@db/taskcolumns'
import { TaskItem } from '@db/taskitems'
import { TaskRow } from '@db/taskrows'
import { TaskBoardSettings } from '@db/tasksettings'

interface BoardData {
  board: TaskBoard
  columns: Map<string, TaskColumn>
  rows: Map<string, TaskRow>
  items: Map<string, TaskItem>
  settings: TaskBoardSettings
}

export interface IBoardContext {
  data: BoardData | undefined
  loading: boolean
  columns: Array<TaskColumn['id']>
  subColumns: Record<TaskColumn['id'], Array<string>>
  rows: Array<TaskRow['id']>
  grids: Record<string, Array<TaskItem['id']>>
  columnCount: number
  colors: Array<string>

  setEditing: React.Dispatch<React.SetStateAction<BoardEditing>>
  setColumns: React.Dispatch<React.SetStateAction<IBoardContext['columns']>>
  setSubColumns: React.Dispatch<
    React.SetStateAction<IBoardContext['subColumns']>
  >
  setTaskUpdate: React.Dispatch<React.SetStateAction<Array<TaskItem['id']>>>
  setGrids: React.Dispatch<React.SetStateAction<IBoardContext['grids']>>
  setRows: React.Dispatch<React.SetStateAction<IBoardContext['rows']>>
  handleTask: (val: TaskForm & { id?: TaskItem['id'] }, timer: boolean) => void
}

export type BoardEditing =
  | {
      id?: string
      type: 'task' | 'column' | 'row' | 'setting' | 'trash'
    }
  | undefined
export type BoardView = 'board' | 'table'
export type SortTypes = 'title' | 'created' | 'updated' | 'status' | 'rank'

export interface ColumnForm {
  columns: Array<TaskColumn>
}

export interface RowForm {
  rows: Array<TaskRow>
}

export interface TaskForm {
  title: TaskItem['title']
  group: {
    title: TaskRow['title']
    color: TaskRow['color']
    id: TaskRow['id']
  }
  status: {
    title: TaskColumn['title']
    color: TaskColumn['color']
    id: TaskColumn['id']
  }
  priority: { id: TaskItem['priority']; color: string }
  due_date: string
  start_date: string
}
