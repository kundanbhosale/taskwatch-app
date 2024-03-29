import styled from 'styled-components'

export const StyledGrid = styled.div<{
  cols?: string
  colgap?: string
  rowgap?: string
}>`
  display: grid;
  grid-template-columns: ${({ cols }) => cols || 'repeat(2, 1fr)'};

  ${({ colgap }) => colgap && `column-gap: ${colgap};`}
  ${({ rowgap }) => rowgap && `row-gap: ${rowgap};`}
`
