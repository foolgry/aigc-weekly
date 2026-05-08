import type { ServerFunctionClient } from 'payload'
import type { ReactNode } from 'react'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from 'payload.config'
import { importMap } from './admin/importMap.js'

import '@payloadcms/next/css'
import './custom.css'

interface Args {
  children: ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

function Layout({ children }: Args) {
  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  )
}

export default Layout
