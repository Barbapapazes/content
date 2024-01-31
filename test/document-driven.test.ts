import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup, url } from '@nuxt/test-utils'

describe('fixtures:document-driven', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/document-driven', import.meta.url)),
    server: true,
  })

  it('<title> from front-matter', async () => {
    const html = await $fetch('/')

    expect(html).contains('<title>Home</title>')
  })

  it('disabled document driven', async () => {
    const html = await $fetch('/disabled')

    expect(html).contains('<div>surround: </div>')
    expect(html).contains('<div>page: </div>')
  })

  it('disabled surround', async () => {
    const html = await $fetch('/no-surround')

    expect(html).contains('<div>surround: </div>')
    expect(html).contains('<div>page: {')
  })

  it('custom content with path', async () => {
    const html = await $fetch('/home')

    expect(html).contains('Home')
    expect(html).contains('Hello World!')

    expect(html).contains('with previous link /')
    expect(html).contains('with next link /layout')
  })

  it('custom content with condition', async () => {
    const html = await $fetch('/custom-search')

    expect(html).contains('FM Data')

    expect(html).contains('with previous link /layout')
    expect(html).contains('with next link /no-surround')
  })

  it('useContentHead(): og:image with string', async () => {
    const html = await $fetch('/fm-data')

    expect(html).contains('<meta property="og:image" content="https://picsum.photos/400/200">')
  })

  it('useContentHead(): og:image with object', async () => {
    const html = await $fetch('/og-image')

    expect(html).contains('<meta property="og:image" content="https://picsum.photos/400/200">')
    expect(html).contains('<meta property="og:image:width" content="400">')
    expect(html).contains('<meta property="og:image:height" content="200">')
  })

  it('404 page', async () => {
    try {
      await $fetch('/page-not-found')
    }
    catch (e: any) {
      expect(e.response.status).toBe(404)
      expect(e.response.statusText).toBe('Not Found')
    }
  })

  it('redirect in `_dir.yml`', async () => {
    const response = await fetch(url('/redirect'))
    expect(response.url).toBe('https://v2.nuxt.com/')
  })
})
