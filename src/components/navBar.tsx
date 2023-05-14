import configuration from './../configuration'
import styled from 'styled-components'

const Navbar = () => {
  console.log(import.meta.env.VITE_SITE_URL)
  return (
    <Wrapper>
      <a href={import.meta.env.VITE_SITE_URL} className={`logo`}>
        <img
          src={`/logo.png`}
          title={configuration.site.name}
          alt={`logo of ${configuration.site.name}`}
          width={150}
          height={'fit-content'}
        />
      </a>
    </Wrapper>
  )
}

export default Navbar

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid ${({ theme }) => theme.shades.dark[100]};
  padding: 0.5em 1em;
`
