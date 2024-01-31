import { describe, expect, test } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export function testParserOptions() {
  describe('Parser Options', () => {
    test('custom locale', async () => {
      const parsed = await $fetch('/api/parse', {
        method: 'POST',
        body: {
          id: 'content:index.md',
          content: ':component',
          options: {
            pathMeta: {
              defaultLocale: 'jp',
            },
          },
        },
      })
      expect(parsed).toHaveProperty('_id')
      expect(parsed._locale).toBe('jp')
    })
  })
}
