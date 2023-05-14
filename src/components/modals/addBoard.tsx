import React, { useEffect } from 'react'
import Modal from '.'

import { FormProvider, useForm } from 'react-hook-form'

import { toast } from 'react-hot-toast'
import {
  TaskBoard,
  addTaskBoard,
  getTaskboard,
  updateTaskBoard,
} from '@db/taskboard'
import { localDb } from '@db/index'
import { PrimaryButton } from '@styled/button'
import { ModalState } from '@typings/types'
import { CustomFormInput } from '../forms/customInput'
import Label from '@components/forms/label'
import Icon from '@svgs/Icon'
import { Theme } from '@styled/theme'

interface IProps {
  modalState: ModalState
  setModalState: (val: ModalState) => void
  onSave: () => void
}
type AddBoardForm = Pick<TaskBoard, 'title' | 'summary'>
const AddBoard: React.FC<IProps> = ({ modalState, setModalState, onSave }) => {
  const defaultValues = {
    title: '',
    summary: '',
  }

  const methods = useForm<AddBoardForm>({
    mode: 'onChange',
    defaultValues,
  })

  const { handleSubmit, reset } = methods
  const onSubmit = async (data: AddBoardForm) => {
    try {
      if (!modalState) return
      if (modalState === 'new') {
        await addTaskBoard(data)
      } else {
        await updateTaskBoard(localDb, modalState as string, data)
      }
      setModalState(undefined)
      reset({})
      onSave()
    } catch (err) {
      console.error(err)
      toast.error('Err, Failed to create new board!', {
        position: 'bottom-center',
      })
    }
  }

  const setFormData = async () => {
    try {
      const board = await getTaskboard(modalState as string)
      if (!board) {
        setModalState(undefined)
        toast.error('We are not able to find the board!', {
          position: 'bottom-center',
        })
      }

      reset(board)
    } catch (err) {
      console.error(err)
      toast.error('Err, Failed to fetch board!', {
        position: 'bottom-center',
      })
    }
  }

  useEffect(() => {
    if (!modalState || modalState === 'new') return
    setFormData()
  }, [modalState])

  return (
    <Modal
      state={modalState}
      handleClose={() => {
        reset({})
        setModalState(undefined)
      }}
      style={{ height: '300' }}
    >
      {/* <div className="modal-head">
        <p className="modal-title">Add Board</p>
      </div> */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <p className="modal-title">
              <Icon
                type="column"
                width={30}
                height={30}
                color={Theme.shades.primary[700]}
                style={{ marginRight: '0.3em' }}
              />
              Board
            </p>
            <div className="modal-content">
              <div className="mb-1">
                <CustomFormInput
                  type="heading"
                  name="title"
                  placeholder="Untitled Board"
                />
              </div>
              <div>
                <CustomFormInput
                  name="summary"
                  placeholder="Write summary about the board here..."
                />
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <PrimaryButton size="lg" type="submit">
              Save Changes
            </PrimaryButton>
          </div>
        </form>
      </FormProvider>
    </Modal>
  )
}

export default AddBoard
