import { resolve } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup(_options, nuxt) {
    nuxt.options.nitro.externals = nuxt.options.nitro.externals || {}
    nuxt.options.nitro.externals.inline = nuxt.options.nitro.externals.inline || []
    nuxt.options.nitro.externals.inline.push(resolve('./my-module'))
    // @ts-expect-error
    nuxt.hook('content:context', (contentContext) => {
      contentContext.transformers.push(resolve('./my-module/my-transformer.ts'))
    })
  },
})
