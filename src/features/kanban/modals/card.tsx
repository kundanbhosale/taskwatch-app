import { TaskItem, TaskPriorityOptions } from '@db/taskitems'
import React, { Fragment, useEffect, useMemo } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import styled from 'styled-components'
import { useKanban } from '../contexts/context'
import SelectInput from '@components/forms/select'
import { StyledGrid } from '@styled/layout'
import DatePicker from '@components/forms/datePicker'
import { TaskForm } from '@typings/kanban'
import { useYupResolver } from '@hooks/yupResolver'
import { taskSchema } from '@validations/kanban'
import { TaskColumnChildren } from '@db/taskcolumns'
import { CustomFormInput } from '@components/forms/customInput'
import Label from '@components/forms/label'
import Taskpage from './page'
import { debounce } from 'debounce'

const SingleCardModal = ({ id }: { id: TaskItem['id'] }) => {
  const { data, handleTask } = useKanban()
  const rowOptions = useMemo<Array<any>>(() => {
    if (!data) return []
    return [...data.rows.values()].map((w) => {
      return {
        id: w.id,
        name: w.title,
        color: w.color,
      }
    })
  }, [data])
  const colOptions = useMemo<Array<any>>(() => {
    if (!data) return []
    const opts: any = []

    const arr = [...data.columns.values()]

    arr.forEach((el) => {
      if (el?.childrens.length > 0) {
        el.childrens.forEach((subEl: TaskColumnChildren) => {
          opts.push({
            id: subEl.id,
            color: el.color,
            name: `${el.title}  -->  ${subEl.title}`,
          })
        })
      } else {
        opts.push({ id: el.id, color: el.color, name: el.title })
      }
    })
    return opts
  }, [data])

  const item = data?.items.get(id)

  const defaultValues = {
    title: '',
    status: {
      title: '',
      id: '',
      color: '',
    },
    group: {
      title: '',
      id: '',
      color: '',
    },
    priority: {
      title: '',
      id: '',
      color: '',
    },
    start_date: '',
    due_date: '',
  }

  const methods = useForm<TaskForm>({
    mode: 'onChange',
    defaultValues,
    resolver: useYupResolver(taskSchema),
  })

  const {
    handleSubmit,
    control,
    reset,
    formState: { isValidating, isValid, isDirty },
  } = methods

  const watchedData = useWatch({
    control,
  })

  const onSubmit = (formData: TaskForm) => {
    handleTask({ ...formData, id: id === 'new' ? '' : id }, true)
  }

  useEffect(() => {
    if (!isValid || isValidating || !isDirty) return

    handleSubmit(onSubmit)()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedData, isValid, isValidating, isDirty])

  useEffect(() => {
    reset({
      title: item?.title || '',
      status: colOptions.find((c) => c.id === item?.status) || colOptions[0],
      group: rowOptions.find((c) => c.id === item?.group) || rowOptions[0],
      priority:
        TaskPriorityOptions.find((c) => c.id === item?.fields.priority.id) ||
        TaskPriorityOptions[0],
      due_date: item?.fields.due_date,
      start_date: item?.fields.start_date,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  return (
    <Fragment>
      <div className="modal-content">
        {id ? (
          <Fragment>
            <FormProvider {...methods}>
              <form>
                <Wrapper>
                  <div className="edit-title">
                    <CustomFormInput
                      placeholder="Untitled Task"
                      name="title"
                      type="sm-heading"
                      saveOnBlur
                    />
                  </div>
                  <div className="edit-details">
                    <StyledGrid cols="150px auto" className="mb">
                      <Label name="Status" icon="arrow-circle" />
                      <SelectInput name="status" options={colOptions} />
                    </StyledGrid>
                    <StyledGrid cols="150px auto" className="mb">
                      <Label name="Group" icon="arrow-circle" />
                      <SelectInput name="group" options={rowOptions} />
                    </StyledGrid>
                    <StyledGrid cols="150px auto" className="mb">
                      <Label name="Pirority" icon="flag" />
                      <SelectInput
                        name="priority"
                        options={TaskPriorityOptions}
                      />
                    </StyledGrid>
                    <StyledGrid cols="150px auto" className="mb">
                      <Label name="Start Date" icon="calendar" />
                      <DatePicker name="start_date" />
                    </StyledGrid>
                    <StyledGrid cols="150px auto" className="mb">
                      <Label name="Due Date" icon="calendar" />
                      <DatePicker name="due_date" />
                    </StyledGrid>
                  </div>
                  {/* <div className="edit-details">
                  {item && (
                    <Fragment>
                      <StyledGrid className="mb">
                        <Label icon="clock" name={'Create Time'} />
                        <ReadyOnlyValue>
                          {dayjs(item?.created_at).format(
                            'DD MMM YYYY, hh:mm A'
                          )}
                        </ReadyOnlyValue>
                      </StyledGrid>
                      <StyledGrid className="mb">
                        <Label icon="clock" name={'Last Updated'} />
                        <ReadyOnlyValue>
                          {dayjs(item?.updated_at).format(
                            'DD MMM YYYY, hh:mm A'
                          )}
                        </ReadyOnlyValue>
                      </StyledGrid>
                    </Fragment>
                  )}
                </div> */}
                </Wrapper>
              </form>
            </FormProvider>
            <Taskpage taskData={item} />
          </Fragment>
        ) : null}
      </div>
    </Fragment>
  )
}

export default SingleCardModal

const Wrapper = styled.div`
  display: block;
  .edit-details,
  .edit-title {
    max-width: calc(100%) !important;
    padding: 20px 56px;
    width: 100%;
    margin: auto;
  }
  .edit-details {
    border-bottom: 1px solid #eee;
    border-top: 1px solid #eee;
  }
  @media (max-width: 650px) {
    .edit-details,
    .edit-title {
      padding: 20px;
    }
  }
`
