import { idGenerate } from '@utils/idGenerate'
import dayjs from 'dayjs'
import { localDb, performMultiTableTransaction } from '.'
import { TaskBoard } from './taskboard'
import { toast } from 'react-hot-toast'
import { TaskItem } from './taskitems'

type TaskColumnsParams = Pick<
  TaskColumn,
  'board_id' | 'color' | 'rank' | 'title' | 'childrens'
>

export class TaskColumnChildren {
  id!: string
  title!: string
  rank!: string
  color!: string

  constructor({ title, rank, color }: Omit<TaskColumnChildren, 'id'>) {
    this.id = idGenerate('sub_col')
    this.title = title
    this.rank = rank
    this.color = color
  }
}

export class TaskColumn {
  id!: string
  title!: string
  board_id!: string
  color!: string
  rank!: string
  childrens: Array<TaskColumnChildren>
  created_at!: string
  updated_at!: string

  constructor({ title, board_id, rank, color, childrens }: TaskColumnsParams) {
    this.id = idGenerate('column')
    this.title = title
    this.board_id = board_id
    this.rank = rank
    this.color = color
    this.childrens = childrens || []
    this.created_at = dayjs().toISOString()
    this.updated_at = dayjs().toISOString()
  }
}

export const getTasksColumnsByBoardId = async (id: TaskBoard['id']) => {
  try {
    return await localDb.taskColumns.where('board_id').equals(id).toArray()
  } catch (err) {
    console.error(err)
    toast.error('Failed to fetch columns')
    return undefined
  }
}

// export const addTaskColumn = async (params: TaskColumnsParams) => {
//   try {
//     const fields = ['title', 'board_id', 'rank', 'limit']
//     const hasNulls = fields.some((key) => !(params as any)[key])

//     if (hasNulls) {
//       throw Error('Invalid params')
//     }

//     const col = new TaskColumn(params)
//     await localDb.taskColumns.add(col)
//     return { ...col }
//   } catch (err) {
//     console.error(err)
//     toast.error('Failed to add column')
//     return undefined
//   }
// }

// export const addMultiTaskColumns = async (
//   board_id: TaskBoard['id'] | undefined,
//   columns: Array<Pick<TaskColumn, 'color' | 'title' | 'childrens' | 'limit'>>,
//   prevRank: string
// ) => {
//   try {
//     if (!board_id) throw Error('Board Id missing!')
//     if (!prevRank) throw Error('Prev Rank missing!')
//     let rank = prevRank
//     const newCols = columns.map((col) => {
//       if (!col.color || !col.title) throw Error('color / title missing!')
//       rank = LexoRank.parse(rank).genNext().toString()
//       return new TaskColumn({ ...col, rank, board_id })
//     })
//     await localDb.taskColumns.bulkAdd(newCols)
//     return newCols
//   } catch (err) {
//     console.error(err)
//     toast.error('Failed to add columns')
//     return undefined
//   }
// }

// export const deleteMultiColumns = async (ids: TaskColumn['id'][]) => {
//   try {
//     await localDb.taskColumns.bulkDelete(ids)
//   } catch (err) {
//     console.error(err)
//     toast.error('Failed to delete columns')
//     return undefined
//   }
// }

export const updateMultiColumns = async (
  cols: TaskColumn[],
  tasks: TaskItem[]
) => {
  try {
    await performMultiTableTransaction(
      'rw',
      { columns: localDb.taskColumns, task: localDb.taskItems },
      async (tables) => {
        await tables.columns.bulkPut(cols)
        await tables.task.bulkPut(tasks)
      }
    )
  } catch (err) {
    toast.error('Failed to update column(s)')
    console.error(err)
    return undefined
  }
  // try {

  //   await localDb.taskColumns.bulkPut(cols)
  // } catch (err) {
  //   console.error(err)
  //   toast.error('Failed to update columns')
  //   return undefined
  // }
}
