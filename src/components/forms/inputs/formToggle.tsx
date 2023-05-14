import React from 'react'
import { useController, useFormContext } from 'react-hook-form'
import Toggle from '../toggle'

const FormToggle = ({
  name,
  className,
}: {
  name: string
  className?: string
}) => {
  const { control } = useFormContext()

  const {
    field: { onChange, value },
  } = useController({
    name,
    control,
  })

  return <Toggle className={className} value={value} setValue={onChange} />
}

export default FormToggle
