import React, { Fragment } from 'react'
import { useRoutes } from 'react-router-dom'
import Boardlist from './pages/boards/list'
import SingleBoardScreen from './pages/single'
import { ErrorStateBanner } from '@components/stateBanners'
import Navbar from '@components/navBar'

// const Route: React.FC<{ element: React.ReactNode }> = ({ element }) => {
//   return <Fragment>{element}</Fragment>
// }

const AllRoutes = () => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches

  const routes = useRoutes([
    {
      path: '/',
      element: (
        <Fragment>
          {!isStandalone ? <Navbar /> : null}
          <Boardlist />
        </Fragment>
      ),
    },
    {
      path: '/board/:id',
      element: <SingleBoardScreen />,
    },
    {
      path: '*',
      element: (
        <div className="h-100 flex flex-center">
          <ErrorStateBanner
            summary={`It feels like, Page you are looking for doesn't exist`}
          />
        </div>
      ),
    },
  ])

  return routes
}

export default AllRoutes
