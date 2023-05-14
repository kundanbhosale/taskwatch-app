import { idGenerate } from '@utils/idGenerate'
import dayjs from 'dayjs'
import { LocalDB, localDb, performMultiTableTransaction } from '.'
import { toast } from 'react-hot-toast'
import { TaskItem } from './taskitems'
import Dexie from 'dexie'
import { TaskBoard } from './taskboard'
import { TaskColumn } from './taskcolumns'
import { TaskRow } from './taskrows'
import { Page } from './pages'

type TrashParams = Pick<Trash, 'table' | 'delete_id' | 'data'>

export class Trash {
  id!: string
  table!: string
  delete_id!: string
  data!: Record<string, any>
  created_at!: string
  updated_at!: string

  constructor({ table, delete_id, data }: TrashParams) {
    this.id = idGenerate('trash')
    this.table = table
    this.delete_id = delete_id
    this.data = data
    this.created_at = dayjs().toISOString()
    this.updated_at = dayjs().toISOString()
  }
}

export const addToTrash = async (
  table: Dexie.Table<Trash, string>,
  params: TrashParams
) => {
  try {
    const trash = new Trash(params)
    await table.add(trash)
    return trash
  } catch (err) {
    console.error(err)
    toast.error('Failed adding to trash!')
    return undefined
  }
}

export const getTrashByBoard = async (boardId: TaskBoard['id']) => {
  try {
    const tableNames = ['task_items', 'task_columns', 'task_rows']
    const trashData = await localDb.trash
      .where('table')
      .anyOf(tableNames)
      .and((item) => item.data.board_id === boardId)
      .reverse()
      .sortBy('updated_at')
    return trashData
  } catch (err) {
    console.error(err)
    toast.error('Failed adding to trash!')
    return undefined
  }
}
export const emptyTrashByBoard = async (db: LocalDB, id: TaskBoard['id']) => {
  const tableNames = ['task_items', 'task_columns', 'task_rows', 'pages']
  await db.trash
    .where('table')
    .anyOf(tableNames)
    .and((item) => item.data.board_id === id)
    .delete()
}

export const deleteMultiRows = async (ids: TaskRow['id'][]) => {
  try {
    const data = await performMultiTableTransaction(
      'rw',
      {
        taskRows: localDb.taskRows,
        taskItems: localDb.taskItems,
        pages: localDb.pages,
        trash: localDb.trash,
      },
      async (tables) => {
        const tasks = (await tables.taskItems
          .where('group')
          .anyOf(ids)
          .toArray()) as TaskItem[]

        const rows = (await tables.taskRows
          .where('id')
          .anyOf(ids)
          .toArray()) as TaskRow[]

        const taskIds: TaskItem['id'][] = []

        const trashedRows = rows.map((t) => {
          return new Trash({ table: 'task_rows', delete_id: t.id, data: t })
        })
        const trashedTasks = tasks.map((t) => {
          taskIds.push(t.id)
          return new Trash({ table: 'task_items', delete_id: t.id, data: t })
        })

        const pages = (await tables.pages
          .where('id')
          .anyOf(taskIds)
          .toArray()) as Page[]

        const trashedPages = pages.map((t) => {
          return new Trash({ table: 'pages', delete_id: t.id, data: t })
        })

        await tables.trash.bulkAdd([
          ...trashedTasks,
          ...trashedRows,
          ...trashedPages,
        ])
        if (trashedTasks.length > 0) {
          await tables.taskItems.bulkDelete(taskIds)
        }
        if (trashedPages.length > 0) {
          await tables.pages.bulkDelete(taskIds)
        }

        if (trashedRows.length > 0) {
          await tables.taskRows.bulkDelete(ids)
        }

        return taskIds
      }
    )

    return data as Array<string>
  } catch (err) {
    console.error(err)
    toast.error('Failed to delete row(s)')
    return undefined
  }
}

export const deleteMultiColumns = async (ids: TaskColumn['id'][]) => {
  try {
    const data = await performMultiTableTransaction(
      'rw',
      {
        pages: localDb.pages,
        taskColumns: localDb.taskColumns,
        taskItems: localDb.taskItems,
        trash: localDb.trash,
      },
      async (tables) => {
        const tasks = (await tables.taskItems
          .where('status')
          .anyOf(ids)
          .toArray()) as TaskItem[]

        const cols = (await tables.taskColumns
          .where('id')
          .anyOf(ids)
          .toArray()) as TaskColumn[]

        const taskIds: TaskItem['id'][] = []

        const trashedCols = cols.map((t) => {
          return new Trash({ table: 'task_columns', delete_id: t.id, data: t })
        })

        const trashedTasks = tasks.map((t) => {
          taskIds.push(t.id)
          return new Trash({ table: 'task_items', delete_id: t.id, data: t })
        })

        const pages = (await tables.pages
          .where('id')
          .anyOf(taskIds)
          .toArray()) as Page[]

        const trashedPages = pages.map((t) => {
          return new Trash({ table: 'pages', delete_id: t.id, data: t })
        })

        await tables.trash.bulkAdd([
          ...trashedTasks,
          ...trashedCols,
          ...trashedPages,
        ])
        if (trashedTasks.length > 0) {
          await tables.taskItems.bulkDelete(taskIds)
        }
        if (trashedPages.length > 0) {
          await tables.pages.bulkDelete(taskIds)
        }

        if (trashedCols.length > 0) {
          await tables.taskColumns.bulkDelete(ids)
        }
        return taskIds
      }
    )

    return data as Array<string>
  } catch (err) {
    console.error(err)
    toast.error('Failed to delete column(s)')
    return undefined
  }
}

export const restoreTaskItem = async (id: Trash['id']) => {
  try {
    const data = await performMultiTableTransaction(
      'rw',
      { trash: localDb.trash, task: localDb.taskItems, pages: localDb.pages },
      async (tables) => {
        const trash = (await tables.trash
          .where('delete_id')
          .equals(id)
          .toArray()) as Trash[]

        if (!trash || trash.length === 0) throw Error('Trash not found!')
        let item
        await Promise.all(
          trash.map(async (t) => {
            if (t.table === 'pages') {
              await tables.pages.put(t.data)
            }
            if (t.table === 'task_items') {
              item = t.data
              await tables.task.put(t.data)
            }
          })
        )
        await tables.trash.where('delete_id').equals(id).delete()
        return item
      }
    )
    return data as TaskItem
  } catch (err) {
    console.error(err)
    return undefined
  }
}

export const restoreBoardTrash = async (
  ids: string[]
): Promise<
  | {
      tasks: TaskItem[]
      columns: TaskColumn[]
      rows: TaskRow[]
    }
  | undefined
> => {
  try {
    return await performMultiTableTransaction(
      'rw',
      {
        pages: localDb.pages,
        trash: localDb.trash,
        taskItems: localDb.taskItems,
        taskRows: localDb.taskRows,
        taskColumns: localDb.taskColumns,
      },
      async (tables) => {
        // Retrieve all trash items with given ids
        const trashList = (await tables.trash
          .where('delete_id')
          .anyOf(ids)
          .toArray()) as Trash[]

        // Throw an error if no trash items found
        if (!trashList || trashList.length === 0) throw Error('No trash found')

        // Create empty arrays to hold restored data for each table
        const restoredData: {
          tasks: TaskItem[]
          columns: TaskColumn[]
          rows: TaskRow[]
          pages: Page[]
        } = {
          tasks: [],
          columns: [],
          rows: [],
          pages: [],
        }

        // Loop through each trash item and add its associated data to the
        // appropriate array in restoredData
        for (const trashItem of trashList) {
          if (trashItem.table === 'task_items') {
            restoredData.tasks.push(trashItem.data as any)
          }
          if (trashItem.table === 'task_rows') {
            restoredData.rows.push(trashItem.data as any)
          }
          if (trashItem.table === 'task_columns') {
            restoredData.columns.push(trashItem.data as any)
          }
          if (trashItem.table === 'pages') {
            restoredData.pages.push(trashItem.data as any)
          }
        }

        // Use bulkPut instead of bulkAdd for better performance
        // Add tasks back to the taskItems table
        if (restoredData.tasks.length > 0) {
          await tables.taskItems.bulkPut(restoredData.tasks)
        }

        // Add rows back to the taskRows table
        if (restoredData.rows.length > 0) {
          await tables.taskRows.bulkPut(restoredData.rows)
        }

        // Add columns back to the taskColumns table
        if (restoredData.columns.length > 0) {
          await tables.taskColumns.bulkPut(restoredData.columns)
        }
        // Add columns back to the taskColumns table
        if (restoredData.pages.length > 0) {
          await tables.pages.bulkPut(restoredData.pages)
        }

        // Delete all trash items with given ids
        await tables.trash.where('delete_id').anyOf(ids).delete()

        return restoredData
      }
    )
  } catch (error) {
    toast.error('Failed to restore')
    console.error(error)
    return undefined
  }
}
