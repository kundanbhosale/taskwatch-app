import { Trash, restoreBoardTrash } from '@db/trash'
import { IBoardContext } from '@typings/kanban'
import produce from 'immer'
import { createGridId } from './grid'
import { calLexoRank } from '@utils/lexoRank'
import { LexoRank } from 'lexorank'

/**
 * Handles the restoration of a deleted item from the trash.
 * @param item The item to be restored.
 */
export const handleRestore = async (
  item: Trash,
  trash: Trash[],
  setTrash: React.Dispatch<React.SetStateAction<Trash[]>>,
  data: IBoardContext['data'],
  setRows: IBoardContext['setRows'],
  setColumns: IBoardContext['setColumns'],
  setGrids: IBoardContext['setGrids']
) => {
  if (!item) return
  setTrash(trash.filter((t) => t.id !== item.id))
  // Get the 'trash' table from the local database
  // Initialize an empty array to store the IDs of items associated with the item being restored
  const ids: string[] = [item.delete_id]

  // If the item being restored is a task item
  if (item.table === 'task_items') {
    // Filter the 'trash' table to get all task items associated with the item being restored
    trash.forEach((t) => {
      const satisfies =
        t.delete_id === item.data.status || t.delete_id === item.data.group
      if (satisfies) {
        ids.push(t.delete_id)
      }
    })
  }

  // Log the IDs of items associated with the item being restored
  const restored = await restoreBoardTrash(ids)
  if (!restored) return

  if (restored.tasks.length > 0) {
    setGrids((prev) => {
      return produce(prev, (draft) => {
        restored.tasks.forEach((t) => {
          const gridId = createGridId(t.group, t.status)
          if (draft[gridId]?.includes(t.id)) return
          if (draft[gridId]) {
            draft[gridId].unshift(t.id)
            const next = draft[gridId][0]
            data?.items?.get(next)?.rank
            t.rank = calLexoRank(
              undefined,
              data?.items.get(next)?.rank || undefined
            ).toString()
          } else {
            draft[gridId] = [t.id]
            t.rank = LexoRank.middle().toString()
          }
          data?.items.set(t.id, t)
        })
      })
    })
  }

  if (restored.columns.length > 0) {
    setColumns((prev) => {
      return produce(prev, (draft) => {
        restored.columns.forEach((t) => {
          if (draft.includes(t.id)) return

          if (draft.length > 0) {
            const rank = data?.columns.get(draft[0])?.rank || undefined
            t.rank = calLexoRank(undefined, rank).toString()
            draft.unshift(t.id)
          } else {
            draft = [t.id]
            t.rank = LexoRank.middle().toString()
          }
          data?.columns.set(t.id, t)
        })
      })
    })
  }

  if (restored.rows.length > 0) {
    setRows((prev) => {
      return produce(prev, (draft) => {
        restored.rows.forEach((t) => {
          if (draft.includes(t.id)) return

          if (draft.length > 0) {
            const rank = data?.rows.get(draft[0])?.rank || undefined
            t.rank = calLexoRank(undefined, rank).toString()
            draft.unshift(t.id)
          } else {
            draft = [t.id]
            t.rank = LexoRank.middle().toString()
          }
          data?.rows.set(t.id, t)
        })
      })
    })
  }
}
