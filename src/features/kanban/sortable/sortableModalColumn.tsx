import ColorPicker from '@components/forms/colorPicker'
import { CustomFormInput } from '@components/forms/customInput'
import { DraggableAttributes } from '@dnd-kit/core'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { Theme } from '@styled/theme'
import Icon from '@svgs/Icon'
import { useMemo, Fragment, useCallback } from 'react'
import { CSS } from '@dnd-kit/utilities'
import styled from 'styled-components'
import { TaskColumn, TaskColumnChildren } from '@db/taskcolumns'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { calLexoRank } from '@utils/lexoRank'
import { ColumnForm } from '@typings/kanban'

interface ListProps {
  item: TaskColumn // Data of item
  index: number // Index of the list item
  handleRestore?: (_val: string) => void // Optional function to restore a deleted item
  handleDelete?: (_val: string) => void // Optional function to delete an item
  listeners?: SyntheticListenerMap | undefined // Synthetic event listeners for drag and drop
  attributes?: DraggableAttributes // Attributes for the list item element
  setNodeRef?: (node: HTMLElement | null) => void // Ref for the list item element
  style?: React.CSSProperties // Style object for the list item element
  deletedIds: string[]
  setDeletedIds: React.Dispatch<React.SetStateAction<string[]>>
}

export const PrimaryColDmmy = ({
  item,
  deletedIds,
}: {
  item: TaskColumn
  deletedIds: string[]
}) => {
  return (
    <Wrapper>
      <SingleItemDummy item={item} deletedIds={deletedIds} />
      {item.childrens.length > 0 && (
        <SubList>
          {item.childrens.map((child, idx) => (
            <SingleItemDummy key={idx} item={child} deletedIds={deletedIds} />
          ))}
        </SubList>
      )}
    </Wrapper>
  )
}

export const SingleItemDummy = ({
  item,
  deletedIds,
}: {
  item: TaskColumn | TaskColumnChildren
  deletedIds: string[]
}) => {
  if (!item) return null
  const isDeleted = deletedIds.includes(item.id)

  return (
    <Item
      className={`shadow ${isDeleted ? 'deleted-item' : ''}`}
      style={{ background: Theme.colors.white }}
    >
      <span className="hover-color-primary">
        <Icon type="drag" />
      </span>
      <p style={{ fontWeight: 600 }}>{item.title}</p>
      <PickerHead style={{ background: item.color }}></PickerHead>
      <Fragment>
        {isDeleted ? (
          <span className="hover-color-primary">
            <Icon type="go-back" width={18} height={18} />
          </span>
        ) : (
          <span className="hover-color-danger">
            <Icon type="delete" width={18} height={18} />
          </span>
        )}
      </Fragment>
    </Item>
  )
}

export const PrimaryCol = (props: ListProps) => {
  const { control } = useFormContext<ColumnForm>()

  const { fields, prepend } = useFieldArray({
    control,
    name: `columns.${props.index}.childrens`,
    keyName: 'key',
  })

  const handleAddSubCol = () => {
    const subCol = new TaskColumnChildren({
      title: 'Untitled',
      color: Theme.shades.primary[200],
      rank: calLexoRank(undefined, fields[0]?.rank || undefined).toString(),
    })
    prepend(subCol)
  }

  const handleDeleteSub = useCallback((colId: string) => {
    if (colId) {
      props.setDeletedIds((prev) =>
        prev.includes(colId) ? prev : [...prev, colId]
      )
    }
  }, [])

  const handleRestoreSub = useCallback((colId: string) => {
    if (colId) {
      props.setDeletedIds((prev) => prev.filter((p) => p !== colId))
    }
  }, [])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.item.id,
    disabled: props.deletedIds.includes(props.item.id),
  })

  // Style object for the list item element
  const style = useMemo(
    () => ({
      transform: CSS.Translate.toString(transform), // Transform property for drag and drop
      transition, // Transition property for drag and drop
      backgroundColor: isDragging ? Theme.shades.primary[300] : undefined, // Background color for dragging state
      opacity: isDragging ? 0.5 : undefined, // Opacity for dragging state
      touchAction: 'none',
    }),
    [isDragging, transform, transition]
  )

  return (
    <Wrapper ref={setNodeRef} style={style}>
      <SingleItem
        deletedIds={props.deletedIds}
        item={props.item}
        index={props.index}
        handleRestore={props.handleRestore}
        handleDelete={props.handleDelete}
        attributes={attributes}
        listeners={listeners}
      />
      <AddSubItem
        className="sub-add hover-color-primary"
        style={props.style}
        onClick={handleAddSubCol}
      >
        <Icon type="add" width={15} height={15} /> Add Sub Column
      </AddSubItem>
      <SortableContext id={`${props.index}.childrens`} items={fields}>
        <SubList>
          {fields.map((child, idx) => (
            <SubColumn
              deletedIds={props.deletedIds}
              key={child.key}
              item={child}
              index={`${props.index}.childrens.${idx}`}
              handleRestore={handleRestoreSub}
              handleDelete={handleDeleteSub}
            />
          ))}
        </SubList>
      </SortableContext>
    </Wrapper>
  )
}

const SubColumn = (
  props: Pick<ListProps, 'deletedIds' | 'handleDelete' | 'handleRestore'> & {
    item: TaskColumnChildren
    index: string
  }
) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.item.id,
    disabled: props.deletedIds.includes(props.item.id),
  })

  // Style object for the list item element
  const style = useMemo(
    () => ({
      transform: CSS.Translate.toString(transform), // Transform property for drag and drop
      transition, // Transition property for drag and drop
      backgroundColor: isDragging ? Theme.shades.primary[300] : undefined, // Background color for dragging state
      opacity: isDragging ? 0.5 : undefined, // Opacity for dragging state
      touchAction: 'none',
    }),
    [isDragging, transform, transition]
  )

  return (
    <div ref={setNodeRef} style={style}>
      <SingleItem {...props} attributes={attributes} listeners={listeners} />
    </div>
  )
}

// Component for a single sortable row in the list
export const SingleItem = ({
  deletedIds,
  item,
  index,
  handleRestore,
  handleDelete,
  attributes,
  listeners,
}: Pick<
  ListProps,
  'deletedIds' | 'handleRestore' | 'handleDelete' | 'attributes' | 'listeners'
> & { item: TaskColumn | TaskColumnChildren; index: number | string }) => {
  const isDeleted = deletedIds.includes(item.id)

  return (
    // Render the list item component

    <Item className={isDeleted ? 'deleted-item' : ''}>
      <span
        className="hover-color-primary"
        style={{ cursor: 'grab' }}
        {...listeners}
        {...attributes}
      >
        <Icon type="drag" />
      </span>
      <CustomFormInput name={`columns.${index}.title`} />
      <span className="color-picker">
        <ColorPicker
          name={`columns.${index}.color`}
          position={{ left: 'auto', right: 0 }}
        />
      </span>
      <Fragment>
        {isDeleted ? (
          <span
            className="hover-color-primary"
            onClick={() => handleRestore && handleRestore(item.id)}
          >
            <Icon type="go-back" width={18} height={18} />
          </span>
        ) : handleDelete ? (
          <span
            className="hover-color-danger"
            onClick={() => handleDelete(item.id)}
          >
            <Icon type="delete" width={18} height={18} />
          </span>
        ) : null}
      </Fragment>
    </Item>
  )
}

const AddSubItem = styled.div`
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  font-weight: 500;
  padding: 0 0.5em;
  background-color: ${({ theme }) => theme.shades.dark[50]};
  box-shadow: inset 0 0 0 1.5px ${({ theme }) => theme.shades.dark[100]};
  transition: ease-in-out 0.2s;
  cursor: pointer;
  height: 0;
  overflow: hidden;
  user-select: none;
`

const Item = styled.div`
  display: grid;
  grid-template-columns: 20px auto 55px 30px;
  align-items: center;
  border: 1.5px solid ${({ theme }) => theme.shades.dark[100]};
  padding: 0.7em 0.4em;
  column-gap: 10px;

  &.deleted-item {
    background-color: ${({ theme }) => theme.shades.danger[100]};
    border-color: ${({ theme }) => theme.shades.danger[300]};

    .gf-custom-input,
    .color-picker {
      pointer-events: none;
      user-select: none;
      opacity: 0.7;
    }
  }
  span {
    display: grid;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .gf-custom-input {
    font-size: 0.875rem;
    font-weight: 600;
  }
`

const SubList = styled.div`
  position: relative;
  margin-left: 2em;
  /* padding: 0.5em 0; */
  &:before {
    content: '';
    display: block;
    position: absolute;
    height: calc(100% - 1.6em);
    width: 2px;
    background-color: ${({ theme }) => theme.shades.dark[100]};
    left: -1em;
    top: 0;
  }
  ${Item} {
    position: relative;
    &:before {
      content: '';
      display: block;
      position: absolute;
      height: 2px;
      width: 1em;
      background-color: ${({ theme }) => theme.shades.dark[100]};
      left: -1em;
      top: 50%;
    }
  }
`

const Wrapper = styled.div`
  margin-bottom: 0.5em;
  position: relative;
  &.focused,
  &:hover {
    ${AddSubItem} {
      height: 30px;
    }
  }
`

const PickerHead = styled.div`
  display: block;
  width: 50px;
  height: 30px;
  outline: 1.5px solid ${({ theme }) => theme.shades.dark[200]};
  outline-offset: 1px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    outline-color: ${({ theme }) => theme.shades.primary[700]};
  }
`
