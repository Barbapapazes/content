import type { H3Event } from 'h3'
import { getCookie, getQuery } from 'h3'

export function isPreview(event: H3Event) {
  const previewToken = getQuery(event).previewToken || getCookie(event, 'previewToken')
  return !!previewToken
}

export function getPreview(event: H3Event) {
  const key = getQuery(event).previewToken as string || getCookie(event, 'previewToken')

  return { key }
}
