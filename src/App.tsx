import React from 'react'
import { ThemeProvider } from 'styled-components'
import AllRoutes from './Routes'
import { GlobalStyles } from './styled/global'
import { Theme } from './styled/theme'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useViewport } from '@contexts/viewport'
import { PrimaryLoader } from '@styled/loader'
import configuration from './configuration'

const App = () => {
  const { width, height } = useViewport()
  return (
    <BrowserRouter>
      <Helmet>
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />

        <link rel="shortcut icon" href="/favicon/favicon.ico" />

        <meta name="theme-color" content={configuration.site.themeColor} />

        <meta
          key="meta:description"
          name="description"
          content={configuration.site.description}
        />

        <title>{configuration.site.name}</title>

        <meta
          key="og:title"
          property="og:title"
          content={configuration.site.name}
        />

        <meta property="og:site_name" content={configuration.site.name} />

        <meta
          key="og:description"
          property="og:description"
          content={configuration.site.description}
        />

        <meta
          key="twitter:title"
          property="twitter:title"
          content={configuration.site.name}
        />

        <meta property="twitter:card" content="summary_large_image" />

        <meta
          key="twitter:description"
          property="twitter:description"
          content={configuration.site.description}
        />

        <meta
          property="twitter:creator"
          content={configuration.site.twitterHandle}
        />
        <link
          rel="image_src"
          href={`${import.meta.env.VITE_APP_URL}/icon-192x192.png`}
        />
      </Helmet>
      <ThemeProvider theme={Theme}>
        <GlobalStyles />
        <Toaster position="bottom-center" containerClassName="toaster" />
        {!width || !height ? <PrimaryLoader /> : <AllRoutes />}
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
