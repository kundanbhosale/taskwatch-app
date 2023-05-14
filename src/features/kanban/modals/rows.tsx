import { DarkButton } from '@styled/button'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useKanban } from '../contexts/context'
import { idGenerate } from '@utils/idGenerate'
import { rowSchema } from '@validations/kanban'
import { useYupResolver } from '@hooks/yupResolver'
import { TaskRow, updateMultiRows } from '@db/taskrows'
import { RowForm } from '@typings/kanban'
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
import { compareArraysByIds } from '@utils/deepCompare'
import { ListItem, SortableRow } from '../sortable/sortableModalRow'
import { deleteMultiRows } from '@db/trash'
import { DeleteAlert } from '@components/modals/alert'

const RowModal = () => {
  const { data, setEditing, setRows, rows: initalRows } = useKanban()
  const [deletedIds, setDeletedIds] = useState<Array<TaskRow['id']>>([])
  const [activeId, setActiveId] = useState<string | undefined>(undefined)
  const [confirm, setConfirm] = useState(true)
  const formId = idGenerate('form')
  const resolver = useYupResolver(rowSchema)

  const defaultValues = {
    rows: [],
  }

  const methods = useForm<RowForm>({
    mode: 'onChange',
    defaultValues,
    resolver,
  })

  const rowData: TaskRow[] = useMemo(() => {
    if (!initalRows || !data?.rows) return []
    return initalRows.map((r) => data.rows.get(r)) as TaskRow[]
  }, [initalRows])

  const { handleSubmit, reset, control, getValues } = methods

  const { fields, prepend, move, update } = useFieldArray({
    control,
    name: 'rows',
    keyName: 'key',
  })
  const watchedRows = useWatch({ control, name: 'rows' })

  const handleSave = async (formData: RowForm) => {
    const { rows } = formData

    const result = compareArraysByIds(
      rows.filter((r) => !deletedIds.includes(r.id)),
      rowData
    )

    if (result.updated.length > 0 || result.removed.length > 0) {
      if (result.updated.length > 0) {
        await updateMultiRows(result.updated)
        result.updated.forEach((r) => data?.rows?.set(r.id, r))
      }

      if (result.removed.length > 0) {
        if (result.removed.length === rowData.length) {
          result.removed.splice(0, 1)
        }

        const taskIds = await deleteMultiRows(result.removed)
        if (taskIds && taskIds.length > 0) {
          taskIds.forEach((t) => {
            data?.items.delete(t)
          })
        }
        result.removed.forEach((r) => data?.rows?.delete(r))
      }

      if (data?.rows) {
        const list = sortByLexoRankAsc([...data?.rows.values()])
        setRows(list.map((l) => l.id))
      }
    }

    setEditing(undefined)
  }

  const onSubmit = () => {
    if (deletedIds.length > 0) {
      setConfirm(false)
    } else {
      handleSubmit(handleSave)()
    }
  }

  useEffect(() => {
    if (!rowData) return
    reset({ rows: rowData })

    return () => {
      reset({ rows: [] })
    }
  }, [rowData])

  const handleNew = useCallback(() => {
    if (!data?.board.id) return
    const newItem = new TaskRow({
      title: 'Untitled',
      board_id: data!.board.id,
      color: Theme.shades.primary[500],
      rank: calLexoRank(undefined, fields[0].rank || undefined).toString(),
    })
    prepend(newItem)
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
        distance: 1,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(undefined)

      if (active?.id === over?.id) return
      const activeIndex = active?.data.current?.sortable.index
      const overIndex =
        over?.data?.current?.sortable.index !== undefined
          ? over?.data?.current?.sortable.index
          : watchedRows.length - 1
      const curr = watchedRows[activeIndex]

      move(activeIndex, overIndex)
      const [prevRank, nextRank] = getValues([
        `rows.${overIndex - 1}.rank`,
        `rows.${overIndex + 1}.rank`,
      ]) as any
      if (!curr) return
      const newRank = calLexoRank(prevRank, nextRank).toString()
      curr.rank = newRank
      update(overIndex, curr)
    },
    [watchedRows]
  )

  if (!confirm) {
    return (
      <DeleteAlert
        title="Are you sure you want to delete row(s)?"
        summary="Rows(s) will be moved to trash."
        onCancel={() => setEditing(undefined)}
        onConfirm={() => handleSubmit(handleSave)()}
      />
    )
  }

  return (
    <Fragment>
      <FormProvider {...methods}>
        <div className="modal-content p-1">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit()
            }}
            id={formId}
          >
            <Wrapper>
              <h3 className="mb-1">Rows</h3>
              <AddNew className="hover-color-primary" onClick={handleNew}>
                <Icon type="add" width={25} height={25} /> Add New
              </AddNew>
              <DndContext
                sensors={sensors}
                onDragStart={({ active }) => setActiveId(active.id as string)}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields}
                  strategy={verticalListSortingStrategy}
                >
                  {fields.map((item, i) => {
                    const isDeleted = deletedIds.indexOf(item.id) !== -1
                    return (
                      <SortableRow
                        key={item.key}
                        isDeleted={isDeleted}
                        index={i}
                        id={item.id}
                        handleDelete={
                          deletedIds.length === fields.length - 1 && !isDeleted
                            ? undefined
                            : handleDelete
                        }
                        handleRestore={handleRestore}
                      />
                    )
                  })}
                </SortableContext>
                <DragOverlay className="drag-overlay shadow">
                  {activeId && (
                    <ListItem
                      id={activeId}
                      index={fields.findIndex((f) => f.id === activeId)}
                      isDeleted={false}
                      style={{ background: Theme.colors.white }}
                      handleDelete={
                        deletedIds.length === fields.length - 1 &&
                        !deletedIds.includes(activeId)
                          ? undefined
                          : handleDelete
                      }
                    />
                  )}
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

export default RowModal

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
