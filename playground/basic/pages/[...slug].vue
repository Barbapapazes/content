<script setup lang="ts">
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'default',
  layoutTransition: false,
})
</script>

<template>
  <div class="content-page">
    <ContentDoc>
      <template #not-found>
        <p>Not found!</p>
        <p>
          Go:
          <NuxtLink to="#" @click="$router.go(-1)">
            Back
          </NuxtLink>
          or
          <NuxtLink to="/">
            Home
          </NuxtLink>
        </p>
      </template>
    </ContentDoc>
  </div>
</template>

<style>
.content-page {
  height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
  padding: 1rem;
  margin: 0;
}
</style>
