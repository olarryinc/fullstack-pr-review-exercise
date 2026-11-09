import { ALL_STATUSES, STATUS_LABELS, type Summary } from '../types'

export function SummaryCards({ summary }: { summary: Summary | null }) {
  return (
    <section className="summary" aria-label="Summary">
      <div className="card">
        <span className="card-label">Total</span>
        <span className="card-value">{summary?.total ?? '–'}</span>
      </div>
      {ALL_STATUSES.map((status) => (
        <div className="card" key={status}>
          <span className="card-label">{STATUS_LABELS[status]}</span>
          <span className="card-value">{summary?.by_status[status] ?? '–'}</span>
        </div>
      ))}
    </section>
  )
}
