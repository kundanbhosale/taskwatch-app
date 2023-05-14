import React, { Fragment } from 'react'
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import styled from 'styled-components'
import KanbanColumns from './columns'
import { KanbanProvider, useKanban } from './contexts/context'
import KanbanRows from './rows'
import KanbanGrids from './grids'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

const KanbanScreen = () => {
  const { rows } = useKanban()
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

  return (
    <Fragment>
      <KanbanColumns hasRows={rows?.length > 1} />
      <Wrapper>
        {rows?.length > 1 && <KanbanRows />}
        <DndContext sensors={sensors}>
          <KanbanGrids />
        </DndContext>
      </Wrapper>
    </Fragment>
  )
}

const Kanban = () => {
  return (
    <KanbanProvider>
      <KanbanScreen />
    </KanbanProvider>
  )
}

export default Kanban

const Wrapper = styled.div`
  display: flex;
  margin-bottom: 2em;
`
