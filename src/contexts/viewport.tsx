import { PrimaryLoader } from '@styled/loader'
import { debounce } from 'debounce'
import React, { useEffect, useState } from 'react'

const viewportContext = React.createContext({
  width: 0,
  height: 0,
  screenWidth: 0,
  screenHeight: 0,
})

const ViewportProvider = ({ children }: { children: React.ReactNode }) => {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [screenWidth, setScreenWidth] = useState(0)
  const [screenHeight, setScreenHeight] = useState(0)

  const handleWindowResize = debounce(() => {
    setWidth(window.innerWidth)
    setHeight(window.innerHeight)
    setScreenWidth(window.screen.width)
    setScreenHeight(window.screen.height)
  }, 500)

  useEffect(() => {
    if (width === 0 && height === 0) {
      handleWindowResize()
    } else {
      window.addEventListener('resize', handleWindowResize)
      return () => {
        window.removeEventListener('resize', handleWindowResize)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height])

  return (
    <viewportContext.Provider
      value={{
        width,
        height,
        screenWidth,
        screenHeight,
      }}
    >
      {children}
    </viewportContext.Provider>
  )
}

const useViewport = () => {
  return React.useContext(viewportContext)
}

export { ViewportProvider, useViewport }
