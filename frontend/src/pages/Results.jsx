import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_BASE } from '../App'

export default function Results() {
  const { scanId } = useParams()
  const navigate = useNavigate()
  const [scan, setScan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/scans/${scanId}`)
      .then(r => {
        if (!r.ok) throw new Error('Scan not found')
        return r.json()
      })
      .then(data => {
        setScan(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [scanId])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 animate-fade text-center py-20">
        <div className="w-12 h-12 border-4 border-lavender border-t-indigo rounded-full animate-spin-slow mx-auto mb-4"></div>
        <p className="text-ink-soft">Loading results...</p>
      </div>
    )
  }

  if (!scan) {
    return (
      <div className="max-w-2xl mx-auto p-6 animate-fade text-center py-20">
        <p className="text-ink-soft mb-4">Scan not found.</p>
        <button onClick={() => navigate('/home')} className="btn btn-primary">Go Home</button>
      </div>
    )
  }

  const skills = [
    { key: 'alignment', label: 'Baseline Alignment', score: scan.alignment, explanation: scan.explanation_alignment, color: 'bg-indigo' },
    { key: 'spacing', label: 'Letter & Word Spacing', score: scan.spacing, explanation: scan.explanation_spacing, color: 'bg-blue-500' },
    { key: 'curves', label: 'Curve Smoothness', score: scan.curves, explanation: scan.explanation_curves, color: 'bg-mint' },
  ]

  const weakest = skills.reduce((a, b) => a.score < b.score ? a : b)

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade">
      <button onClick={() => navigate('/home')} className="back-link mb-4">← Back to home</button>

      <h1 className="text-3xl font-bold mb-1">Your Results</h1>
      {scan.is_fallback && (
        <p className="text-amber-deep text-sm font-semibold mb-4">AI analysis unavailable — showing demo results.</p>
      )}
      <p className="text-ink-soft mb-6">Here is how the worksheet scored across three key skills.</p>

      {scan.image_url && (
        <div className="card mb-6">
          <div className="eyebrow mb-2">Scanned Worksheet</div>
          <img src={scan.image_url} alt="Scanned worksheet" className="w-full max-h-64 object-contain rounded-xl" />
        </div>
      )}

      <div className="space-y-5 mb-8">
        {skills.map(skill => (
          <div key={skill.key} className="card">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-ink">{skill.label}</span>
              <span className="mono font-bold text-ink-soft">{skill.score}/100</span>
            </div>
            <div className="h-3 bg-lavender rounded-full overflow-hidden">
              <div
                className={`h-full ${skill.color} rounded-full transition-all duration-700`}
                style={{ width: `${skill.score}%` }}
              />
            </div>
            <p className="text-sm text-ink-soft mt-2">{skill.explanation}</p>
          </div>
        ))}
      </div>

      <div className="card bg-lavender/50 border-indigo/20 mb-6">
        <h3 className="font-bold text-lg mb-1">🎯 Recommended Practice</h3>
        <p className="text-ink-soft text-sm mb-4">
          Focus on <strong>{weakest.label.toLowerCase()}</strong> to improve your overall score.
        </p>
        <button
          onClick={() => navigate(`/practice?skill=${weakest.key}`)}
          className="btn btn-primary btn-block"
        >
          Download Practice Worksheet →
        </button>
      </div>
    </div>
  )
}
