import { withBase } from 'ufo'
import type { useContent } from './content'
import { useContentPreview } from './preview'
import { useRequestEvent, useRuntimeConfig } from '#imports'

export const withContentBase = (url: string) => withBase(url, useRuntimeConfig().public.content.api.baseURL)

export function useContentDisabled(): ReturnType<typeof useContent> {
  // Console warnings

  console.warn('useContent is only accessible when you are using `documentDriven` mode.')

  console.warn('Learn more by visiting: https://content.nuxt.com/document-driven')

  // Break app
  throw new Error('useContent is only accessible when you are using `documentDriven` mode.')
}

export function navigationDisabled() {
  // Console warnings

  console.warn('Navigation is only accessible when you enable it in module options.')

  console.warn('Learn more by visiting: https://content.nuxt.com/get-started/configuration#navigation')

  // Break app
  throw new Error('Navigation is only accessible when you enable it in module options.')
}

export function addPrerenderPath(path: string) {
  const event = useRequestEvent()
  event.node.res.setHeader(
    'x-nitro-prerender',
    [
      event.node.res.getHeader('x-nitro-prerender'),
      path,
    ].filter(Boolean).join(','),
  )
}
