import { DarkButton } from '@styled/button'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form'
import { useKanban } from '../contexts/context'
import { idGenerate } from '@utils/idGenerate'
import { rowSchema } from '@validations/kanban'
import { useYupResolver } from '@hooks/yupResolver'
import { ColumnForm } from '@typings/kanban'
import styled from 'styled-components'
import Icon from '@svgs/Icon'
import { BorderBox } from '@styled/borderBox'
import { calLexoRank, sortByLexoRankAsc } from '@utils/lexoRank'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Theme } from '@styled/theme'
import {
  TaskColumn,
  TaskColumnChildren,
  updateMultiColumns,
} from '@db/taskcolumns'
import {
  PrimaryCol,
  PrimaryColDmmy,
  SingleItemDummy,
} from '../sortable/sortableModalColumn'
import { compareArraysByIds } from '@utils/deepCompare'
import { deleteMultiColumns } from '@db/trash'
import { TaskItem } from '@db/taskitems'
import { createGridId } from '../utils/grid'
import produce from 'immer'
import { DeleteAlert } from '@components/modals/alert'

const ColumnModal = () => {
  const {
    data,
    setEditing,
    setColumns,
    columns: initalColumns,
    subColumns: initalSubColumns,
    setSubColumns,
    setGrids,
  } = useKanban()
  const [deletedIds, setDeletedIds] = useState<Array<TaskColumn['id']>>([])
  const [activeId, setActiveId] = useState<string | undefined>(undefined)
  const [confirm, setConfirm] = useState(true)

  const formId = idGenerate('form')
  const resolver = useYupResolver(rowSchema)

  const defaultValues = {
    columns: [],
  }

  const methods = useForm<ColumnForm>({
    mode: 'onChange',
    defaultValues,
    resolver,
  })

  const colData: TaskColumn[] = useMemo(() => {
    if (!initalColumns || !data?.columns) return []
    return initalColumns.map((r) => data.columns.get(r)) as TaskColumn[]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initalColumns, initalSubColumns])

  const { handleSubmit, reset, control, setValue, watch } = methods
  const { fields, prepend } = useFieldArray({
    control,
    name: 'columns',
    keyName: 'key',
  })

  const watchedCols = useWatch({ control, name: 'columns' })

  const handleSave = async (formData: ColumnForm) => {
    const { columns } = formData

    const colsTaskIdsToUpdate: Record<string, string> = {}

    columns.forEach((r) => {
      deletedIds.forEach((d) => {
        if (r.childrens.length > 0) {
          // Finds Index of children by comparing to delete Id
          const idx = r.childrens.findIndex((c) => c.id === d)
          if (idx !== -1) {
            colsTaskIdsToUpdate[d] = idx > 0 ? r.childrens[0].id : r.id
            r.childrens.splice(idx, 1)
          }
        }
      })
    })

    const result = compareArraysByIds(
      columns.filter((r) => !deletedIds.includes(r.id)),
      colData
    )

    if (result.updated.length > 0 || result.removed.length > 0) {
      if (result.updated.length > 0) {
        result.updated.forEach((r) => {
          data?.columns?.set(r.id, r)

          // Check if children length is 1 and if it includes in old col data, if yes then we push child id to colsTaskToUpdate
          if (r.childrens.length === 1) {
            const old = colData.find((c) => c.id === r.id)
            if (!old?.childrens || old?.childrens.includes(r.childrens[0]))
              return
            colsTaskIdsToUpdate[r.id] = r.childrens[0].id
          }
        })

        const updatedTasks: TaskItem[] = []
        const gridsToUpdate: Record<string, string[]> = {}

        if (Object.keys(colsTaskIdsToUpdate).length > 0) {
          data?.items.forEach((item) => {
            if (!colsTaskIdsToUpdate[item.status]) return
            item.status = colsTaskIdsToUpdate[item.status]

            data.items.set(item.id, item)

            updatedTasks.push(item)

            const gridId = createGridId(item.group, item.status)
            if (gridId in gridsToUpdate) {
              gridsToUpdate[gridId].push(item.id)
            } else {
              gridsToUpdate[gridId] = [item.id]
            }
          })
        }

        if (Object.keys(gridsToUpdate).length > 0) {
          setGrids((prev) => {
            return produce(prev, (draft) => {
              Object.keys(gridsToUpdate).forEach((g) => {
                draft[g] = gridsToUpdate[g]
              })
            })
          })
        }
        await updateMultiColumns(result.updated, updatedTasks)
      }

      if (result.removed.length > 0) {
        // Dont Delete if only one col left
        if (result.removed.length === colData.length) {
          result.removed.splice(0, 1)
        }

        const taskIds = await deleteMultiColumns(result.removed)
        if (taskIds && taskIds.length > 0) {
          taskIds.forEach((t) => {
            data?.items.delete(t)
          })
        }
        result.removed.forEach((r) => data?.columns?.delete(r))
      }

      if (data?.columns) {
        const list = sortByLexoRankAsc([...data?.columns.values()])
        const subCols: Record<string, any> = {}
        const cols = list.map((l) => {
          l.childrens.length > 0 &&
            (subCols[l.id] =
              l.childrens.map((c: TaskColumnChildren) => c.id) || [])
          return l.id
        })
        setColumns(cols)
        setSubColumns(subCols)
      }
    }

    setEditing(undefined)
  }

  useEffect(() => {
    if (!colData) return
    reset({ columns: colData })

    return () => {
      reset({ columns: [] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colData])

  const handleNew = useCallback(() => {
    if (!data?.board.id) return
    const newItem = new TaskColumn({
      title: 'Untitled',
      board_id: data!.board.id,
      color: Theme.shades.primary[500],
      rank: calLexoRank(undefined, fields[0]?.rank || undefined).toString(),
      childrens: [],
    })
    prepend(newItem)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields])

  const handleDelete = useCallback((rowid: string) => {
    if (rowid) {
      setDeletedIds((prev) => (prev.includes(rowid) ? prev : [...prev, rowid]))
    }
  }, [])

  const handleRestore = useCallback((rowid: string) => {
    if (rowid) {
      setDeletedIds((prev) => prev.filter((p) => p !== rowid))
    }
  }, [])

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(undefined)
      if (!over || !active || active?.id === over?.id) return
      const activeIndex = active?.data.current?.sortable.index
      const overIndex =
        over?.data?.current?.sortable.index !== undefined
          ? over?.data?.current?.sortable.index
          : watchedCols.length - 1
      const activeContainer = active.data.current?.sortable.containerId
      const list = watchedCols //fields
      if (activeContainer === 'primary-columns') {
        const [removed] = list.splice(activeIndex, 1)

        list.splice(overIndex, 0, removed)

        list[overIndex].rank = calLexoRank(
          list[overIndex - 1]?.rank,
          list[overIndex + 1]?.rank
        ).toString()
      } else {
        const [idx, field] = activeContainer.split('.')
        const childrens = (list as any)[parseInt(idx)][field]
        if (childrens) {
          const [removed] = childrens.splice(activeIndex, 1)
          childrens.splice(overIndex, 0, removed)
        }
      }
      setValue('columns', list)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [watchedCols]
  )

  const onSubmit = () => {
    if (deletedIds.length > 0) {
      setConfirm(false)
    } else {
      handleSubmit(handleSave)()
    }
  }

  if (!confirm) {
    return (
      <DeleteAlert
        title="Are you sure you want to delete columns(s)?"
        summary="Columns(s) will be moved to trash or to previous (primary) column if exist."
        onCancel={() => setEditing(undefined)}
        onConfirm={() => handleSubmit(handleSave)()}
      />
    )
  }

  return (
    <Fragment>
      <FormProvider {...methods}>
        <div className="modal-content p-1">
          <form onSubmit={handleSubmit(onSubmit)} id={formId}>
            <Wrapper>
              <h3 className="mb-1">Columns</h3>
              <AddNew className="hover-color-primary" onClick={handleNew}>
                <Icon type="add" width={25} height={25} /> Add New
              </AddNew>
              <DndContext
                sensors={sensors}
                onDragStart={({ active }) => {
                  setActiveId(
                    (active.data.current?.sortable.containerId +
                      '--' +
                      active.id) as string
                  )
                }}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  id={'primary-columns'}
                  items={fields}
                  strategy={verticalListSortingStrategy}
                >
                  {fields.map((item, i) => {
                    const isDeleted = deletedIds.indexOf(item.id) !== -1
                    return (
                      <PrimaryCol
                        key={item.key}
                        index={i}
                        item={item}
                        handleDelete={
                          deletedIds.length === fields.length - 1 && !isDeleted
                            ? undefined
                            : handleDelete
                        }
                        handleRestore={handleRestore}
                        deletedIds={deletedIds}
                        setDeletedIds={setDeletedIds}
                      />
                    )
                  })}
                </SortableContext>
                <DragOverlay className="drag-overlay">
                  <RenderOverlay activeId={activeId} deletedIds={deletedIds} />
                </DragOverlay>
              </DndContext>
            </Wrapper>
          </form>
        </div>
        <div className="modal-foot">
          <DarkButton size="lg" width="100%" center type="submit" form={formId}>
            Save Changes
          </DarkButton>
        </div>
      </FormProvider>
    </Fragment>
  )
}

const RenderOverlay = ({
  activeId,
  deletedIds,
}: {
  activeId: string | undefined
  deletedIds: string[]
}) => {
  const { getValues } = useFormContext<ColumnForm>()

  const fields = useMemo(() => {
    if (!activeId) return

    return getValues('columns')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  if (!activeId || !fields) return null

  const [container, id] = activeId.split('--')

  if (container === 'primary-columns') {
    const item = fields.find((f) => f.id === id)
    return item ? <PrimaryColDmmy item={item} deletedIds={deletedIds} /> : null
  } else {
    const [idx, field] = container.split('.')

    const item =
      (fields as any)[idx][field].find((f: any) => f.id === id) || undefined

    return item ? <SingleItemDummy item={item} deletedIds={deletedIds} /> : null
  }
}

export default ColumnModal

const Wrapper = styled.div``

const AddNew = styled(BorderBox)`
  padding: 0.7em 0.4em;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-bottom: 1em;
  cursor: pointer;
  color: ${({ theme }) => theme.shades.dark[700]};
  user-select: none;
`
