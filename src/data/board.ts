import { TaskBoard } from '@db/taskboard'
import { idGenerate } from '@utils/idGenerate'
import dayjs from 'dayjs'

export const genBoardData = ({
  summary,
  title,
}: Pick<TaskBoard, 'summary' | 'title'>) => {
  return {
    id: idGenerate('board'),
    title: title,
    summary: summary,
    updated_at: dayjs().toISOString(),
    created_at: dayjs().toISOString(),
  }
}
