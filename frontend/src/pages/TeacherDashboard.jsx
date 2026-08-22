import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../App'

export default function TeacherDashboard() {
  const [heatmap, setHeatmap] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_BASE}/api/classes/default/heatmap`)
      .then(r => r.json())
      .then(data => { setHeatmap(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const getScoreColor = (score) => {
    if (score == null) return 'bg-gray-100 text-gray-500'
    if (score >= 75) return 'bg-mint text-mint-deep'
    return 'bg-amber/20 text-amber-deep'
  }

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Teacher Dashboard</h1>
          <p className="text-ink-soft">Class heatmap and latest scan scores.</p>
        </div>
        <button onClick={() => navigate('/home')} className="btn btn-ghost">Student View</button>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="w-12 h-12 border-4 border-lavender border-t-indigo rounded-full animate-spin-slow mx-auto mb-4"></div>
          <p className="text-ink-soft">Loading class data...</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-ink-soft text-xs uppercase tracking-wider">
                <th className="pb-3 pl-3 font-bold">Student</th>
                <th className="pb-3 font-bold">Alignment</th>
                <th className="pb-3 font-bold">Spacing</th>
                <th className="pb-3 font-bold">Curves</th>
                <th className="pb-3 font-bold">Last Scan</th>
              </tr>
            </thead>
            <tbody>
              {heatmap.map(row => (
                <tr
                  key={row.student_id}
                  onClick={() => navigate(`/student/${row.student_id}`)}
                  className="cursor-pointer hover:bg-lavender/30 transition-colors"
                >
                  <td className="py-3 pl-3 font-semibold">{row.student_name}</td>
                  <td className="py-3">
                    <span className={`heat-pill px-3 py-1 rounded-lg text-sm font-bold ${getScoreColor(row.latest_scan?.alignment)}`}>
                      {row.latest_scan?.alignment ?? '—'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`heat-pill px-3 py-1 rounded-lg text-sm font-bold ${getScoreColor(row.latest_scan?.spacing)}`}>
                      {row.latest_scan?.spacing ?? '—'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`heat-pill px-3 py-1 rounded-lg text-sm font-bold ${getScoreColor(row.latest_scan?.curves)}`}>
                      {row.latest_scan?.curves ?? '—'}
                    </span>
                  </td>
                  <td className="py-3 text-ink-soft text-sm">
                    {row.latest_scan ? new Date(row.latest_scan.created_at).toLocaleDateString() : 'No scans'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
