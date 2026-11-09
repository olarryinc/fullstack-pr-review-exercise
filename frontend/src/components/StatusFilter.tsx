import { ALL_STATUSES, STATUS_LABELS, type StatusFilter as StatusFilterValue } from '../types'

interface Props {
  value: StatusFilterValue
  onChange: (value: StatusFilterValue) => void
}

export function StatusFilter({ value, onChange }: Props) {
  return (
    <label className="control">
      Status
      <select value={value} onChange={(event) => onChange(event.target.value as StatusFilterValue)}>
        <option value="all">All</option>
        {ALL_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </label>
  )
}
