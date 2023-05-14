import styled from 'styled-components'

// export const Title = styled.h2`
//   display: flex;
//   justify-content: flex-start;
//   text-align: center;
//   .icon {
//     margin-right: 0.7em;
//   }
//   .title {
//     font-size: inherit;
//     display: flex;
//     text-align: start;
//     /* flex-direction: column; */
//     justify-content: center;
//     align-items: center;
//   }
//   p {
//     font-weight: 400;
//   }
// `

export const SideFormTitle = styled.p`
  padding: 0.7em 1.5em;
  font-size: 0.875rem;
  font-weight: 600;
  border-top: 1px solid ${({ theme }) => theme.shades.dark[100]};
  border-bottom: 1px solid ${({ theme }) => theme.shades.dark[100]};
`
