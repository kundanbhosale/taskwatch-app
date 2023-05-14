import React, {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import produce from 'immer'
import styled from 'styled-components'
import EditModal from '../modals'
import useKanbanObserver from '../hooks/observerHook'
import { TaskBoard, getTaskboard } from '@db/taskboard'
import { useParams, useSearchParams } from 'react-router-dom'
import { getTasksColumnsByBoardId } from '@db/taskcolumns'
import { getTasKRowsByBoardId } from '@db/taskrows'
import { TaskItem, addTaskItem, getTasksByBoardId } from '@db/taskitems'
import { calLexoRank, sortByLexoRankAsc } from '@utils/lexoRank'
import { PrimaryLoader } from '@styled/loader'
import {
  BoardEditing,
  BoardView,
  IBoardContext,
  SortTypes,
} from '@typings/kanban'
import KanbanNav from '../navigation'
import { TaskBoardSettings } from '@db/tasksettings'
import { Theme } from '@styled/theme'
import { LexoRank } from 'lexorank'
import { debounce } from 'debounce'
import { deepCompare } from '@utils/deepCompare'
import { handleTaskUpdate } from '../utils/task'
import { createGridId } from '../utils/grid'

const KanbanContext = React.createContext<IBoardContext>({
  data: undefined,
  columns: [],
  rows: [],
  subColumns: {},
  grids: {},
  colors: [],
  columnCount: 0,
  loading: false,
  setTaskUpdate: (_val: any) => {},
  setSubColumns: (_val: any) => {},
  setEditing: (_val: any) => {},
  setColumns: (_val: any) => {},
  setGrids: (_val: any) => {},
  setRows: (_val: any) => {},
  handleTask: (_val: any) => {},
})

export const KanbanProvider = ({ children }: { children: ReactNode }) => {
  const [rows, setRows] = useState<IBoardContext['rows']>([])
  const [columns, setColumns] = useState<IBoardContext['columns']>([])
  const [subColumns, setSubColumns] = useState<IBoardContext['subColumns']>({})
  const [grids, setGrids] = useState<IBoardContext['grids']>({})
  const [loading, setLoading] = useState(false)
  const [sortType, setSortType] = useState<SortTypes>('rank')
  const [view, setView] = useState<BoardView>('board')
  const [taskUpdate, setTaskUpdate] = useState<Array<TaskItem['id']>>([])

  const data = useRef<IBoardContext['data']>(undefined)
  const [columnCount, setColumnCount] =
    useState<IBoardContext['columnCount']>(0)
  const [editing, setEditing] = useState<BoardEditing>(undefined)

  const [searchParams] = useSearchParams()

  const currentView = searchParams.get('view') as BoardView | undefined

  const currentSort = searchParams.get('sort') as SortTypes | undefined

  const colors = [
    Theme.shades.dark[50],
    'rgba(238, 130, 238, 0.30)',
    'rgba(75, 0, 130, 0.30)',
    'rgba(0, 0, 255, 0.30)',
    'rgba(0, 128, 0, 0.30)',
    'rgba(239, 211, 41, 0.30)',
    'rgba(255, 165, 0, 0.30)',
    'rgba(255, 0, 0, 0.30)',
  ]

  const settings: TaskBoardSettings = {
    styles: {
      gaps: {
        row: '20px',
        column: '2px',
      },
      colors: {
        border: 'white',
        card: Theme.colors.white,
      },
    },
  } as any

  const container = useKanbanObserver({
    grids,
    columns,
    rows,
    subColumns,
    data: data.current,
  })

  const params = useParams()

  const board_id = params.id

  const initializeBoard = useCallback(async (id: TaskBoard['id']) => {
    try {
      const boardData = await getTaskboard(id)
      const columnsData = await getTasksColumnsByBoardId(id)
      const itemsData = await getTasksByBoardId(id)
      const rowsData = await getTasKRowsByBoardId(id)

      if (!boardData || !columnsData || !itemsData || !rowsData)
        throw Error('Failed to fetch board data')

      const rowList =
        rowsData?.length > 0 ? sortByLexoRankAsc(rowsData).map((r) => r.id) : []

      const colList: IBoardContext['columns'] = []
      const subcolList: IBoardContext['subColumns'] = {}

      const hasSubs: any = []

      columnsData.length > 0 &&
        sortByLexoRankAsc(columnsData).forEach((c) => {
          colList.push(c.id)
          if (c.childrens?.length > 0) {
            hasSubs.push({ id: c.id, sub: c.childrens[0].id })
            subcolList[c.id] = c.childrens.map((s) => s.id)
          }
        })

      setColumns(colList)
      setSubColumns(subcolList)

      setRows(rowList)

      data.current = {
        settings: settings,
        board: boardData,
        columns: new Map(columnsData.map((item) => [item.id, item])),
        rows: new Map(rowsData.map((item) => [item.id, item])),
        items: new Map(
          itemsData.map((item) => {
            const idx = hasSubs.findIndex((f: any) => f.id === item.status)
            if (idx !== -1) {
              item.status = hasSubs[idx].sub
            }

            return [item.id, item]
          })
        ),
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }, [])

  const mergedCols = useMemo(() => {
    if (!columns || !subColumns) return undefined
    const cols = [...columns]
    Object.keys(subColumns).forEach((key) => {
      const index = cols.indexOf(key)
      if (index === -1) return

      cols.splice(index, 1, ...subColumns[key])
    })

    setColumnCount(cols.length)
    return cols
  }, [columns, subColumns])

  const updateGrids = useCallback(() => {
    if (!columns || !mergedCols) return undefined
    const cols = mergedCols

    if (!cols) return
    const list: TaskItem[] =
      (data.current && Array.from(data.current.items.values())) || []

    const newGrids = produce({}, (draft: IBoardContext['grids']) => {
      rows.forEach((row) => {
        return cols.forEach((col) => {
          const filtered = list.filter(
            (item) => item.status === col && item.group === row
          )
          const sorted = sortByLexoRankAsc(filtered).map((m) => m.id) as any
          draft[col + '--' + row] = sorted
        })
      })
    })

    setGrids(newGrids)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, mergedCols])

  useEffect(() => {
    if (loading || !board_id) return
    setLoading(true)
    initializeBoard(board_id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!currentSort) return
    setSortType(currentSort)
  }, [currentSort])

  useEffect(() => {
    if (!currentView) return
    setView(currentView)
  }, [currentView])

  useEffect(() => {
    updateGrids()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedCols, rows])

  const handleTask: IBoardContext['handleTask'] = debounce(async (initial) => {
    const gridId = initial.status.id + '--' + initial.group.id

    const taskData = {
      title: initial.title,
      status: initial.status.id,
      group: initial.group.id,
      board_id: data.current?.board.id as string,
      fields: {
        priority: initial.priority,
        start_date: initial.start_date,
        due_date: initial.due_date,
      },
    }

    if (!initial.id) {
      const hasItems = grids[gridId].length > 0

      let rank = LexoRank.middle().toString()

      if (hasItems) {
        const lastRank = data.current?.items.get(grids[gridId][0] as any)?.rank
        if (lastRank) rank = calLexoRank(undefined, lastRank).toString()
      }
      const newTask = await addTaskItem({ ...taskData, rank })
      if (!newTask) return
      data.current?.items.set(newTask.id, newTask)
      setGrids((prev) => {
        const updated = produce(prev, (draft: IBoardContext['grids']) => {
          draft[gridId].unshift(newTask.id as string)
        })
        return updated
      })

      setEditing((prev: any) => {
        return prev?.id === 'new' ? { type: 'task', id: newTask.id } : prev
      })
    } else {
      const oldItem = data.current?.items.get(initial.id)
      if (!oldItem) return

      const newItem = { ...oldItem, ...taskData }
      const equal = deepCompare(oldItem, newItem)
      if (equal) return

      const oldGrId = createGridId(oldItem.group, oldItem.status)
      const newGridId = createGridId(newItem.group, newItem.status)

      if (oldGrId !== newGridId) {
        setGrids((prev) => {
          return produce(prev, (draft) => {
            const oldIdx = draft[oldGrId].indexOf(newItem.id)

            if (oldIdx === -1) return
            const [removed] = draft[oldGrId].splice(oldIdx, 1)
            if (removed) {
              let rank

              if (draft[newGridId].length > 0) {
                const item = data.current?.items.get(draft[newGridId][0])
                rank = calLexoRank(undefined, (item && item.rank) || undefined)
              } else {
                rank = LexoRank.middle()
              }
              newItem.rank = rank.toString()
              draft[newGridId].unshift(removed)
            }
          })
        })
      }

      setTaskUpdate(
        (prev) =>
          (prev.indexOf(initial.id || '') === -1
            ? [...prev, initial.id]
            : prev) as any
      )
      data.current?.items.set(initial.id, newItem)
    }
  }, 1000)

  useEffect(() => {
    if (taskUpdate.length === 0 || !data.current) return
    const timer = setTimeout(() => {
      setTaskUpdate([])
      handleTaskUpdate(taskUpdate, data.current)
    }, 1500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskUpdate, data.current])

  return (
    <KanbanContext.Provider
      value={{
        data: data.current,
        loading,
        columns,
        rows,
        grids,
        colors,
        subColumns,
        columnCount,
        setEditing,
        setColumns,
        setGrids,
        setRows,
        setSubColumns,
        handleTask,
        setTaskUpdate,
      }}
    >
      {loading ? (
        <PrimaryLoader />
      ) : (
        <Fragment>
          <EditModal editing={editing} setEditing={setEditing} />
          <KanbanNav view={view} sortType={sortType} />
          <Wrapper ref={container}>{children}</Wrapper>
        </Fragment>
      )}
    </KanbanContext.Provider>
  )
}

export const useKanban = () => {
  const context = React.useContext(KanbanContext)
  return context
}

const Wrapper = styled.div`
  display: block;
  width: calc(100vw - 2%);
  height: calc(100vh - 50px);
  margin: auto;
  padding: 0 1em 0 0;
  overflow: scroll;
`
