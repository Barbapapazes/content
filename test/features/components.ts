import { describe, expect, test } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

export function testComponents() {
  describe('components', () => {
    test('from content directory', async () => {
      const index = await $fetch('/components/from-content')

      expect(index).toContain('Lorem ipsum dolor sit, amet consectetur adipisicing elit.')
    })
  })

  describe('<ContentList>', () => {
    test('custom query', async () => {
      const index = await $fetch('/dogs-list')
      expect(index).toContain('[Bulldog,German Shepherd]')
    })
  })
}
