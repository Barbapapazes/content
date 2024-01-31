import { flatUnwrap, unwrap } from '@nuxtjs/mdc/dist/runtime/utils/node'

export function useUnwrap() {
  return {
    unwrap,
    flatUnwrap,
  }
}
