import type { Job, Summary } from '../types'

export function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 1,
    name: 'Resize product images (batch 42)',
    job_type: 'image_resize',
    status: 'succeeded',
    attempts: 1,
    error_message: null,
    created_at: '2025-11-03T09:12:00Z',
    updated_at: '2025-11-03T09:12:00Z',
    ...overrides,
  }
}

export const sampleJobs: Job[] = [
  makeJob({ id: 1 }),
  makeJob({
    id: 2,
    name: 'Import customers_oct.csv',
    job_type: 'csv_import',
    status: 'failed',
    attempts: 2,
    error_message: 'Row 118: invalid date format',
    created_at: '2025-11-03T09:05:00Z',
  }),
  makeJob({
    id: 3,
    name: 'Generate monthly sales report',
    job_type: 'report',
    status: 'running',
    created_at: '2025-11-03T08:40:00Z',
  }),
]

export const sampleSummary: Summary = {
  total: 3,
  by_status: { queued: 0, running: 1, succeeded: 1, failed: 1 },
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
