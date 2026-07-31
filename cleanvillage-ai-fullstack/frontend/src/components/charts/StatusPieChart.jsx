import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function StatusPieChart({ stats }) {
  const data = [
    { name: 'Normal', value: stats.normal, color: '#2e9e6d' },
    { name: 'Almost Full', value: stats.almostFull, color: '#e8a33d' },
    { name: 'Full', value: stats.full, color: '#d64545' },
  ]

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={62}
          outerRadius={92}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 12, fontSize: 12 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
