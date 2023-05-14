import styled from 'styled-components'

export const StyledFormInput = styled.div`
  box-shadow: inset 0 0 0 1.5px ${({ theme }) => theme.shades.dark[100]};
  overflow: hidden;
  display: flex;
  margin: 0;
  padding: 0;
  border-radius: 6px;
  align-items: center;
  .form-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 35px;
    width: 40px;
    line-height: 0;
    border-right: 1.5px solid ${({ theme }) => theme.shades.dark[100]};
  }
  input {
    box-shadow: none;
    padding-left: 0;
    width: auto;
  }
`
