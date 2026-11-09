export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed'

export type StatusFilter = JobStatus | 'all'

export interface Job {
  id: number
  name: string
  job_type: string
  status: JobStatus
  attempts: number
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface Summary {
  total: number
  by_status: Record<JobStatus, number>
}

export const ALL_STATUSES: JobStatus[] = ['queued', 'running', 'succeeded', 'failed']

export const STATUS_LABELS: Record<JobStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  succeeded: 'Succeeded',
  failed: 'Failed',
}

export const JOB_TYPE_LABELS: Record<string, string> = {
  image_resize: 'Image resize',
  csv_import: 'CSV import',
  report: 'Report',
}
