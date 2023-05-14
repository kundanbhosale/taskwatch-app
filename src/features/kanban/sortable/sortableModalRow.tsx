import ColorPicker from '@components/forms/colorPicker'
import { CustomFormInput } from '@components/forms/customInput'
import { DraggableAttributes } from '@dnd-kit/core'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { Theme } from '@styled/theme'
import Icon from '@svgs/Icon'
import { useMemo, Fragment } from 'react'
import { CSS } from '@dnd-kit/utilities'
import styled from 'styled-components'

interface ListProps {
  id: string // ID of the list item
  index: number // Index of the list item
  isDeleted: boolean // Flag indicating if the item has been deleted
  handleRestore?: (_val: string) => void // Optional function to restore a deleted item
  handleDelete?: (_val: string) => void // Optional function to delete an item
  listeners?: SyntheticListenerMap | undefined // Synthetic event listeners for drag and drop
  attributes?: DraggableAttributes // Attributes for the list item element
  setNodeRef?: (node: HTMLElement | null) => void // Ref for the list item element
  style?: React.CSSProperties // Style object for the list item element
}

// Component for a single sortable row in the list
export const SortableRow: React.FC<
  Pick<
    ListProps,
    'index' | 'id' | 'isDeleted' | 'handleDelete' | 'handleRestore'
  >
> = ({ index, id, isDeleted, handleRestore, handleDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isDeleted })

  // Style object for the list item element
  const style = useMemo(
    () => ({
      transform: CSS.Translate.toString(transform), // Transform property for drag and drop
      transition, // Transition property for drag and drop
      backgroundColor: isDragging ? Theme.shades.primary[300] : undefined, // Background color for dragging state
      opacity: isDragging ? 0.5 : undefined, // Opacity for dragging state
    }),
    [isDragging, transform, transition]
  )

  return (
    // Render the list item component
    <ListItem
      id={id}
      index={index}
      isDeleted={isDeleted}
      handleRestore={handleRestore}
      handleDelete={handleDelete}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
      style={style}
    />
  )
}

// Component for a single list item
export const ListItem: React.FC<ListProps> = ({
  id,
  isDeleted,
  handleRestore,
  handleDelete,
  index,
  listeners,
  attributes,
  setNodeRef,
  style,
}) => {
  return (
    // Render the list item element with its contents
    <Item
      className={isDeleted ? 'deleted-item' : ''}
      style={style}
      ref={setNodeRef}
    >
      <span
        className="hover-color-primary"
        style={{ cursor: 'grab' }}
        {...listeners}
        {...attributes}
      >
        <Icon type="drag" />
      </span>
      <CustomFormInput name={`rows.${index}.title`} />
      <span className="color-picker">
        <ColorPicker
          name={`rows.${index}.color`}
          position={{ left: 'auto', right: 0 }}
        />
      </span>
      <Fragment>
        {isDeleted ? (
          <span
            className="hover-color-primary"
            onClick={() => handleRestore && handleRestore(id)}
          >
            <Icon type="go-back" width={18} height={18} />
          </span>
        ) : handleDelete ? (
          <span className="hover-color-danger" onClick={() => handleDelete(id)}>
            <Icon type="delete" width={18} height={18} />
          </span>
        ) : null}
      </Fragment>
    </Item>
  )
}

const Item = styled.div`
  display: grid;
  grid-template-columns: 20px auto 55px 30px;
  align-items: center;
  border: 1.5px solid ${({ theme }) => theme.shades.dark[100]};
  padding: 0.7em 0.4em;
  column-gap: 10px;
  margin-bottom: 0.5em;

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
