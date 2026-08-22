import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { API_BASE } from '../App'

const SHAPE_FAMILIES = {
  alignment: {
    title: 'Straight Lines Family',
    blurb: 'Focuses on level baseline control and steady stroke rhythm.',
    letters: ['E', 'F', 'H', 'I', 'L', 'T'],
    words: ['LINE', 'TILE', 'LIFT']
  },
  spacing: {
    title: 'Sharp Zig-Zags Family',
    blurb: 'Focuses on direction turns and angle accuracy.',
    letters: ['A', 'K', 'M', 'N', 'V', 'W', 'X', 'Z'],
    words: ['ZIGZAG', 'HERO', 'WAVE']
  },
  curves: {
    title: 'Counter-Clockwise Curves Family',
    blurb: 'Focuses on smooth left-turning continuous curves.',
    letters: ['C', 'O', 'G', 'Q', 'S'],
    words: ['MOON', 'FLOW', 'SONG']
  }
}

const LEVELS = ['Large Shapes', 'Letters', 'Words']

export default function Practice() {
  const [searchParams] = useSearchParams()
  const skill = searchParams.get('skill') || 'alignment'
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedLetter, setSelectedLetter] = useState(0)
  const [practiceLevel, setPracticeLevel] = useState(0)
  const navigate = useNavigate()

  const family = SHAPE_FAMILIES[skill] || SHAPE_FAMILIES.alignment

  useEffect(() => {
    fetch(`${API_BASE}/api/worksheets/${skill}`)
      .then(r => r.json())
      .then(data => { setUrl(data.url); setLoading(false) })
      .catch(() => setLoading(false))
  }, [skill])

  const handleAdvance = () => {
    if (practiceLevel < 2) {
      setPracticeLevel(practiceLevel + 1)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade">
      <button onClick={() => navigate(-1)} className="back-link mb-4">← Back</button>
      <h1 className="text-3xl font-bold mb-1">Practice Worksheet</h1>
      <p className="text-ink-soft mb-6 capitalize">Print and practice {skill} exercises.</p>

      <div className="card mb-6">
        <div className="eyebrow mb-2">{family.title}</div>
        <p className="text-ink-soft text-sm mb-4">{family.blurb}</p>

        <div className="protocol-steps mb-4">
          {LEVELS.map((level, i) => (
            <span
              key={i}
              className={`step-chip ${i === practiceLevel ? 'active' : ''} ${i < practiceLevel ? 'done' : ''}`}
            >
              {i < practiceLevel ? '✓ ' : ''}{level}
            </span>
          ))}
        </div>

        {practiceLevel === 1 && (
          <div className="mb-4">
            <div className="eyebrow mb-2" style={{ fontSize: '11px' }}>Pick a letter to practice:</div>
            <div className="letter-picker">
              {family.letters.map((letter, idx) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(idx)}
                  className={`letter-chip ${idx === selectedLetter ? 'active' : ''}`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          className="text-center font-bold p-3 rounded-xl mb-4"
          style={{ background: 'var(--lavender)', color: 'var(--indigo)', fontSize: '14px' }}
        >
          🎯 Practice: {LEVELS[practiceLevel]} — {practiceLevel === 1 ? `Letter "${family.letters[selectedLetter]}"` : family.words[0]}
        </div>
      </div>

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
            {practiceLevel < 2 && (
              <button onClick={handleAdvance} className="btn btn-mint">
                Advance Level →
              </button>
            )}
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
