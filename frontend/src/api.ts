import type { Job, StatusFilter, Summary } from './types'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { headers: { Accept: 'application/json' }, ...init })
  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`
    try {
      const body = await response.json()
      if (typeof body?.detail === 'string') detail = body.detail
    } catch {
      // Non-JSON error body; keep the generic message.
    }
    throw new ApiError(response.status, detail)
  }
  return response.json() as Promise<T>
}

export function fetchJobs(status: StatusFilter): Promise<Job[]> {
  const query = status === 'all' ? '' : `?status=${encodeURIComponent(status)}`
  return request<Job[]>(`/api/jobs${query}`)
}

export function fetchSummary(): Promise<Summary> {
  return request<Summary>('/api/jobs/summary')
}
