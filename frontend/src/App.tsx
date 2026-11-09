import { useEffect, useState } from 'react'
import { fetchJobs, fetchSummary } from './api'
import { JobTable } from './components/JobTable'
import { StatusFilter as StatusFilterControl } from './components/StatusFilter'
import { SummaryCards } from './components/SummaryCards'
import type { Job, StatusFilter, Summary } from './types'

export default function App() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [jobs, setJobs] = useState<Job[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([fetchJobs(statusFilter), fetchSummary()])
      .then(([jobList, summaryData]) => {
        if (cancelled) return
        setJobs(jobList)
        setSummary(summaryData)
        setError(null)
      })
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
  }, [statusFilter])

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
        <JobTable jobs={jobs} />
      )}
    </main>
  )
}
