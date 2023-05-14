import { colord, extend } from 'colord'
import styled from 'styled-components'
import a11yPlugin from 'colord/plugins/a11y'

extend([a11yPlugin])

export const StyledLabel = styled.span<{ size?: 'xs' | 'sm'; color?: string }>`
  width: fit-content;
  font-size: ${({ size }) => (size === 'xs' ? '0.7rem' : '0.75rem')};
  padding: 0.3em 0.7em;
  overflow: hidden;
  border-radius: 0.2rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  background-color: ${({ color }) => color || '#eee'};
  color: ${({ theme }) =>
    colord(theme.colors.white).isReadable()
      ? theme.colors.white
      : theme.colors.dark};

  svg {
    width: 15px;
    height: 15px;
    fill: ${({ theme }) =>
      colord(theme.colors.white).isReadable()
        ? theme.colors.white
        : theme.colors.dark};

    margin-right: 0.2em;
  }
  &:not(:last-child) {
    margin-right: 1em;
  }
  position: relative;
`
