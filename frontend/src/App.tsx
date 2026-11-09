import { useCallback, useEffect, useState } from 'react'
import { fetchJobs, fetchSummary, retryJob } from './api'
import { JobTable } from './components/JobTable'
import { StatusFilter as StatusFilterControl } from './components/StatusFilter'
import { SummaryCards } from './components/SummaryCards'
import type { Job, StatusFilter, Summary } from './types'

const POLL_INTERVAL_MS = 5000

export default function App() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [jobs, setJobs] = useState<Job[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryingIds, setRetryingIds] = useState<number[]>([])

  const loadData = useCallback(async () => {
    const [jobList, summaryData] = await Promise.all([fetchJobs(statusFilter), fetchSummary()])
    setJobs(jobList)
    setSummary(summaryData)
    setError(null)
  }, [statusFilter])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadData()
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load jobs')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [loadData])

  // Refresh in the background so queued/running jobs update without a reload.
  useEffect(() => {
    const timer = setInterval(() => {
      loadData().catch(() => {
        // Keep showing the last good data; the next poll will retry.
      })
    }, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  async function handleRetry(jobId: number) {
    setRetryingIds((ids) => [...ids, jobId])
    const updated = await retryJob(jobId)
    setJobs((current) => current.map((job) => (job.id === updated.id ? updated : job)))
    setRetryingIds((ids) => ids.filter((id) => id !== jobId))
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Background Job Dashboard</h1>
        <p className="subtitle">Fictional demo data.</p>
      </header>

      <SummaryCards summary={summary} />

      <section className="toolbar">
        <StatusFilterControl value={statusFilter} onChange={setStatusFilter} />
        {loading && (
          <span className="muted" role="status">
            Loading…
          </span>
        )}
      </section>

      {error ? (
        <div className="error-banner" role="alert">
          {error}
        </div>
      ) : (
        <JobTable jobs={jobs} retryingIds={retryingIds} onRetry={handleRetry} />
      )}
    </main>
  )
}
