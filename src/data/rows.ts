import { TaskBoard } from '@db/taskboard'
import { TaskColumn } from '@db/taskcolumns'
import { idGenerate } from '@utils/idGenerate'
import dayjs from 'dayjs'
import { LexoRank } from 'lexorank'

export const genRowData = ({
  board_id,
  title,
  color,
}: {
  board_id: TaskBoard['id']
  title: TaskColumn['title']
  color: TaskColumn['color']
}) => {
  let rank = LexoRank.middle()

  const result = {
    id: idGenerate('row'),
    title,
    board_id,
    color,
    rank: rank.toString(),
    updated_at: dayjs().toISOString(),
    created_at: dayjs().toISOString(),
  }

  rank = rank.genNext()
  return result
}
