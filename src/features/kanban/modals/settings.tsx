import ColorPicker from '@components/forms/colorPicker'
import { CustomFormInput } from '@components/forms/customInput'
import Label from '@components/forms/label'
import { TaskBoardSettings } from '@db/tasksettings'
import { useKanban } from '@features/kanban/contexts/context'
import { DarkButton } from '@styled/button'
import { StyledGrid } from '@styled/layout'
import { SideFormTitle } from '@styled/title'
import { idGenerate } from '@utils/idGenerate'
import React, { Fragment, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

interface SettingForm {
  title: string
  summary: string
  settings: TaskBoardSettings
}

const SettingsModal = () => {
  const { data, setEditing } = useKanban()

  const defaultValues = {
    title: '',
    summary: '',
    settings: data?.settings || undefined,
  }
  const methods = useForm<SettingForm>({
    mode: 'onChange',
    defaultValues,
  })

  const { control, setValue, reset, handleSubmit } = methods

  const formId = idGenerate('form')

  useEffect(() => {
    if (!data?.settings) return
    reset({
      title: data?.board.title || '',
      summary: data?.board.summary || '',
      settings: data.settings || undefined,
    })
  }, [data?.settings])

  const onSubmit = (formData: SettingForm) => {
    if (data) {
      data.board.title = formData.title
      data.board.summary = formData.summary
      data.settings = formData.settings
    }
    setEditing(undefined)
    // settings = formData.settings
  }

  return (
    <Fragment>
      <FormProvider {...methods}>
        <div className="modal-content">
          <form onSubmit={handleSubmit(onSubmit)} id={formId}>
            <div className=" p-1">
              {/* <Label name="Board Name" size="sm" /> */}
              <CustomFormInput
                name="title"
                placeholder="Untitled Board"
                type="sm-heading"
                className="mb"
              />
              <CustomFormInput
                name="summary"
                placeholder="Write something in breif about this board"
              />
            </div>
            <SideFormTitle>Colors</SideFormTitle>
            <div className="p-1">
              <StyledGrid className="mb-1 flex-center">
                <Label name="Border Color" />
                <ColorPicker name="settings.styles.colors.border" />
              </StyledGrid>
              <StyledGrid className="mb-1 flex-center">
                <Label name="Card Color" />
                <ColorPicker name="settings.styles.colors.card" />
              </StyledGrid>
            </div>
          </form>
        </div>

        <div className="modal-foot">
          <DarkButton size="lg" width="100%" center form={formId}>
            Save Changes
          </DarkButton>
        </div>
      </FormProvider>
    </Fragment>
  )
}

export default SettingsModal
