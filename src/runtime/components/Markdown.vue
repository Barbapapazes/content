<script lang="ts">
import ContentSlot from './ContentSlot.vue'
import { computed, defineComponent, getCurrentInstance, useSlots } from '#imports'

let showDeprecatedMessage = true

/**
 * Markdown component
 */
export default defineComponent({
  name: 'Markdown',
  extends: ContentSlot,
  setup(props) {
    if (process.dev && showDeprecatedMessage) {
      console.warn('[deprecation] <Markdown> component is deprecated. Please use <ContentSlot> instead.')
      showDeprecatedMessage = false
    }
    const { parent } = getCurrentInstance()!
    const { between, default: fallbackSlot } = useSlots()

    const tags = computed(() => {
      if (typeof props.unwrap === 'string')
        return props.unwrap.split(' ')
      return ['*']
    })

    return {
      fallbackSlot,
      tags,
      between,
      parent,
    }
  },
})
</script>
