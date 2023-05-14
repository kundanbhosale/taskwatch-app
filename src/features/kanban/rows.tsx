import React, { Fragment } from 'react'
import styled from 'styled-components'
import { useKanban } from './contexts/context'
import { Theme } from '@styled/theme'

const SingleRow = ({ id }: { id: string }) => {
  const { data, setEditing } = useKanban()
  const row = data?.rows.get(id)
  if (!row) return null
  return (
    <div
      id={id}
      className="rows"
      style={{ background: row.color || Theme.shades.dark[50] }}
      onClick={() => setEditing({ id, type: 'row' })}
    >
      <p>{row.title}</p>
    </div>
  )
}

const KanbanRows = () => {
  const { rows, data } = useKanban()
  const style: React.CSSProperties = {}

  style.rowGap = data?.settings?.styles.gaps.row
  style.marginTop = data?.settings?.styles.gaps.row

  return (
    <Wrapper
      gap={data?.settings?.styles.gaps.column || '2px'}
      color={data?.settings?.styles.colors.border || Theme.shades.dark[900]}
      id="row-wrapper"
      style={style}
    >
      {rows.map((row, i) => (
        <Fragment key={i}>
          <SingleRow id={row} />
        </Fragment>
      ))}
    </Wrapper>
  )
}

export default KanbanRows

const Wrapper = styled.div<{ gap: string; color: string }>`
  display: grid;
  grid-template-columns: 40px;
  .rows {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    transform: rotate(-180deg);
    writing-mode: vertical-lr;
    text-orientation: sideways-right;
    border-radius: 0 0.3em 0.3em 0;
    box-shadow: ${({ gap, color }) => `inset ${gap} 0 0 0 ${color}`};

    &:hover {
      backdrop-filter: brightness(0.95);
    }
    p {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 1em 0;
      font-weight: 500;
    }

    &:hover {
      .action-wrapper {
        opacity: 1;
        visibility: visible;
      }
    }
  }
`
