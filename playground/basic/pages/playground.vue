<script setup lang="ts">
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'default',
  layoutTransition: false,
})
</script>

<template>
  <div class="page">
    <ContentDoc />
  </div>
</template>

<style>
.page {
  height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
  padding: 0;
  margin: 0;
}
</style>
