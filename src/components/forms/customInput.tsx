import { debounce } from 'debounce'
import React, { FormEvent, useEffect, useRef } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import styled from 'styled-components'

interface IFormProps {
  name: string
  type?: 'text' | 'heading' | 'sm-heading' | undefined
  saveOnBlur?: boolean
}

type Props = React.DetailedHTMLProps<
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onKeyDown' | 'onInput'>,
  HTMLDivElement
> & {
  value: string
  type?: IFormProps['type']
  setValue: (val: string) => void
  error?: string
}

const placeCaretAtEnd = (el: HTMLElement) => {
  if (
    typeof window.getSelection === 'undefined' &&
    typeof document.createRange === 'undefined'
  )
    return

  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  const sel = window.getSelection()
  if (!sel) return
  sel.removeAllRanges()
  sel.addRange(range)
}

export const CustomInput = (props: Props) => {
  const { placeholder, value, type, setValue, error, className, ...rest } =
    props

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!value || !ref.current) return
    ref.current.textContent = value
  }, [ref, value])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  const element = (
    <div
      {...rest}
      ref={ref}
      contentEditable={true}
      data-gramm="false"
      suppressContentEditableWarning={true}
      className={`gf-custom-input`}
      placeholder={placeholder || 'Untitled'}
      onKeyDown={handleKeyPress}
      onInput={(e) => setValue(e.currentTarget.textContent || '')}
    />
  )

  return (
    <Wrapper
      className={`${className ? className : ''}${error ? 'has-error' : ''}`}
      type={type}
    >
      {element} {error && <p className="error-message">{error}</p>}
    </Wrapper>
  )
}

export const CustomFormInput = (
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > &
    IFormProps
) => {
  const { name, type, saveOnBlur, ...rest } = props
  const {
    control,
    formState: { errors },
  } = useFormContext()
  const {
    field: { onBlur, onChange, value },
  } = useController({
    name,
    control,
  })
  const setValue = debounce((v: string) => {
    !saveOnBlur && onChange(v)
  }, 300)

  const handleBlur = (e: FormEvent<HTMLDivElement>) => {
    saveOnBlur && onChange(e.currentTarget.textContent || 'Untitled')
    onBlur()
  }

  return (
    <CustomInput
      value={value}
      type={type}
      {...rest}
      onBlur={handleBlur}
      setValue={setValue}
      error={errors[name]?.message as string}
    />
  )
}

const Wrapper = styled.div<{
  type: 'text' | 'heading' | 'sm-heading' | undefined
}>`
  align-items: center;
  display: block;
  width: auto;
  position: relative;
  height: fit-content;
  &.has-error {
    .gf-custom-input {
      background-color: ${({ theme }) => theme.shades.danger[300]};
    }
  }

  .gf-custom-input {
    position: relative;
    display: flex;
    font-size: ${({ type }) =>
      type && type === 'heading'
        ? '2em'
        : type === 'sm-heading'
        ? '1.4em'
        : 'inherit'};
    font-weight: ${({ type }) =>
      type === 'heading' ? '700' : type === 'sm-heading' ? 600 : 'inherit'};
    /* padding: 0 0.5em; */
    width: 100%;
    flex-wrap: wrap;
    word-break: break-word;
    /* border-radius: 6px; */
    background-color: transparent;

    caret-shape: block !important;

    &:empty:before {
      content: attr(placeholder);
      pointer-events: none;
      display: block; /* For Firefox */
      opacity: 0.5;
      font-weight: inherit;
    }
    &:after {
      content: '';
      display: block;
      height: 2px;
      width: 100%;
      background-color: transparent;
      position: absolute;
      top: calc(100% + 5px);
    }

    &:focus {
      outline: none;
      /* ${({ type, theme }) =>
        type &&
        type === 'text' &&
        `box-shadow: inset 0 0 0 1.5px ${theme.shades.dark[100]};
   `} */
    }
  }
`
