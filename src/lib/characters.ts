import { queryOptions } from '@tanstack/react-query'

import type { Character } from '#/lib/types'

const GRAPHQL_URL = 'https://rickandmortyapi.com/graphql'

const CHARACTERS_QUERY = `
  query Characters($page: Int!) {
    characters(page: $page) {
      results {
        id
        name
        image
        status
        species
      }
    }
  }
`

type CharactersQueryResponse = {
  data?: {
    characters: {
      results: Array<Character | null>
    }
  }
  errors?: Array<{ message: string }>
}

export async function fetchCharacters(page: number): Promise<Array<Character>> {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: CHARACTERS_QUERY,
      variables: { page },
    }),
  })

  if (!response.ok) {
    throw new Error(`Rick and Morty API failed (${response.status})`)
  }

  const payload = (await response.json()) as CharactersQueryResponse

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? 'GraphQL error')
  }

  return (
    payload.data?.characters.results.filter((character): character is Character => {
      return character !== null
    }) ?? []
  )
}

export const DEFAULT_CHARACTERS_PAGE = 1

export function charactersQueryKey(page: number) {
  return ['rick-and-morty', 'characters', page] as const
}

/**
 * Single source of truth for the characters query. Every consumer must use this
 * so the key, the fetcher and the freshness options always line up — the cache
 * entry is then shared and one page is fetched once, no matter how many
 * components mount it or what `staleTime` the QueryClient defaults to.
 */
export function charactersQueryOptions(page: number = DEFAULT_CHARACTERS_PAGE) {
  return queryOptions({
    queryKey: charactersQueryKey(page),
    queryFn: () => fetchCharacters(page),
    // Pinned here rather than inherited: a `staleTime: 0` default on the client
    // would let a second mount refetch the same page.
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
