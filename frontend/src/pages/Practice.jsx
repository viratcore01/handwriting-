import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { API_BASE } from '../App'

const SKILLS = [
  { key: 'alignment', label: 'Baseline Alignment', description: 'Practice writing on the line.' },
  { key: 'spacing', label: 'Letter & Word Spacing', description: 'Practice even gaps between letters and words.' },
  { key: 'curves', label: 'Curve Smoothness', description: 'Practice smooth round letters like O, C, S.' },
]

export default function Practice() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialSkill = searchParams.get('skill') || searchParams.get('exercise') || 'alignment'
  const [skill, setSkill] = useState(initialSkill)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [iframeError, setIframeError] = useState(false)

  const skillData = SKILLS.find(s => s.key === skill) || SKILLS[0]

  useEffect(() => {
    setLoading(true)
    setError(null)
    setIframeError(false)
    fetch(`${API_BASE}/api/worksheets/${skill}`)
      .then(r => {
        if (!r.ok) throw new Error('Worksheet not found')
        return r.json()
      })
      .then(data => {
        setUrl(data.url || '')
        setLoading(false)
      })
      .catch(err => {
        console.warn('Worksheet load failed:', err)
        setError(err.message || 'Failed to load worksheet')
        setLoading(false)
      })
  }, [skill])

  const handleDownload = async () => {
    if (!url) return
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${skill}-worksheet.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch (e) {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade">
      <button onClick={() => navigate(-1)} className="back-link mb-4">← Back</button>
      <h1 className="text-3xl font-bold mb-1">Practice Exercises</h1>
      <p className="text-ink-soft mb-6">Choose a skill and print the worksheet to practice.</p>

      <div className="card mb-6">
        <label className="block text-sm font-semibold text-ink-soft mb-2">Choose Exercise</label>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map(s => (
            <button
              key={s.key}
              onClick={() => { setSkill(s.key); navigate(`/practice?skill=${s.key}`, { replace: true }) }}
              className={`btn ${skill === s.key ? 'btn-primary' : 'btn-ghost'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-ink-soft text-sm mt-3">{skillData.description}</p>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="w-12 h-12 border-4 border-lavender border-t-indigo rounded-full animate-spin-slow mx-auto mb-4"></div>
          <p className="text-ink-soft">Loading worksheet...</p>
        </div>
      ) : error || !url || iframeError ? (
        <div className="card text-center py-12">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
          <h2 className="text-xl font-bold mb-2">Worksheet Ready to Download</h2>
          <p className="text-ink-soft mb-4">
            {error ? `Could not load preview: ${error}.` : 'Download the PDF and print it to practice.'}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={handleDownload} className="btn btn-primary" disabled={!url}>
              Download PDF
            </button>
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                Open in New Tab
              </a>
            )}
          </div>
          {!url && (
            <p className="text-ink-soft text-sm mt-4">
              No worksheet uploaded yet. Ask your teacher to upload the practice PDF.
            </p>
          )}
        </div>
      ) : (
        <div className="card">
          <iframe
            src={url}
            className="w-full h-[600px] rounded-xl border border-line"
            title={`${skillData.label} worksheet`}
            onError={() => setIframeError(true)}
          />
          <div className="mt-4 flex gap-3">
            <button onClick={handleDownload} className="btn btn-primary">
              Download PDF
            </button>
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Open PDF
            </a>
          </div>
        </div>
      )}

      <div className="card mt-6">
        <div className="eyebrow">Progress Ladder</div>
        <h3 style={{ margin: '6px 0 12px' }}>Shapes → Letters → Words</h3>
        <div className="ladder">
          {['Rung 1: Large Shapes', 'Rung 2: Letters (ABCD Practice)', 'Rung 3: Full Context Words'].map((r, i) => (
            <div key={i} className={`rung ${i === 0 ? 'current' : ''} ${i < 0 ? 'unlocked' : ''}`}>
              <div className="rung-idx">{i + 1}</div>
              <div>{r}{i === 0 ? ' — Active Practice Focus' : ' — Locked'}</div>
            </div>
          ))}
        </div>
        <div className="safety-strip mt-4" style={{ fontSize: '12.5px' }}>
          <strong>Target:</strong> Print and trace with <strong>smooth, even strokes</strong>. Repeat until it feels natural.
        </div>
      </div>
    </div>
  )
}
