import React, { Fragment, useEffect } from 'react'
import styled from 'styled-components'
import SingleKanbanItem from './singleItem'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { useKanban } from './contexts/context'
import { Theme } from '@styled/theme'

const KanbanSingleGrid = ({
  gridId,
  items,
  rowLast,
}: {
  gridId: string
  items: string[]
  rowLast: boolean
}) => {
  const { data } = useKanban()
  const [col, row] = gridId.split('--')
  const { setNodeRef, node, active } = useDroppable({ id: gridId })

  useEffect(() => {
    if (!node.current || node.current.childNodes.length === 0) return
  }, [active])

  const style: React.CSSProperties = {}

  if (rowLast) {
    style.borderRadius = '0 0.3em 0.3em 0'
  }

  return (
    <Wrapper
      id={gridId}
      style={style}
      gap={data?.settings?.styles.gaps.column || '2px'}
      color={data?.settings?.styles.colors.border || Theme.shades.dark[900]}
    >
      <SortableContext
        id={gridId}
        items={items}
        strategy={verticalListSortingStrategy}
        disabled={!gridId}
      >
        <ListWrapper data-row={row} data-col={col} ref={setNodeRef}>
          {items.map((item, i) => (
            <Fragment key={i}>
              <SingleKanbanItem id={item} />
            </Fragment>
          ))}
        </ListWrapper>
      </SortableContext>
    </Wrapper>
  )
}

export default KanbanSingleGrid

const Wrapper = styled.div<{ gap: string; color: string }>`
  display: block;
  overflow: hidden;
  min-height: 50px;
  box-shadow: ${({ gap, color }) => `-${gap} 0 0 0 ${color}`};
`

const ListWrapper = styled.div`
  height: 100%;
  padding: 1em 0.5em;
`
