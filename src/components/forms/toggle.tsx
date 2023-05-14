import React, { Fragment } from 'react'
import styled from 'styled-components'

const Toggle = ({
  className,
  value,
  setValue,
}: {
  className?: string
  value: boolean
  setValue: (_val: boolean) => void
}) => {
  return (
    <Fragment>
      <Switch className={className} onClick={() => setValue(!value)}>
        <Slider className={(value && 'checked') || ''} />
      </Switch>
    </Fragment>
  )
}

export default Toggle

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.shades.dark[100]};
  transition: 0.4s;
  border-radius: 34px;
  &.checked {
    background-color: ${({ theme }) => theme.shades.primary[200]};

    &:before {
      transform: translateX(23px);
      background-color: ${({ theme }) => theme.colors.primary};
    }
  }
  &::before {
    position: absolute;
    content: '';
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 2px;
    background-color: ${({ theme }) => theme.shades.dark[500]};
    transition: 0.4s;
    border-radius: 50%;
  }
`
const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 45px;
  height: 20px;
  margin: 0;
`
