import { idGenerate } from '@utils/idGenerate'
import dayjs from 'dayjs'
import { localDb, performMultiTableTransaction } from '.'
import { TaskBoard } from './taskboard'
import { TaskColumn } from './taskcolumns'
import { toast } from 'react-hot-toast'
import { Trash, addToTrash } from './trash'
import Dexie from 'dexie'
import { TaskRow } from './taskrows'
import { Page } from './pages'

export type TaskItemsParams = Pick<
  TaskItem,
  'board_id' | 'rank' | 'title' | 'status' | 'group' | 'fields'
>

export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export const TaskPriorityOptions = [
  {
    id: TaskPriority.Low,
    color: 'rgba(13, 205, 48, 0.5)',
  },
  {
    id: TaskPriority.Medium,
    color: 'rgba(255, 197, 0, 0.5)',
  },
  {
    id: TaskPriority.High,
    color: 'rgba(255, 0, 0, 0.5)',
  },
]

export class TaskItem {
  id!: string
  title!: string
  board_id!: string
  rank!: string
  status!: TaskColumn['id']
  group!: TaskRow['id']
  fields: Record<string, any>
  created_at!: string
  updated_at!: string

  constructor({
    title,
    board_id,
    rank,
    status,
    group,
    fields,
  }: TaskItemsParams) {
    this.id = idGenerate('task')
    this.title = title
    this.board_id = board_id
    this.rank = rank
    this.status = status
    this.group = group
    this.fields = fields
    this.created_at = dayjs().toISOString()
    this.updated_at = dayjs().toISOString()
  }
}

export const getTasksByBoardId = async (id: TaskBoard['id']) => {
  try {
    return await localDb.taskItems.where('board_id').equals(id).toArray()
  } catch (err) {
    console.error(err)
    toast.error('Failed to fetch tasks')
    return undefined
  }
}

export const addTaskItem = async (params: TaskItemsParams) => {
  try {
    const fields = ['title', 'board_id', 'rank', 'status', 'group']
    const hasNulls = fields.some((key) => !(params as any)[key])
    if (hasNulls) {
      throw Error('Invalid params')
    }

    const item = new TaskItem(params)
    await localDb.taskItems.add(item)

    return { ...item }
  } catch (err) {
    console.error(err)
    toast.error('Failed to add task')
    return undefined
  }
}

export const updateMultiTask = async (data: Array<TaskItem>) => {
  try {
    return await localDb.taskItems.bulkPut(data)
  } catch (err) {
    console.error(err)
    toast.error('Failed to update tasks')
    return undefined
  }
}

export const deleteTaskItem = async (id: string) => {
  try {
    const data = await performMultiTableTransaction(
      'rw',
      {
        taskItems: localDb.taskItems,
        trash: localDb.trash,
        pages: localDb.pages,
      },
      async (tables) => {
        const item = (await tables.taskItems.get(id)) as TaskItem | undefined
        if (!item) throw Error('Task not found!')

        const page = (await tables.pages.get(id)) as Page | undefined

        let trashPage
        let trashItem
        if (page) {
          trashPage = new Trash({
            table: 'pages',
            delete_id: page.id,
            data: page,
          })
        }

        if (item) {
          trashItem = new Trash({
            table: 'task_items',
            delete_id: item.id,
            data: item,
          })
        }

        await tables.trash.bulkPut([trashItem, trashPage])

        await tables.taskItems.delete(id)
        if (trashPage) {
          await tables.pages.delete(id)
        }
        return trashItem?.id
      }
    )

    return data
  } catch (err) {
    console.error(err)
    toast.error('Failed to delete task')
    return undefined
  }
}
