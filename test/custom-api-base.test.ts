import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'
import { testMarkdownParser } from './features/parser-markdown'
import { testPathMetaTransformer } from './features/transformer-path-meta'
import { testYamlParser } from './features/parser-yaml'
import { testNavigation } from './features/navigation'

// import { testMDCComponent } from './features/mdc-component'
import { testJSONParser } from './features/parser-json'
import { testCSVParser } from './features/parser-csv'
import { testRegex } from './features/regex'
import { testMarkdownParserExcerpt } from './features/parser-markdown-excerpt'
import { testParserHooks } from './features/parser-hooks'
import { testModuleOptions } from './features/module-options'
import { testContentQuery } from './features/content-query'
import { testHighlighter } from './features/highlighter'
import { testMarkdownRenderer } from './features/renderer-markdown'
import { testParserOptions } from './features/parser-options'
import { testComponents } from './features/components'
import { testLocales } from './features/locales'

const apiBaseURL = '/my-content-api'

describe('custom api baseURL', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    server: true,
    nuxtConfig: {
      // @ts-expect-error
      content: {
        api: {
          baseURL: apiBaseURL,
        },
      },
    },
  })

  it('multi part path', async () => {
    const html = await $fetch('/features/multi-part-path')
    expect(html).contains('Persian')
  })

  it('partials specials chars', async () => {
    const html = await $fetch('/_partial/content-(v2)')
    expect(html).contains('Content (v2)')
  })

  it('partials specials chars', async () => {
    const html = await $fetch('/_partial/markdown')
    expect(html).contains('><!--[--> Default title <!--]--></h1>')
    expect(html).contains('<p><!--[-->p1<!--]--></p>')
  })

  testLocales()

  testComponents()

  testContentQuery()

  testNavigation()

  testMarkdownParser()

  testMarkdownRenderer()

  testMarkdownParserExcerpt()

  testYamlParser()

  testCSVParser()

  testJSONParser()

  testPathMetaTransformer()

  // testMDCComponent()

  testRegex()

  testParserHooks()

  testModuleOptions()

  testHighlighter()

  testParserOptions()
})
