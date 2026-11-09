import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { jsonResponse, sampleJobs, sampleSummary } from './test/fixtures'

function stubApi() {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input)
    if (url.startsWith('/api/jobs/summary')) return Promise.resolve(jsonResponse(sampleSummary))
    if (url.startsWith('/api/jobs?status=failed')) {
      return Promise.resolve(jsonResponse(sampleJobs.filter((job) => job.status === 'failed')))
    }
    if (url.startsWith('/api/jobs')) return Promise.resolve(jsonResponse(sampleJobs))
    return Promise.resolve(jsonResponse({ detail: 'Not found' }, 404))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders jobs and summary counts after loading', async () => {
    stubApi()
    render(<App />)

    expect(await screen.findByText('Resize product images (batch 42)')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(sampleJobs.length + 1)
    expect(screen.getByText('Total').nextSibling).toHaveTextContent('3')
  })

  it('requests only matching jobs when the status filter changes', async () => {
    const fetchMock = stubApi()
    render(<App />)
    await screen.findByText('Resize product images (batch 42)')

    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'failed' } })

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/jobs?status=failed', expect.anything())
    })
    expect(await screen.findByText('Import customers_oct.csv')).toBeInTheDocument()
    expect(screen.queryByText('Resize product images (batch 42)')).not.toBeInTheDocument()
  })

  it('shows an error banner when the API request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(jsonResponse({ detail: 'Database unavailable' }, 500))))
    render(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Database unavailable')
  })
})
