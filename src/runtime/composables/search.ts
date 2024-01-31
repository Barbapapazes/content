import MiniSearch, { type Options as MiniSearchOptions } from 'minisearch'
import { type MaybeRefOrGetter, type Ref, computed, ref, toValue, useFetch, useRuntimeConfig } from '#imports'

export function defineMiniSearchOptions<DataItem>(options: MiniSearchOptions<DataItem>) {
  return ref(options)
}

export async function searchContent<DataItem>(search: MaybeRefOrGetter<string>, options: { miniSearch?: MaybeRefOrGetter<MiniSearchOptions<DataItem>> } = {}) {
  const runtimeConfig = useRuntimeConfig()
  const { content } = runtimeConfig.public
  const { integrity, api: { baseURL: baseAPI }, search: searchOptions } = content
  const { indexed: useIndexedSearch } = searchOptions || {}

  const searchRoute = `${baseAPI}/search${integrity ? `-${integrity}` : ''}`

  if (useIndexedSearch) {
    const { options: miniSearchOptions } = searchOptions || {}

    const { data } = await useFetch<string>(searchRoute, { responseType: 'text' })

    if (!data.value) {
      throw createError({
        statusCode: 500,
        message: 'Missing search data',
      })
    }

    const results = useIndexedMiniSearch(search, data as Ref<string>, miniSearchOptions!)

    return results
  }

  if (!options.miniSearch) {
    throw createError({
      statusCode: 500,
      message: 'Missing miniSearch options',
    })
  }

  const { data } = await useFetch<DataItem[]>(searchRoute)

  if (!data.value) {
    throw createError({
      statusCode: 500,
      message: 'Missing search data',
    })
  }

  const results = useMiniSearch(search, data as Ref<DataItem[]>, options.miniSearch)

  return results
}

function useIndexedMiniSearch<DataItem>(search: MaybeRefOrGetter<string>, indexedData: MaybeRefOrGetter<string>, options: MaybeRefOrGetter<MiniSearchOptions<DataItem>>) {
  const indexedMiniSearch = computed(() => {
    return MiniSearch.loadJSON(toValue(indexedData), toValue(options))
  })

  const results = computed(() => {
    return indexedMiniSearch.value.search(toValue(search))
  })

  return results
}

const useMiniSearch = function <T = any> (search: MaybeRefOrGetter<string>, data: MaybeRefOrGetter<T[]>, options: MaybeRefOrGetter<MiniSearchOptions<T>>) {
  const miniSearch = computed(() => {
    return new MiniSearch(toValue(options))
  })

  miniSearch.value.addAll(toValue(data))

  const results = computed(() => {
    return miniSearch.value.search(toValue(search))
  })

  return results
}
