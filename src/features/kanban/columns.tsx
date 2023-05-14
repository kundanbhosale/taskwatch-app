import React, { Fragment, useMemo } from 'react'
import styled from 'styled-components'
import { useKanban } from './contexts/context'
import { TaskColumnChildren } from '@db/taskcolumns'
import { Theme } from '@styled/theme'

const SubColumn = ({
  sub,
  count,
}: {
  sub: TaskColumnChildren
  count: number
}) => {
  const style: React.CSSProperties = {}

  style.background = sub.color || Theme.shades.dark[100]

  return (
    <div className="column" style={style} id={sub.id}>
      <p>{sub.title} </p>
      <span>({Number(count)})</span>
    </div>
  )
}

const SingleColumn = ({ id, isLast }: { id: string; isLast: boolean }) => {
  const { data, setEditing, grids } = useKanban()

  const col = data?.columns.get(id)
  const hasChilds = (col?.childrens && col?.childrens.length > 0) || false

  const counts = useMemo(() => {
    if (!grids || Object.keys(grids).length == 0) return {}

    const result: any = {}
    let total = 0

    for (const key in grids) {
      if (!grids.hasOwnProperty(key)) continue
      const [colId, _rowId] = key.split('--')
      if (hasChilds) {
        const item = col?.childrens.find((c) => c.id === colId)
        if (!item) continue
        if (grids[key]) {
          result[String(colId)] =
            (result[colId] ? Number(result[colId]) : 0) + grids[key].length || 0
          total = total + grids[key].length
        }
      } else {
        if (id !== colId) continue
        total = total + grids[key].length
      }
    }
    result['total'] = total

    return result
  }, [grids, id, hasChilds, col])

  if (!col) return null

  const style: React.CSSProperties = {}
  const colGap = data?.settings?.styles.gaps.column || '2px'
  const borderColor =
    data?.settings?.styles.colors.border || Theme.shades.dark[900]
  style.background = col.color || Theme.shades.dark[100]

  style.boxShadow = !isLast
    ? `inset -${colGap} 0 0 0 ${borderColor}`
    : undefined

  return (
    <Column
      id={id}
      onClick={() => setEditing({ id, type: 'column' })}
      borderColor={borderColor}
      gap={colGap}
      isLast={isLast}
    >
      <div className="column" style={style}>
        <p>{col.title}</p>
        <span>({Number(counts?.total)})</span>
      </div>

      {col.childrens?.length > 0 && (
        <div className="sub-columns-wrapper">
          {col.childrens.map((sub: TaskColumnChildren, subIdx: number) => (
            <SubColumn
              key={subIdx}
              sub={sub}
              count={(counts && counts[sub.id as any]) || 0}
            />
          ))}
        </div>
      )}
    </Column>
  )
}

const KanbanColumns = ({ hasRows }: { hasRows: boolean }) => {
  const { columns, data } = useKanban()
  const style: React.CSSProperties = {}
  const first = data?.columns.get(columns[0])
  const color = (columns.length > 0 && hasRows && first?.color) || 'transparent'
  const hasFirstChild = first && first.childrens?.length > 0
  const subColor = (hasFirstChild && first?.childrens[0].color) || color

  const gap = data?.settings?.styles.gaps.column || '2px'
  const borderColor =
    data?.settings?.styles.colors.border || Theme.shades.dark[900]

  const p1Style: React.CSSProperties = {}
  p1Style.background = color
  if (hasFirstChild) {
    p1Style.boxShadow = `inset -${gap} -2px 0 0  ${borderColor}`
  }
  return (
    <Wrapper style={style} id="column-wrapper">
      {hasRows && (
        <PlaceHolder gap={gap} borderColor={borderColor}>
          <span style={p1Style} />

          <span
            style={{
              background: subColor,
            }}
          />
        </PlaceHolder>
      )}
      {columns.map((col, i) => (
        <Fragment key={i}>
          <SingleColumn id={col} isLast={columns.length - 1 === i} />
        </Fragment>
      ))}
    </Wrapper>
  )
}

export default KanbanColumns

const Wrapper = styled.div`
  display: flex;
  overflow: hidden;
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 6px;
  overflow: hidden;
`
const PlaceHolder = styled.div<{ borderColor: string; gap: string }>`
  display: block;
  width: 40px;
  border-bottom: 2px solid ${({ borderColor }) => borderColor};

  > span {
    box-shadow: ${({ borderColor, gap }) =>
      `inset -${gap} 0 0 0  ${borderColor}`};

    display: block;
    height: 50%;
  }
`
const Column = styled.div<{
  gap: string
  borderColor: string
  isLast: boolean
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: auto;
  margin: 0;
  cursor: pointer;
  border-bottom: 2px solid ${({ borderColor }) => borderColor};
  overflow: hidden;
  &:hover {
    backdrop-filter: brightness(0.95);
  }
  &:last-child {
    border-radius: 0px 6px 6px 0px;
  }
  position: relative;
  cursor: pointer;

  &:hover {
    .action-wrapper {
      opacity: 1;
      visibility: visible;
    }
  }
  p {
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 1em 0;
    text-align: center;
    line-height: 1;
    font-weight: 600;
  }

  .sub-columns-wrapper {
    display: flex;
    box-shadow: ${({ gap, borderColor }) => `0 -${gap} 0 0 ${borderColor}`};
    ${({ gap, borderColor, isLast }) =>
      isLast
        ? `
    .column:not(:last-child) {
      box-shadow: inset -${gap} 0 0 0 ${borderColor};
    }      
    `
        : `
    .column {
      box-shadow: inset -${gap} 0 0 0 ${borderColor};
    }      
    `}
  }

  .column {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    padding: 0 1em;
    font-size: 0.875rem;
    width: 100%;
    height: 100%;
    span {
      margin-left: 0.5em;
    }
  }
`
