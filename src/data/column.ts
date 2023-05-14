import { TaskBoard } from '@db/taskboard'
import { TaskColumn } from '@db/taskcolumns'
import { idGenerate } from '@utils/idGenerate'
import dayjs from 'dayjs'
import { LexoRank } from 'lexorank'

export const fakeColumn = ({
  board_id,
  columns,
}: {
  board_id: TaskBoard['id']
  columns: {
    title: TaskColumn['title']
    color: TaskColumn['color']
    childrens: TaskColumn['childrens']
  }
}) => {
  let rank = LexoRank.middle()

  const result: TaskColumn = {
    id: idGenerate('column'),
    title: columns.title,
    board_id,
    color: columns.color,
    rank: rank.toString(),
    childrens: columns.childrens,
    created_at: dayjs().toISOString(),
    updated_at: dayjs().toISOString(),
  }
  rank = rank.genNext()
  return result
}
