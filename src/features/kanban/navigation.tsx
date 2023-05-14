import { useKanban } from './contexts/context'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setUrlParams } from '@utils/setUrlParams'
import Icon from '@svgs/Icon'
import { Fragment } from 'react'
import styled from 'styled-components'
import DropDown from '@components/dropdown/dropdown'
import { BoardView, SortTypes } from '@typings/kanban'
import { useViewport } from '@contexts/viewport'

const KanbanNav = ({
  view,
  sortType,
}: {
  view: BoardView
  sortType: SortTypes
}) => {
  const { width } = useViewport()
  const { setEditing } = useKanban()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const showText = width > 500

  return (
    <Fragment>
      <Wrapper>
        <div className="action-block">
          <div className="action-item" onClick={() => navigate('/')}>
            <Icon type="go-back" />
          </div>
          <div
            className={(view === 'board' ? 'active' : '') + ' ' + 'action-item'}
            onClick={() =>
              setUrlParams('view', 'board', searchParams, setSearchParams)
            }
          >
            <Icon type="column" />
            {showText && 'Board View'}
          </div>
          {showText && (
            <div
              className={
                (view === 'table' ? 'active' : '') + ' ' + 'action-item'
              }
              // onClick={() =>
              //   setUrlParams('view', 'table', searchParams, setSearchParams)
              // }
            >
              <Icon type="table" />
              More Views comming soon!
            </div>
          )}
        </div>
        <div className="action-block">
          {/* <DropDown
            title={(showText && 'Sort') || ''}
            icon="sort"
            className="action-dropdown "
          >
            <a
              onClick={() =>
                setUrlParams('sort', 'title', searchParams, setSearchParams)
              }
              className={sortType === 'title' ? 'active' : ''}
            >
              <span>Name (A-Z)</span>
            </a>
            <a
              onClick={() =>
                setUrlParams('sort', 'status', searchParams, setSearchParams)
              }
              className={sortType === 'status' ? 'active' : ''}
            >
              <span>Status</span>
            </a>
            <a
              onClick={() =>
                setUrlParams('sort', 'created', searchParams, setSearchParams)
              }
              className={sortType === 'created' ? 'active' : ''}
            >
              <span>Date Created</span>
            </a>
            <a
              onClick={() =>
                setUrlParams('sort', 'updated', searchParams, setSearchParams)
              }
              className={sortType === 'updated' ? 'active' : ''}
            >
              <span>Date Updated</span>
            </a>
          </DropDown> */}
          <div
            className="action-item"
            onClick={() => setEditing({ type: 'trash' })}
          >
            <Icon type="delete" />
            {showText && 'Trash'}
          </div>

          <span
            className="action-item"
            onClick={() => setEditing({ id: 'new', type: 'task' })}
          >
            {/* <Icon type="add" /> */}
            Add Task
          </span>
          <DropDown title="" icon="add" className="action-dropdown primary end">
            <a onClick={() => setEditing({ id: 'new', type: 'task' })}>
              <span>Task (Card)</span>
            </a>
            <a onClick={() => setEditing({ id: 'new', type: 'column' })}>
              <span>Status (Column)</span>
            </a>
            <a onClick={() => setEditing({ id: 'new', type: 'row' })}>
              <span>Group (Row)</span>
            </a>
          </DropDown>
        </div>
      </Wrapper>
    </Fragment>
  )
}

export default KanbanNav

const Wrapper = styled.div`
  display: flex;
  box-shadow: inset 0 0 0 1px ${({ theme }) => theme.shades.dark[50]};
  background-color: ${({ theme }) => theme.shades.primary[50]};
  border-radius: 0.4em;
  justify-content: space-between;
  margin: 1em;
  .action-block {
    display: flex;
    align-items: center;
    justify-content: center;

    .action-item {
      border-left: 1px solid ${({ theme }) => theme.shades.dark[50]};

      cursor: pointer;
      padding: 0.7em 1em;
      margin: 0;
      border-right: 1.5px solid ${({ theme }) => theme.shades.dark[50]};
      width: fit-content;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      text-align: center;
      font-size: 0.875rem;
      svg {
        width: 18px;
        height: 18px;
        margin-right: 0.3em;
      }

      &.active {
        background-color: ${({ theme }) => theme.shades.primary[100]};
      }
      &:hover,
      &.active {
        color: ${({ theme }) => theme.colors.primary};
        svg {
          fill: ${({ theme }) => theme.colors.primary};
        }
      }
      &.button {
        background-color: ${({ theme }) => theme.shades.primary[900]};
        color: ${({ theme }) => theme.colors.white};
        svg {
          fill: ${({ theme }) => theme.colors.white};
        }
        &:hover {
          background-color: ${({ theme }) => theme.colors.primary};
        }
      }
    }
    .action-dropdown {
      .dropdown-head {
        border-radius: 0;
        padding: 0.2em 1em;
        &:hover {
          background-color: transparent;
        }
      }

      a {
        display: flex;
        align-items: center;
        span {
          width: fit-content;
        }
        &.active::after {
          pointer-events: none;
          content: '';
          display: block;
          width: 15px;
          height: 15px;
          margin-left: 0.5em;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'  %3E%3Cpath  d='M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z'/%3E%3C/svg%3E");
          background-repeat: none;
          background-position: center;
        }
      }

      &.primary {
        .dropdown-head {
          border-color: ${({ theme }) => theme.colors.primary};
          background-color: ${({ theme }) => theme.shades.primary[900]};
          .dropdown-head-title {
            color: ${({ theme }) => theme.colors.white};
          }
          .dropdown-head-icon svg {
            fill: ${({ theme }) => theme.colors.white};
          }
          &:hover {
            background-color: ${({ theme }) => theme.colors.primary};
          }
        }
      }
      &.end {
        .dropdown-head {
          border-radius: 0 6px 6px 0;
          overflow: hidden;
        }
      }
    }
  }

  @media (max-width: 500px) {
    margin: 0.5em;
    /* border-radius: 0; */
    .action-block {
      height: fit-content;
      .action-dropdown .dropdown-head,
      .action-item {
        padding: 0.5em;
        height: 40px;
        width: fit-content;
        min-width: 40px;
      }
      .action-dropdown.end .dropdown-head {
        padding: 0;
        /* border-radius: 0; */
      }
    }
  }
`
