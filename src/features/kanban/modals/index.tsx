import SideModal from '@components/modals/side'
import React, { useEffect, useState } from 'react'
import ColumnModal from './column'
import Icon from '@svgs/Icon'
import { useKanban } from '../contexts/context'
import { BoardEditing, IBoardContext } from '@typings/kanban'
import RowModal from './rows'
import SingleCardModal from './card'
import { handleDeleteTask } from '../utils/task'
import TrashModal from './trash'

const EditModal = ({
  editing,
  setEditing,
}: {
  editing: BoardEditing
  setEditing: IBoardContext['setEditing']
}) => {
  const { data, setGrids } = useKanban()

  const [width, setWidth] = useState(400)

  useEffect(() => {
    editing && setWidth(editing?.type === 'task' ? 700 : 400)
  }, [editing])

  const renderer = () => {
    if (!editing) return
    switch (editing.type) {
      case 'column':
        return <ColumnModal />

      case 'row':
        return <RowModal />

      case 'task':
        return editing.id && <SingleCardModal id={editing.id} />

      // case 'setting':
      //   return <SettingsModal />

      case 'trash':
        return <TrashModal />

      default:
        return null
    }
  }

  const handleDelete = () => {
    if (!editing) return null
    const perform = () => {
      switch (editing.type) {
        case 'task':
          return editing.id && handleDeleteTask(editing.id, data, setGrids)
        default:
          return null
      }
    }
    perform()
    setEditing(undefined)
  }

  return (
    <SideModal open={!!editing} width={width}>
      <div className="modal-head">
        <a onClick={() => setEditing(undefined)}>
          <Icon type="close" />
        </a>
        {editing && editing.id !== 'new' && editing.type === 'task' && (
          <a onClick={handleDelete} className="hover-color-danger">
            <Icon type="delete" width={15} height={15} />
            &nbsp; Delete Task
          </a>
        )}
      </div>
      {renderer()}
    </SideModal>
  )
}

export default EditModal
