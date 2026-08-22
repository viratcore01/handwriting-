import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_BASE } from '../App'

export default function StudentProfile() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [overrideValues, setOverrideValues] = useState({ alignment: '', spacing: '', curves: '' })

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/students`).then(r => r.json()),
      fetch(`${API_BASE}/api/students/${studentId}/scans`).then(r => r.json()),
    ]).then(([students, scansData]) => {
      const found = students.find(s => s.id === studentId)
      setStudent(found)
      setScans(scansData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [studentId])

  const handleOverride = async (scanId) => {
    const body = {}
    if (overrideValues.alignment !== '') body.alignment = parseInt(overrideValues.alignment)
    if (overrideValues.spacing !== '') body.spacing = parseInt(overrideValues.spacing)
    if (overrideValues.curves !== '') body.curves = parseInt(overrideValues.curves)

    await fetch(`${API_BASE}/api/scans/${scanId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 animate-fade text-center py-20">
        <div className="w-12 h-12 border-4 border-lavender border-t-indigo rounded-full animate-spin-slow mx-auto mb-4"></div>
        <p className="text-ink-soft">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fade">
      <button onClick={() => navigate('/teacher')} className="back-link mb-4">← Back to dashboard</button>

      <div className="card mb-6">
        <h1 className="text-3xl font-bold mb-1">{student?.name || 'Student'}</h1>
        <p className="text-ink-soft">Total scans: {scans.length}</p>
      </div>

      <div className="space-y-4">
        {scans.map(scan => (
          <div key={scan.id} className="card">
            <div className="flex flex-wrap gap-4 mb-3">
              <div className="flex-1 min-w-[140px]">
                <div className="text-xs font-bold text-ink-soft uppercase mb-1">Alignment</div>
                <div className="text-xl font-bold">{scan.alignment}/100</div>
              </div>
              <div className="flex-1 min-w-[140px]">
                <div className="text-xs font-bold text-ink-soft uppercase mb-1">Spacing</div>
                <div className="text-xl font-bold">{scan.spacing}/100</div>
              </div>
              <div className="flex-1 min-w-[140px]">
                <div className="text-xs font-bold text-ink-soft uppercase mb-1">Curves</div>
                <div className="text-xl font-bold">{scan.curves}/100</div>
              </div>
            </div>
            <p className="text-sm text-ink-soft mb-3">{new Date(scan.created_at).toLocaleString()}</p>
            {scan.image_url && (
              <img src={scan.image_url} alt="Scan" className="w-full max-h-48 object-contain rounded-xl mb-3" />
            )}

            <div className="border-t border-line pt-3 mt-3">
              <p className="text-sm font-semibold mb-2">Teacher Override</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Alignment"
                  value={overrideValues.alignment}
                  onChange={e => setOverrideValues({ ...overrideValues, alignment: e.target.value })}
                  className="w-24 p-2 rounded-lg border-2 border-line text-sm"
                />
                <input
                  type="number"
                  placeholder="Spacing"
                  value={overrideValues.spacing}
                  onChange={e => setOverrideValues({ ...overrideValues, spacing: e.target.value })}
                  className="w-24 p-2 rounded-lg border-2 border-line text-sm"
                />
                <input
                  type="number"
                  placeholder="Curves"
                  value={overrideValues.curves}
                  onChange={e => setOverrideValues({ ...overrideValues, curves: e.target.value })}
                  className="w-24 p-2 rounded-lg border-2 border-line text-sm"
                />
              </div>
              <button onClick={() => handleOverride(scan.id)} className="btn btn-mint text-sm py-2 px-4">
                Save Override
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
