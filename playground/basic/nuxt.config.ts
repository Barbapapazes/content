import { resolve } from 'pathe'
import contentModule from '../../src/module'

export default defineNuxtConfig({
  extends: ['../shared'],
  nitro: {
    static: true,
  },
  content: {
    sources: {
      'translation-fa': {
        prefix: '/fa',
        driver: 'fs',
        base: resolve(__dirname, 'content-fa'),
      },
    },

    ignores: [
      '\\.bak$',
      'ignored/folder',
    ],
  },
  typescript: {
    includeWorkspace: true,
  },
  modules: [
    // @ts-expect-error
    contentModule,
    // '@nuxtjs/tailwindcss'
  ],
})
