import { TaskRow, addTaskRow, deleteTaskRow } from '@db/taskrows'
import { IBoardContext, RowForm } from '@typings/kanban'
import { calLexoRank } from '@utils/lexoRank'
import { updateGridColor } from './grid'

export const setRowColor = (color: string, elId: string) => {
  const el = document.getElementById(elId)
  const cells = document.querySelectorAll(`div[data-row=${elId}]`)

  if (el) {
    el.style.background = color
  }
  if (cells) {
    cells.forEach((c: any) => {
      c.style.background = color
    })
  }
}

// export const handleRowUpdate = async (
//   id: TaskRow['id'],
//   formData: RowForm,
//   data: IBoardContext['data'],
//   setRows: IBoardContext['setRows']
// ) => {
//   if (!data) return
//   const board_id = data.board.id
//   if (id === 'new') {
//     let lastRank = undefined

//     if (data.rows.size > 0) {
//       const latItem = [...data.rows][data.rows.size - 1][1]
//       lastRank = latItem.rank
//     }
//     const colrank = calLexoRank(lastRank, undefined).toString()

//     const newRow = await addTaskRow({
//       ...formData,
//       board_id,
//       rank: colrank,
//     })
//     if (newRow) {
//       data.rows.set(newRow.id, newRow)
//       setRows((prev) => [...prev, newRow.id])
//     }
//   } else {
//     const row = data.rows.get(id)
//     if (!row) return
//     data.rows.set(id, { ...row, ...formData })

//     if (row.color !== formData.color) {
//       updateGridColor(id, formData.color, 'row')
//     }

//     await updateTaskRow(id, {
//       ...formData,
//       rank: row.rank,
//     })
//   }
// }
