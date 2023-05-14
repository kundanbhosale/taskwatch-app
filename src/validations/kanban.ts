import * as Yup from 'yup'

export const rowSchema = Yup.object().shape({
  rows: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      title: Yup.string().required(),
      board_id: Yup.string().required(),
      color: Yup.string(),
      rank: Yup.string().required(),
      updated_at: Yup.string().required(),
      created_at: Yup.string().required(),
    })
  ),
})

const selectOptSchema = Yup.object().shape({
  name: Yup.string(),
  id: Yup.string().required(),
  color: Yup.string(),
})

export const taskSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  priority: selectOptSchema,
  group: selectOptSchema,
  status: selectOptSchema,
})
