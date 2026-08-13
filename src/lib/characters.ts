import type { Character } from '#/lib/types'

const GRAPHQL_URL = 'https://rickandmortyapi.com/graphql'

const CHARACTERS_QUERY = `
  query Characters($page: Int!) {
    characters(page: $page) {
      info {
        pages
      }
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
      info: { pages: number }
      results: Array<Character | null>
    }
  }
  errors?: Array<{ message: string }>
}

async function fetchCharacterPage(page: number) {
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

  const results =
    payload.data?.characters.results.filter((character): character is Character => {
      return character !== null
    }) ?? []

  return {
    results,
    pages: payload.data?.characters.info.pages ?? 1,
  }
}

export async function fetchCharacters(): Promise<Array<Character>> {
  const firstPage = await fetchCharacterPage(1)
  const extraPages = [2, 3].filter((page) => page <= firstPage.pages)
  const extra = await Promise.all(extraPages.map((page) => fetchCharacterPage(page)))

  return [firstPage, ...extra].flatMap((page) => page.results)
}

export const charactersQueryKey = ['rick-and-morty', 'characters'] as const
