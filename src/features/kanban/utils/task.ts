import { restoreToast } from '@components/customToasts'
import { TaskItem, deleteTaskItem, updateMultiTask } from '@db/taskitems'
import { restoreTaskItem } from '@db/trash'
import { Active, Over } from '@dnd-kit/core'
import { arrayMove as dndKitArrayMove } from '@dnd-kit/sortable'
import { IBoardContext } from '@typings/kanban'
import produce from 'immer'
import { calLexoRank } from '@utils/lexoRank'
import { debounce } from 'debounce'

export const handleDeleteTask = async (
  id: TaskItem['id'],
  data: IBoardContext['data'],
  setGrids: IBoardContext['setGrids']
) => {
  const item = data?.items.get(id)

  const gridId = item?.status + '--' + item?.group

  let idx = -1

  setGrids((prev) => {
    const updated = produce(prev, (draft) => {
      idx = draft[gridId].indexOf(id)
      if (idx !== -1) {
        draft[gridId].splice(idx, 1)
      }
    })
    return updated
  })

  data?.items.delete(id)

  const deleted = await deleteTaskItem(id)
  if (!deleted) return
  restoreToast(deleted, () =>
    handleRestoreTask(id, idx, gridId, data, setGrids)
  )
}

export const handleRestoreTask = async (
  deleted_id: TaskItem['id'],
  idx: number,
  gridId: string,
  data: IBoardContext['data'],
  setGrids: IBoardContext['setGrids']
) => {
  const restored = await restoreTaskItem(deleted_id)
  if (restored) {
    data?.items.set(restored.id, restored)
    setGrids((prev) => {
      return produce(prev, (draft) => {
        idx !== -1 && draft[gridId].splice(idx, 0, restored.id)
      })
    })
  }
}

export const handleTaskUpdate = async (
  ids: Array<TaskItem['id']>,
  data: IBoardContext['data']
) => {
  const updateData: Array<TaskItem> = []
  ids.forEach((id) => {
    const task = data?.items.get(id)
    if (!task) return
    updateData.push(task)
  })
  await updateMultiTask(updateData)
}

export const addTaskToUpdate = (
  currId: string,
  prevId: string,
  nextId: string,
  overContainer: string,
  data: IBoardContext['data'],
  setTaskUpdate: IBoardContext['setTaskUpdate']
) => {
  const [status, group] = overContainer.split('--')
  const curr = data?.items.get(currId)
  const prev = data?.items.get(prevId)
  const next = data?.items.get(nextId)

  if (!curr) return
  const rank = calLexoRank(prev?.rank, next?.rank).toString()
  data?.items.set(currId, { ...curr, rank, status, group })
  setTaskUpdate((ids) => (ids.indexOf(currId) === -1 ? [...ids, currId] : ids))
}

export const arrayMove = (
  array: Array<unknown>,
  oldIndex: number,
  newIndex: number
) => {
  return dndKitArrayMove(array, oldIndex, newIndex)
}

export const handleDragOverTask = debounce(
  ({
    data,
    active,
    over,
    grids,
    setGrids,
    setTaskUpdate,
  }: {
    active: Active
    over: Over | null
    grids: IBoardContext['grids']
    setGrids: IBoardContext['setGrids']
    data: IBoardContext['data']
    setTaskUpdate: IBoardContext['setTaskUpdate']
  }) => {
    const overId = over?.id

    if (!overId || active.id === overId) {
      return
    }

    const activeContainer = active.data.current?.sortable.containerId
    const overContainer = over?.data.current?.sortable.containerId || over.id

    if (activeContainer !== overContainer) {
      const overIndex =
        overId in grids
          ? grids[overContainer].length
          : over.data.current?.sortable.index

      const updated = produce(grids, (draft: any) => {
        const activeIndex = active.data.current?.sortable.index

        const [item] = draft[activeContainer].splice(activeIndex, 1)
        draft[overContainer].splice(overIndex, 0, item)
      })

      if (updated && overContainer && updated[overContainer]) {
        addTaskToUpdate(
          updated[overContainer][overIndex],
          updated[overContainer][overIndex - 1],
          updated[overContainer][overIndex + 1],
          overContainer,
          data,
          setTaskUpdate
        )
      }

      setGrids(updated)
    }
  },
  50
)

export const handleDragEndTask = ({
  data,
  active,
  over,
  grids,
  setGrids,
  setActiveId,
  setTaskUpdate,
}: {
  active: Active | null
  over: Over | null
  grids: IBoardContext['grids']
  setGrids: IBoardContext['setGrids']
  data: IBoardContext['data']
  setActiveId: (val: string | undefined) => void
  setTaskUpdate: IBoardContext['setTaskUpdate']
}) => {
  if (!over) {
    setActiveId(undefined)
    return
  }

  if (active?.id !== over.id) {
    const activeContainer = active?.data.current?.sortable.containerId
    const overContainer = over.data.current?.sortable.containerId || over.id
    const activeIndex = active?.data.current?.sortable.index
    const overIndex =
      over.id in grids
        ? grids[overContainer].length - 1
        : over.data.current?.sortable.index

    const updated: Record<string, any> = produce(grids, (draft: any) => {
      if (activeContainer === overContainer) {
        draft[overContainer] = arrayMove(
          draft[overContainer],
          activeIndex,
          overIndex
        )
      } else {
        const [item] = draft[activeContainer].splice(activeIndex, 1)
        draft[overContainer].splice(overIndex, 0, item)
      }
    })

    setGrids(updated)
    if (updated && overContainer && updated[overContainer]) {
      addTaskToUpdate(
        updated[overContainer][overIndex],
        updated[overContainer][overIndex - 1],
        updated[overContainer][overIndex + 1],
        overContainer,
        data,
        setTaskUpdate
      )
    }
  }

  setActiveId(undefined)
}
