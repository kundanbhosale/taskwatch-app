import Dexie, { TransactionMode } from 'dexie'
import { TaskBoard, addTaskBoard } from './taskboard'
import { TaskItem } from './taskitems'
import { TaskColumn } from './taskcolumns'
import { Page } from './pages'
import { Trash } from './trash'
import { TaskRow } from './taskrows'
import { TaskBoardSettings } from './tasksettings'

export class LocalDB extends Dexie {
  taskBoards: Dexie.Table<TaskBoard, string>
  taskItems: Dexie.Table<TaskItem, string>
  taskColumns: Dexie.Table<TaskColumn, string>
  taskRows: Dexie.Table<TaskRow, string>
  taskBoardSettings: Dexie.Table<TaskBoardSettings, string>
  pages: Dexie.Table<Page, string>
  trash: Dexie.Table<Trash, string>

  constructor() {
    super('Kanban')
    this.version(1).stores({
      task_boards: 'id, updated_at',
      task_boards_settings: 'id, board_id',
      task_columns: 'id, board_id, updated_at',
      task_rows: 'id, board_id',
      task_items: 'id, group, status, board_id, updated_at',
      pages: 'id, updated_at',
      trash: 'id, table, delete_id, updated_at',
    })
    this.taskBoards = this.table('task_boards')
    this.taskBoardSettings = this.table('task_boards_settings')
    this.taskItems = this.table('task_items')
    this.taskColumns = this.table('task_columns')
    this.taskRows = this.table('task_rows')
    this.pages = this.table('pages')
    this.trash = this.table('trash')
  }
}

export const localDb = new LocalDB()

type TransactionWork<T> = (tables: {
  [key: string]: Dexie.Table<T, string>
}) => Promise<any>

type TransactionTables = {
  [key: string]: Dexie.Table<any, string>
}

export const performMultiTableTransaction = async <T>(
  mode: TransactionMode,
  tables: TransactionTables,
  work: TransactionWork<T>
): Promise<any> => {
  return await localDb.transaction(mode, Object.values(tables), async () => {
    return await work(tables)
  })
}

localDb.on('populate', async () => {
  try {
    await addTaskBoard({ title: 'Basic Kanban', summary: '' })
  } catch (err) {
    console.error('Failed to add initail data')
  }
})
