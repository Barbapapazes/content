import { useContent } from '#imports'

export function useTheme() {
  const { globals } = useContent()

  const theme = computed(() => globals.value?.theme)

  return theme
}
