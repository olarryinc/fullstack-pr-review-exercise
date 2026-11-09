import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchJobs } from './api'
import { jsonResponse } from './test/fixtures'

describe('api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('omits the status query when fetching all jobs', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([])))
    vi.stubGlobal('fetch', fetchMock)

    await fetchJobs('all')

    expect(fetchMock).toHaveBeenCalledWith('/api/jobs', expect.anything())
  })

  it('passes the status filter as a query parameter', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse([])))
    vi.stubGlobal('fetch', fetchMock)

    await fetchJobs('failed')

    expect(fetchMock).toHaveBeenCalledWith('/api/jobs?status=failed', expect.anything())
  })

  it('throws an ApiError with the server detail on non-2xx responses', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(jsonResponse({ detail: 'Job not found' }, 404))))

    await expect(fetchJobs('all')).rejects.toMatchObject({ status: 404, message: 'Job not found' })
  })
})
