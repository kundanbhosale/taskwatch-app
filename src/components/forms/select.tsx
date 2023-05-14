import { StyledLabel } from '@styled/label'
import { ISelectOptions } from '@typings/types'
import { useCallback, useRef } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import styled from 'styled-components'

const SelectInput = ({
  name,
  options,
}: {
  name: string
  options: ISelectOptions[]
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const { control } = useFormContext()

  const {
    field: { onChange, onBlur, value },
  } = useController({
    name,
    control,
  })

  const updateHeight = useCallback((open: boolean) => {
    const contentWrapper = ref.current?.querySelector(
      '.select-content'
    ) as HTMLDivElement
    if (!contentWrapper) return
    const list = contentWrapper.querySelector('ul')
    contentWrapper.style.height = open
      ? (list?.scrollHeight || 0) + 'px'
      : '0px'
  }, [])

  const handleClick = () => {
    ref.current?.focus()
  }

  const handleBlur = () => {
    updateHeight(false)
    ref.current?.classList.remove('active')
    onBlur()
  }

  const handleFocus = () => {
    updateHeight(true)
    ref.current?.classList.add('active')
  }

  const handleSelect = (opt: ISelectOptions) => {
    onChange(opt)
    ref.current?.blur()
  }

  return (
    <Wrapper ref={ref} tabIndex={0} onBlur={handleBlur} onFocus={handleFocus}>
      <div className="select-head" onClick={() => handleClick()}>
        {value ? (
          <StyledLabel color={value?.color}>
            {value?.name || value?.id}
          </StyledLabel>
        ) : (
          <StyledLabel color={options[0]?.color}>
            {options[0]?.name || options[0]?.id}
          </StyledLabel>
        )}
      </div>
      <div className="select-content">
        <ul>
          {options.map((opt, i) => (
            <li key={i} onClick={() => handleSelect(opt)}>
              <StyledLabel color={opt.color}>{opt.name || opt.id}</StyledLabel>
            </li>
          ))}
        </ul>
      </div>
    </Wrapper>
  )
}

export default SelectInput

const Wrapper = styled.div`
  display: block;
  position: relative;
  user-select: none;
  &.active {
    outline: 1px solid ${({ theme }) => theme.shades.dark[100]};
    .select-content {
      outline-width: 1px;
      box-shadow: 0px 17px 20px 4px ${({ theme }) => theme.shades.dark[100]};
    }
  }

  .select-head {
    padding: 0.4em;
    cursor: pointer;
    border-radius: 4px;
    &:hover {
      background-color: ${({ theme }) => theme.shades.dark[50]};
    }
  }
  .select-content {
    background-color: ${({ theme }) => theme.colors.white};
    display: block;
    position: absolute;
    top: calc(100% - 1px);
    left: 0;
    height: 0;
    overflow: hidden;
    transition: ease-in-out 0.2s;
    width: 100%;
    z-index: 1;
    border-radius: 0 0 4px 4px;
    outline: 0px solid ${({ theme }) => theme.shades.dark[100]};

    ul {
      margin: 0;
      padding: 0;
    }
    li {
      cursor: pointer;
      padding: 0.4em;
      &:hover {
        background-color: ${({ theme }) => theme.shades.dark[50]};
      }
    }
  }
`
