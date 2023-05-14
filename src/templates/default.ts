import { genPageData } from '@data/page'
import { TaskBoard } from '@db/taskboard'
import { idGenerate } from '@utils/idGenerate'
import dayjs from 'dayjs'

export const defautlBoard = ({
  title,
  summary,
}: {
  title?: string
  summary?: string
}) => {
  const board = {
    id: idGenerate('board'),
    title: title,
    summary: summary,
    updated_at: dayjs().toISOString(),
    created_at: dayjs().toISOString(),
  }

  const rows = [
    {
      id: idGenerate('rows'),
      title: 'All Tasks',
      board_id: board.id,
      color: 'rgba(71, 111, 254, 0.5)',
      rank: '0|hzzzzz:',
      updated_at: dayjs().toISOString(),
      created_at: dayjs().toISOString(),
    },
  ]

  const columns = [
    {
      id: idGenerate('columns'),
      title: 'Todo',
      board_id: board.id,
      color: 'rgba(68, 133, 255, 0.5)',
      rank: '0|hzzzz3:',
      childrens: [],
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
    },
    {
      id: idGenerate('columns'),
      title: 'In Progress',
      board_id: board.id,
      color: 'rgba(255, 195, 74, 0.5)',
      rank: '0|hzzzzb:',
      childrens: [],
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
    },
    {
      id: idGenerate('columns'),
      title: 'Completed',
      board_id: board.id,
      color: 'rgba(0, 214, 107, 0.5)',
      rank: '0|hzzzzj:',
      childrens: [],
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
    },
  ]

  const items = [
    {
      id: idGenerate('task'),
      title: 'Finish reading chapter 5 of the book.',
      board_id: board.id,
      rank: '0|hzzzzr:',
      status: columns[0].id,
      group: rows[0].id,
      fields: {
        priority: {
          id: 'low',
          color: 'rgba(13, 205, 48, 0.5)',
        },
        start_date: '2023-05-08T18:30:00.000Z',
        due_date: '2023-05-16T18:30:00.000Z',
      },
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
    },
    {
      id: idGenerate('task'),
      title: 'Research new marketing strategies for the business.',
      board_id: board.id,
      rank: '0|hzzzzr:',
      status: columns[1].id,
      group: rows[0].id,
      fields: {
        priority: {
          id: 'low',
          color: 'rgba(13, 205, 48, 0.5)',
        },
        start_date: '',
        due_date: '',
      },
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
    },
    {
      id: idGenerate('task'),
      title: 'Organize closet and donate unwanted clothes.',
      board_id: board.id,
      rank: '0|hzzzzz:',
      status: columns[0].id,
      group: rows[0].id,
      fields: {
        priority: {
          id: 'low',
          color: 'rgba(13, 205, 48, 0.5)',
        },
        start_date: '2023-04-30T18:30:00.000Z',
        due_date: '',
      },
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
    },
    {
      id: idGenerate('task'),
      title: 'Pay the utility bill before the due date.',
      board_id: board.id,
      rank: '0|hzzzzb:',
      status: columns[0].id,
      group: rows[0].id,
      fields: {
        priority: {
          id: 'high',
          color: 'rgba(255, 0, 0, 0.5)',
        },
        start_date: '2023-05-24T18:30:00.000Z',
        due_date: '2023-05-21T18:30:00.000Z',
      },
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
    },
    {
      id: idGenerate('task'),
      title: "Call the doctor's office to schedule an appointment.",
      board_id: board.id,
      rank: '0|hzzzzz:',
      status: columns[1].id,
      group: rows[0].id,
      fields: {
        priority: {
          id: 'low',
          color: 'rgba(13, 205, 48, 0.5)',
        },
        start_date: '',
        due_date: '',
      },
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
    },
    {
      id: idGenerate('task'),
      title: 'Buy groceries for the week',
      board_id: board.id,
      rank: '0|hzzzzz:',
      status: columns[2].id,
      group: rows[0].id,
      fields: {
        priority: {
          id: 'medium',
          color: 'rgba(255, 197, 0, 0.5)',
        },
        start_date: '2023-05-30T18:30:00.000Z',
        due_date: '',
      },
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
    },
  ]

  const pages = items.map((item) => genPageData(item.id, board.id))

  return {
    board,
    rows,
    columns,
    items,
    pages,
  }
}
