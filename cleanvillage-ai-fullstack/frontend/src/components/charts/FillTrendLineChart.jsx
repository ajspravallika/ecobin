import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Last 6 days use a steady reference baseline (typical panchayat collection
// volume) so the chart reads sensibly on first load; today's bar reflects
// whatever has actually been marked "Collected" in this session.
export default function FillTrendLineChart({ collectedToday }) {
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const baseline = [14, 17, 15, 19, 16, 9, 6]

  const data = DAY_LABELS.map((day, i) => ({
    day,
    collections: i === todayIdx ? collectedToday : baseline[i],
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={{ stroke: 'var(--border-soft)' }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 12, fontSize: 12 }} />
        <Line type="monotone" dataKey="collections" stroke="#0f6e6e" strokeWidth={2.5} dot={{ r: 3, fill: '#0f6e6e' }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
