import React from 'react'
import Modal from '.'
import styled from 'styled-components'
import { DangerButton, LightButton } from '@styled/button'
import Icon from '@svgs/Icon'
import { ModalState } from '@typings/types'
interface IProps {
  title: string
  summary?: string
  onConfirm: (_val: any) => void | Promise<void>
  onCancel: () => void
  width?: string
}

export const DeleteAlert: React.FC<IProps> = ({
  title,
  summary,
  onConfirm,
  onCancel,
}) => {
  return (
    <Wrapper>
      <span className="icon">
        <Icon type="delete" />
      </span>
      <p className="title">{title}</p>
      <p className="summary">{summary}</p>
      <DangerButton size="lg" type="button" onClick={onConfirm}>
        Delete
      </DangerButton>
      <LightButton size="lg" type="button" onClick={onCancel}>
        Cancel
      </LightButton>
    </Wrapper>
  )
}

export const DeleteModal: React.FC<IProps & { state: ModalState }> = (
  props
) => {
  return (
    <Modal state={props.state} style={{ width: props.width || '380px' }}>
      <DeleteAlert {...props} />
    </Modal>
  )
}

const Wrapper = styled.div`
  margin: auto;
  padding: 1.5em;
  .title {
    font-size: 1rem;
    font-weight: 600;
  }
  p {
    text-align: center;
  }
  .summary {
    font-size: 0.875rem;
    margin-top: 1em;
    margin-bottom: 2em;
  }
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1em;
    svg {
      width: 70px;
      height: 70px;
      fill: ${({ theme }) => theme.colors.primary};
    }
  }
  button {
    width: 100%;
    margin: 1.5em 0;
    text-align: center;
    justify-content: center;
  }
`
