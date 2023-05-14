import { idGenerate } from '@utils/idGenerate'
import dayjs from 'dayjs'
import { localDb } from '.'
import { toast } from 'react-hot-toast'
import { TaskBoard } from './taskboard'

type TaskRowParams = Pick<TaskRow, 'title' | 'board_id' | 'rank' | 'color'>

export class TaskRow {
  id!: string
  title!: string
  board_id!: string
  color?: string
  rank!: string
  updated_at!: string
  created_at!: string

  constructor({ title, board_id, color, rank }: TaskRowParams) {
    this.id = idGenerate('row')
    this.title = title
    this.board_id = board_id
    this.color = color
    this.rank = rank
    this.created_at = dayjs().toISOString()
    this.updated_at = dayjs().toISOString()
  }
}

export const getTasKRowsByBoardId = async (id: TaskBoard['id']) => {
  try {
    return await localDb.taskRows.where('board_id').equals(id).toArray()
  } catch (err) {
    console.error(err)
    toast.error('Failed to fetch board rows')
    return []
  }
}

export const addTaskRow = async (params: TaskRowParams) => {
  try {
    const row = new TaskRow(params)
    await localDb.taskRows.add(row)
    return row
  } catch (err) {
    console.error(err)
    toast.error('Failed to add board row')
    return undefined
  }
}

export const updateMultiRows = async (data: TaskRow[]) => {
  const rows = data.map((r) => {
    r.updated_at = dayjs().toISOString()
    return r
  })

  try {
    return await localDb.taskRows.bulkPut(rows)
  } catch (err) {
    console.error(err)
    toast.error('Failed to update row')
    return undefined
  }
}

// export const deleteMultiRows = async (ids: TaskRow['id'][]) => {
//   try {
//     return await localDb.taskRows.bulkDelete(ids)
//   } catch (err) {
//     console.error(err)
//     toast.error('Failed to update row')
//     return undefined
//   }
// }

export const deleteTaskRow = async (id: string) => {
  try {
    return await localDb.taskRows.delete(id)
  } catch (err) {
    console.error(err)
    toast.error('Failed to delete board row')
    return undefined
  }
}
