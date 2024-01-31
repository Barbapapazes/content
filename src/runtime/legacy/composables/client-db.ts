import memoryDriver from 'unstorage/drivers/memory'
import { type Storage, type StorageValue, createStorage, prefixStorage } from 'unstorage'
import { withBase } from 'ufo'
import { createPipelineFetcherLegacy } from '../../query/match/pipeline-legacy'
import { createQuery } from '../../query/query'
import type { NavItem, ParsedContent, ParsedContentMeta, QueryBuilder, QueryBuilderParams } from '../../types'
import { createNav } from '../../server/navigation'
import { useContentPreview } from '../../composables/preview'
import type { ContentQueryBuilderParams, ContentQueryFetcher } from '../../types/query'
import { useNuxtApp, useRuntimeConfig } from '#imports'

const withContentBase = (url: string) => withBase(url, useRuntimeConfig().public.content.api.baseURL)

export const contentStorage: Storage = prefixStorage(createStorage({ driver: memoryDriver() }), '@content')

interface ClientDB {
  storage: Storage
  fetch: (query: QueryBuilder<ParsedContent>) => Promise<ParsedContent | ParsedContent[]>
  query: (query?: QueryBuilderParams) => QueryBuilder<ParsedContent>
}

export function createDB(storage: Storage): ClientDB {
  async function getItems() {
    const keys = new Set<string>(await storage.getKeys('cache:'))

    // Merge preview items
    const previewToken = useContentPreview().getPreviewToken()
    if (previewToken) {
      // Ignore cache content if preview requires it
      const previewMeta: any = await storage.getItem(`${previewToken}$`).then(data => data || {})
      if (Array.isArray(previewMeta.ignoreSources)) {
        const sources = (previewMeta.ignoreSources as Array<string>).map(s => `cache:${s.trim()}:`)
        // Remove all keys that starts with ignored sources
        for (const key of keys) {
          if (sources.some(s => key.startsWith(s)))
            keys.delete(key)
        }
      }

      const previewKeys = await storage.getKeys(`${previewToken}:`)
      const previewContents = await Promise.all(previewKeys.map(key => storage.getItem(key) as Promise<ParsedContent>))
      for (const pItem of previewContents) {
        keys.delete(`cache:${pItem._id}`)
        if (!pItem.__deleted)
          keys.add(`${previewToken}:${pItem._id}`)
      }
    }
    const items = await Promise.all(Array.from(keys).map(key => storage.getItem(key) as Promise<ParsedContent>))
    return items
  }

  return {
    storage,
    fetch: createPipelineFetcherLegacy(getItems),
    query: (query?: QueryBuilderParams) => createQuery(createPipelineFetcherLegacy(getItems) as unknown as ContentQueryFetcher<ParsedContent>, {
      initialParams: query as ContentQueryBuilderParams,
      legacy: true,
    }),
  }
}

let contentDatabase: ReturnType<typeof createDB> | null = null
let contentDatabaseInitPromise: ReturnType<typeof initContentDatabase> | null = null
export async function useContentDatabase() {
  if (contentDatabaseInitPromise) {
    await contentDatabaseInitPromise
  }
  else if (!contentDatabase) {
    contentDatabaseInitPromise = initContentDatabase()
    contentDatabase = await contentDatabaseInitPromise
  }
  return contentDatabase!
}

/**
 * Initialize content database
 * - Fetch content from cache api
 * - Call `content:storage` hook to allow plugins to fill storage
 */
async function initContentDatabase() {
  const nuxtApp = useNuxtApp()
  const { content } = useRuntimeConfig().public

  const _contentDatabase = createDB(contentStorage)
  const integrity = await _contentDatabase.storage.getItem('integrity')
  if (content.integrity !== +(integrity || 0)) {
    const { contents, navigation } = await $fetch(withContentBase(content.integrity ? `cache.${content.integrity}.json` : 'cache.json')) as any

    await Promise.all(
      contents.map((content: ParsedContent) => _contentDatabase.storage.setItem(`cache:${content._id}`, content)),
    )

    await _contentDatabase.storage.setItem('navigation', navigation)

    await _contentDatabase.storage.setItem('integrity', content.integrity as StorageValue)
  }

  // call `content:storage` hook to allow plugins to fill storage
  // @ts-expect-error
  await nuxtApp.callHook('content:storage', _contentDatabase.storage)

  return _contentDatabase
}

export async function generateNavigation(query?: QueryBuilderParams): Promise<Array<NavItem>> {
  const db = await useContentDatabase()

  if (!useContentPreview().getPreviewToken() && Object.keys(query || {}).length === 0)
    return db.storage.getItem('navigation') as Promise<Array<NavItem>>

  const contents = await db.query(query)
    .where({
    /**
     * Partial contents are not included in the navigation
     * A partial content is a content that has `_` prefix in its path
     */
      _partial: false,
      /**
       * Exclude any pages which have opted out of navigation via frontmatter.
       */
      navigation: {
        $ne: false,
      },
    })
    .find()

  const dirConfigs = await db.query().where({ _path: /\/_dir$/i, _partial: true }).find()

  const configs = dirConfigs.reduce((configs, conf) => {
    if (conf.title?.toLowerCase() === 'dir')
      conf.title = undefined

    const key = conf._path!.split('/').slice(0, -1).join('/') || '/'
    configs[key] = {
      ...conf,
      // Extract meta from body. (non MD files)
      ...conf.body,
    }
    return configs
  }, {} as Record<string, ParsedContentMeta>)

  return createNav(contents, configs)
}
