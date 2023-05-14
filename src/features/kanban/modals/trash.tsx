import { Trash, getTrashByBoard } from '@db/trash'
import { useKanban } from '@features/kanban/contexts/context'
import Icon from '@svgs/Icon'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import React, { Fragment, useEffect, useState } from 'react'
import styled from 'styled-components'
import { handleRestore } from '../utils/trash'
import { EmptyStateBanner } from '@components/stateBanners'

const TrashModal = () => {
  dayjs.extend(relativeTime)

  const { data, setRows, setColumns, setGrids } = useKanban()
  const [trash, setTrash] = useState<Trash[]>([])
  const getData = async () => {
    if (!data) return
    const result = await getTrashByBoard(data.board.id)
    result && setTrash(result)
  }

  useEffect(() => {
    getData()
  }, [])

  return (
    <div className="modal-content">
      <Wrapper>
        {trash && trash.length > 0 ? (
          <Fragment>
            <h3 className="mb-1">Trash</h3>
            {trash.map((t, i) => (
              <Card key={i}>
                <div className="trash-content ">
                  <p className="truncate">{t.data?.title || '-'}</p>
                  <span>
                    {t.table === 'task_columns'
                      ? 'Status (Column)'
                      : t.table === 'task_rows'
                      ? 'Group (Row)'
                      : 'Task Card'}
                    {t.created_at && `, ${dayjs(t.created_at).fromNow()}`}
                  </span>
                </div>
                <div
                  className="icon-wrapper hover-color-primary"
                  onClick={() =>
                    handleRestore(
                      t,
                      trash,
                      setTrash,
                      data,
                      setRows,
                      setColumns,
                      setGrids
                    )
                  }
                >
                  <Icon type="go-back" width={20} height={20} />
                </div>
              </Card>
            ))}
          </Fragment>
        ) : (
          <EmptyStateBanner title="Trash is empty!" />
        )}
      </Wrapper>
    </div>
  )
}

export default TrashModal

const Wrapper = styled.div`
  padding: 1.5em;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Card = styled.div`
  display: flex;
  border: 2px solid ${({ theme }) => theme.shades.dark[100]};
  padding: 0.5em;
  margin-bottom: 0.5em;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  .trash-content {
    display: inline-block;
    width: calc(100% - 50px);
    p {
      font-size: 0.875rem;
    }
    span {
      font-size: 0.75rem;
      color: ${({ theme }) => theme.shades.dark[500]};
    }
  }
  .icon-wrapper {
    height: 40px;
    width: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: ease-in-out 0.2s;
    &:hover {
      background-color: ${({ theme }) => theme.shades.primary[200]};
    }
  }
`
