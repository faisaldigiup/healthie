import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  charactersQueryKey,
  charactersQueryOptions,
  fetchCharacters,
} from '#/lib/characters'
import { morty, rick } from '#/test/helpers'

describe('fetchCharacters', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts the GraphQL query and drops null results', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { characters: { results: [rick, null, morty] } },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchCharacters(2)).resolves.toEqual([rick, morty])

    expect(fetchMock).toHaveBeenCalledWith(
      'https://rickandmortyapi.com/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string) as {
      variables: { page: number }
    }
    expect(body.variables.page).toBe(2)
  })

  it('throws when the HTTP request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    )

    await expect(fetchCharacters(1)).rejects.toThrow('Rick and Morty API failed (503)')
  })

  it('throws the first GraphQL error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ errors: [{ message: 'Too many requests' }] }),
      }),
    )

    await expect(fetchCharacters(1)).rejects.toThrow('Too many requests')
  })

  it('returns an empty list when data is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }),
    )

    await expect(fetchCharacters(1)).resolves.toEqual([])
  })
})

describe('charactersQueryOptions', () => {
  it('uses a stable key and does not refetch on mount', () => {
    const options = charactersQueryOptions(3)
    expect(options.queryKey).toEqual(charactersQueryKey(3))
    expect(options.staleTime).toBe(Infinity)
    expect(options.refetchOnMount).toBe(false)
  })
})
