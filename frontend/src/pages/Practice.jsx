import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { API_BASE } from '../App'

export default function Practice() {
  const [searchParams] = useSearchParams()
  const skill = searchParams.get('skill') || 'alignment'
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_BASE}/api/worksheets/${skill}`)
      .then(r => r.json())
      .then(data => { setUrl(data.url); setLoading(false) })
      .catch(() => setLoading(false))
  }, [skill])

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade">
      <button onClick={() => navigate('/home')} className="back-link mb-4">← Back to home</button>
      <h1 className="text-3xl font-bold mb-1">Practice Worksheet</h1>
      <p className="text-ink-soft mb-6 capitalize">Print and practice {skill} exercises.</p>

      {loading ? (
        <div className="card text-center py-12">
          <div className="w-12 h-12 border-4 border-lavender border-t-indigo rounded-full animate-spin-slow mx-auto mb-4"></div>
          <p className="text-ink-soft">Loading worksheet...</p>
        </div>
      ) : url ? (
        <div className="card">
          <iframe src={url} className="w-full h-[600px] rounded-xl border border-line" title="Worksheet" />
          <div className="mt-4 flex gap-3">
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Open PDF</a>
            <a href={url} download className="btn btn-ghost">Download</a>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-ink-soft mb-4">Worksheet not available yet.</p>
          <button onClick={() => navigate('/home')} className="btn btn-primary">Go Home</button>
        </div>
      )}
    </div>
  )
}
