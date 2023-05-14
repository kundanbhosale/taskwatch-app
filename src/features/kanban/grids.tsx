import React, { Fragment, useState } from 'react'
import styled from 'styled-components'
import { useKanban } from './contexts/context'
import KanbanSingleGrid from './singleGrid'
import { DragOverlay, useDndMonitor } from '@dnd-kit/core'
import SingleKanbanItem from './singleItem'
import { handleDragEndTask, handleDragOverTask } from './utils/task'
import { Theme } from '@styled/theme'

const KanbanGrids = () => {
  const [activeId, setActiveId] = useState<string | undefined>(undefined)

  const { grids, setGrids, columnCount, data, setTaskUpdate } = useKanban()

  useDndMonitor({
    onDragStart: ({ active }) => setActiveId(active.id as string),
    onDragCancel: () => setActiveId(undefined),
    onDragOver: ({ active, over }) =>
      handleDragOverTask({
        data,
        active,
        over,
        grids,
        setGrids,
        setTaskUpdate,
      }),
    onDragEnd: ({ active, over }) =>
      handleDragEndTask({
        data,
        active,
        over,
        grids,
        setGrids,
        setActiveId,
        setTaskUpdate,
      }),
  })
  const style: React.CSSProperties = {}

  style.gridTemplateColumns = `repeat(${columnCount || 1}, 350px)`

  style.rowGap = data?.settings?.styles.gaps.row
  // style.columnGap = data?.settings.styles.gaps.column

  style.marginTop = data?.settings?.styles.gaps.row

  return (
    <Wrapper
      gap={data?.settings?.styles.gaps.column || '2px'}
      color={data?.settings?.styles.colors.border || Theme.shades.dark[900]}
      style={style}
      id="grid-wrapper"
    >
      {Object.keys(grids).map((key, i) => (
        <Fragment key={i}>
          <KanbanSingleGrid
            gridId={key}
            items={grids[key]}
            rowLast={(i + 1) % columnCount === 0}
          />
        </Fragment>
      ))}
      <DragOverlay>
        {activeId ? <SingleKanbanItem id={activeId} /> : null}
      </DragOverlay>
    </Wrapper>
  )
}

export default KanbanGrids

const Wrapper = styled.div<{ gap: string; color: string }>`
  display: grid;
  width: 100%;
  height: 100%;

  /* :not(:last-child) {
    border-right: inset ${({ gap, color }) => `${gap} solid ${color}`};
  } */
`
