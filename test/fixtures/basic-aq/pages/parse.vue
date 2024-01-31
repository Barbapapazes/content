<script setup>
import { useAsyncData, useRoute } from '#imports'

const { content } = useRoute().query
const { data } = await useAsyncData(content, async () => {
  return await $fetch('/api/parse', {
    method: 'POST',
    cors: true,
    body: {
      id: 'content:index.md',
      content: decodeURIComponent(content),
    },
  })
})
</script>

<template>
  <div>
    <ContentRendererMarkdown :value="data" />
  </div>
</template>
