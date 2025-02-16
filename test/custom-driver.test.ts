import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils'

describe('building with custom driver', async () => {
  let builds: boolean
  try {
    await setup({
      rootDir: fileURLToPath(new URL('./fixtures/custom-driver', import.meta.url)),
      server: true,
      dev: false,
    })
    builds = true
  }
  catch {
    builds = false
  }

  it('builds succeeds', () => {
    expect(builds).toBe(true)
  })
})
