import { JOB_TYPE_LABELS, STATUS_LABELS, type Job } from '../types'

const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function JobTable({ jobs }: { jobs: Job[] }) {
  return (
    <table className="jobs">
      <thead>
        <tr>
          <th>Job</th>
          <th>Type</th>
          <th>Status</th>
          <th>Created</th>
          <th className="numeric">Attempts</th>
          <th>Error</th>
        </tr>
      </thead>
      <tbody>
        {jobs.length === 0 && (
          <tr>
            <td colSpan={6} className="empty">
              No jobs match this filter.
            </td>
          </tr>
        )}
        {jobs.map((job) => (
          <tr key={job.id}>
            <td>{job.name}</td>
            <td>{JOB_TYPE_LABELS[job.job_type] ?? job.job_type}</td>
            <td>
              <span className={`badge badge-${job.status}`}>{STATUS_LABELS[job.status]}</span>
            </td>
            <td>{dateTimeFormat.format(new Date(job.created_at))}</td>
            <td className="numeric">{job.attempts}</td>
            <td className="error-text">{job.error_message ?? '–'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
