import React, { memo } from 'react'
import styled from 'styled-components'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useKanban } from './contexts/context'
import { StyledLabel } from '@styled/label'
import Icon from '@svgs/Icon'
import dayjs from 'dayjs'
import { StyledGrid } from '@styled/layout'

const SingleKanbanItem = ({ id }: { id: string }) => {
  const { data, setEditing } = useKanban()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    isSorting,
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),

    transition:
      ((isOver || isDragging || isSorting) && transition) || undefined,
    opacity: isDragging ? 0.5 : 1,
  }

  const item = data?.items.get(id)

  if (!item) return null

  const handleClick = () => {
    setEditing({ id, type: 'task' })
  }

  return (
    <Wrapper
      id={id}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div
        className="card"
        onClick={handleClick}
        // style={{ background: data?.settings.styles.colors.card, color: text }}
      >
        <p>{item.title}</p>
        <StyledGrid cols="repeat(auto-fill, minmax(0, auto))">
          {item.fields.priority.id !== 'low' && (
            <StyledLabel color={item.fields.priority.color} size="xs">
              {item.fields.priority.id}
            </StyledLabel>
          )}

          {(item.fields.start_date || item.fields.due_date) && (
            <StyledLabel size="xs">
              <Icon type="clock" />
              {item.fields.start_date && item.fields.due_date ? (
                <span>{`${dayjs(item.fields.start_date).format(
                  'MMM DD'
                )} - ${dayjs(item.fields.due_date).format('MMM DD')}`}</span>
              ) : item.fields.start_date ? (
                <span>
                  From {dayjs(item.fields.start_date).format('MMM DD')}
                </span>
              ) : item.fields.due_date ? (
                <span>Due {dayjs(item.fields.due_date).format('MMM DD')}</span>
              ) : null}
            </StyledLabel>
          )}
        </StyledGrid>
      </div>
    </Wrapper>
  )
}

export default memo(SingleKanbanItem)

const Wrapper = styled.div`
  display: flex;
  margin-bottom: 0.5em;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  box-shadow: 3px 3px 5px 0px ${({ theme }) => theme.shades.dark[100]};
  border: 1px solid ${({ theme }) => theme.shades.dark[100]};
  touch-action: none;
  overflow: hidden;

  .card {
    min-height: 50px;
    padding: 0.5em;
    width: 100%;
    display: inline-block;
    cursor: pointer;
    p {
      color: inherit;
      width: 100%;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      margin-bottom: 0.7em;
      word-wrap: break-word;
      word-break: break-word;
    }
  }
`
