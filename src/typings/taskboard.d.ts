import { TaskBoard } from '@db/taskboard'
import { TaskColumn } from '@db/taskcolumns'
import { TaskItem } from '@db/taskitems'
import { ISelectOptions } from './types'

export type TaskColumnUpdate = Partial<ITaskColumn> & {
  action: 'create' | 'update' | 'delete'
}

export type BoardView = 'column' | 'table'
export type SortTypes = 'title' | 'created' | 'updated' | 'status' | 'rank'

export interface TaskBoardContext {
  board: TaskBoard | undefined
  columns: TaskColumn[]
  rows: TaskColumn[]
  items: TaskItem[]
  colors: Array<string>
  view: BoardView
  sortType: SortTypes
  editTaskId: TaskItems['id'] | 'new' | undefined
  getStatus: () => ISelectOptions[]
  setItems: React.Dispatch<React.SetStateAction<TaskBoardContext['items']>>
  setColumns: React.Dispatch<React.SetStateAction<TaskBoardContext['columns']>>
  setRows: React.Dispatch<React.SetStateAction<TaskBoardContext['rows']>>
  setEditTaskId: React.Dispatch<
    React.SetStateAction<TaskItem['id'] | 'new' | undefined>
  >
  setEditColumnId: React.Dispatch<
    React.SetStateAction<TaskColumn['id'] | 'new' | undefined>
  >
}

export type ITaskForm = Pick<TaskItem, 'title' | 'column_id' | 'row_id'>

export interface ITaskColumnForm {
  title: string
  color: string
}
