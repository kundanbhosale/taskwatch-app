import { idGenerate } from '@utils/idGenerate'
import React, { Fragment } from 'react'
import styled from 'styled-components'

const SideModal: React.FC<{
  open: boolean
  children: React.ReactNode
  width?: number
}> = ({ open, children, width = 700 }) => {
  const rightPos = open ? 0 : -width - 100
  const maxWidth = width + 'px'

  const id = idGenerate()

  return (
    <Fragment>
      <Wrapper style={{ right: rightPos, maxWidth }} id={id}>
        {children}
      </Wrapper>
    </Fragment>
  )
}

export default SideModal

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: #fff;
  border-left: 1px solid #ddd;
  box-shadow: #00000020 -5px 0 20px 5px;
  z-index: 100;
  top: 0;
  transition: right ease-in-out 0.5s;
  overflow: hidden;

  .modal-head,
  .modal-foot {
    display: flex;
    align-items: center;
    padding: 0.5em 1em;
    min-height: 40px;
    position: sticky;
    background-color: ${({ theme }) => theme.colors.white};
    z-index: 10;
    justify-content: space-between;
    a,
    span {
      font-weight: 450;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      color: ${({ theme }) => theme.shades.dark[700]};
    }
  }

  .modal-foot {
    bottom: 0;
    border-top: 1px solid ${({ theme }) => theme.shades.dark[100]};
  }

  .modal-head {
    top: 0;
    border-bottom: 1px solid ${({ theme }) => theme.shades.dark[100]};
  }
  .modal-content {
    display: block;
    overflow: auto;
    /* height: calc(100% - 80px); */
    flex: 1;
  }
`
