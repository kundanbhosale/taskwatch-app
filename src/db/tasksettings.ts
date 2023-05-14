import { idGenerate } from '@utils/idGenerate'
import { TaskBoard } from './taskboard'
import dayjs from 'dayjs'
import { localDb } from '.'
import { toast } from 'react-hot-toast'

type TaskBoardSettingsStyles = {
  gaps: {
    row: string
    column: string
  }
  colors: {
    card: string
    border: string
  }
}

type TaskBoardSettingsParams = Pick<TaskBoardSettings, 'styles' | 'board_id'>

export class TaskBoardSettings {
  id!: string
  board_id!: TaskBoard['id']
  styles!: TaskBoardSettingsStyles
  updated_at!: string
  created_at!: string

  constructor({ board_id, styles }: TaskBoardSettingsParams) {
    this.id = idGenerate('setting')
    this.board_id = board_id
    this.styles = styles || undefined
    this.created_at = dayjs().toISOString()
    this.updated_at = dayjs().toISOString()
  }
}

export const getTaskboard = async (id: TaskBoard['id']) => {
  try {
    return await localDb.taskBoardSettings.get(id)
  } catch (err) {
    console.error(err)
    toast.error('Failed to fetch board')
    return undefined
  }
}

export const updateTaskBoard = async (
  id: string | 'new',
  params: TaskBoardSettingsParams
) => {
  try {
    if (id === 'new') {
      const setting = new TaskBoardSettings(params)
      await localDb.taskBoardSettings.add(setting)
      return setting
    } else {
      return await localDb.taskBoardSettings.update(id, {
        ...params,
        updated_at: dayjs().toISOString(),
      })
    }
  } catch (err) {
    console.error(err)
    toast.error('Failed to update board')
    return undefined
  }
}
