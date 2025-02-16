import type { NavItem } from '../types'

/**
 * Find first child link from a navigation node.
 */
function navBottomLink(link: NavItem): string | undefined {
  if (!link.children)
    return link._path

  for (const child of link?.children || []) {
    const result = navBottomLink(child)
    if (result)
      return result
  }
}

/**
 * Find current navigation directory node from a path.
 */
function navDirFromPath(path: string, tree: NavItem[]): NavItem[] | undefined {
  for (const file of tree) {
    if (file._path === path && !file._id)
      return file.children

    if (file.children) {
      const result = navDirFromPath(path, file.children)
      if (result)
        return result
    }
  }
}

/**
 * Find a navigation page node from a path.
 */
function navPageFromPath(path: string, tree: NavItem[]): NavItem | undefined {
  for (const file of tree) {
    if (file._path === path)
      return file

    if (file.children) {
      const result = navPageFromPath(path, file.children)
      if (result)
        return result
    }
  }
}

/**
 * Find a navigation field node from a path.
 */
function navKeyFromPath(path: string, key: string, tree: NavItem[]) {
  let value: any

  const goDeep = (path: string, tree: NavItem[]) => {
    for (const file of tree) {
      if (path !== '/' && file._path === '/') {
        // Ignore root page
        continue
      }
      if (path?.startsWith(file._path) && file[key])
        value = file[key]

      if (file._path === path)
        return

      if (file.children)
        goDeep(path, file.children)
    }
  }

  goDeep(path, tree)

  return value
}

export function useContentHelpers() {
  return {
    navBottomLink,
    navDirFromPath,
    navPageFromPath,
    navKeyFromPath,
  }
}
