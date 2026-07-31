import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts'
import { VILLAGES } from '../../data/villages'
import { STATUS } from '../../utils/binHelpers'

export default function VillageBarChart({ bins }) {
  const data = VILLAGES.map((v) => {
    const villageBins = bins.filter((b) => b.villageId === v.id)
    return {
      village: v.name,
      Normal: villageBins.filter((b) => b.status === STATUS.NORMAL).length,
      'Almost Full': villageBins.filter((b) => b.status === STATUS.ALMOST_FULL).length,
      Full: villageBins.filter((b) => b.status === STATUS.FULL).length,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barSize={16}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
        <XAxis dataKey="village" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={{ stroke: 'var(--border-soft)' }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 12, fontSize: 12 }} />
        <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>} />
        <Bar dataKey="Normal" stackId="a" fill="#2e9e6d" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Almost Full" stackId="a" fill="#e8a33d" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Full" stackId="a" fill="#d64545" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
