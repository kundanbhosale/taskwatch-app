import { idGenerate } from '@utils/idGenerate'
import dayjs from 'dayjs'
import { LocalDB, localDb, performMultiTableTransaction } from '.'
import { toast } from 'react-hot-toast'
import { defautlBoard } from '@templates/default'
import { emptyTrashByBoard } from './trash'

export type TaskBoardParams = {
  title: TaskBoard['title']
  summary?: TaskBoard['summary']
}
export class TaskBoard {
  id!: string
  title!: string
  summary?: string
  owner?: string
  updated_at!: string
  created_at!: string

  constructor({ title, summary }: TaskBoardParams) {
    this.id = idGenerate('board')
    this.title = title
    this.summary = summary || undefined
    this.owner = undefined
    this.created_at = dayjs().toISOString()
    this.updated_at = dayjs().toISOString()
  }
}

export const getAllBoards = async (db: LocalDB) => {
  try {
    return await db.taskBoards.toArray()
  } catch (err) {
    console.error(err)
    toast.error('Failed to fetch boards')
    return []
  }
}

export const getTaskboard = async (id: TaskBoard['id']) => {
  try {
    return await localDb.taskBoards.get(id)
  } catch (err) {
    console.error(err)
    toast.error('Failed to fetch board')
    return undefined
  }
}

export const addTaskBoard = async (params: TaskBoardParams) => {
  try {
    return await performMultiTableTransaction(
      'rw',
      {
        board: localDb.taskBoards,
        columns: localDb.taskColumns,
        rows: localDb.taskRows,
        tasks: localDb.taskItems,
        pages: localDb.pages,
      },
      async (tables) => {
        const data = defautlBoard(params)

        await tables.board.add(data.board)
        await tables.columns.bulkAdd(data.columns)
        await tables.rows.bulkAdd(data.rows)
        await tables.tasks.bulkAdd(data.items)
        await tables.pages.bulkAdd(data.pages)
        return data.board
      }
    )
  } catch (err) {
    console.error(err)
    toast.error('Failed to add board')
    return undefined
  }
}

export const updateTaskBoard = async (
  db: LocalDB,
  id: string,
  params: TaskBoardParams
) => {
  try {
    return await db.taskBoards.update(id, {
      ...params,
      updated_at: dayjs().toISOString(),
    })
  } catch (err) {
    console.error(err)
    toast.error('Failed to update board')
    return undefined
  }
}

export const deleteBoard = async (id: string) => {
  try {
    return await performMultiTableTransaction(
      'rw',
      {
        board: localDb.taskBoards,
        columns: localDb.taskColumns,
        rows: localDb.taskRows,
        tasks: localDb.taskItems,
        pages: localDb.pages,
        trash: localDb.trash,
      },
      async (tables) => {
        await tables.board.where('id').equals(id).delete()
        await tables.rows.where('board_id').equals(id).delete()
        await tables.columns.where('board_id').equals(id).delete()

        await tables.tasks.where('board_id').equals(id).delete()

        await emptyTrashByBoard(tables as any, id)
      }
    )
  } catch (err) {
    console.error(err)
    toast.error('Failed to delete board')
    return undefined
  }
}
