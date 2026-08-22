import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API_BASE } from '../App'

export default function StudentHome() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const studentId = searchParams.get('student') || 's0'
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(studentId)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/students`)
      .then(r => r.json())
      .then(data => {
        setStudents(data)
        setSelectedStudent(data[0]?.id || 's0')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const student = students.find(s => s.id === selectedStudent) || { name: 'Student' }

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade">
      <div className="student-hero-card">
        <div className="avatar-row">
          <div className="student-avatar">👦</div>
          <div>
            <div className="streak-pill">🔥 3-Day Practice Streak</div>
            <h2 style={{ margin: '6px 0 2px' }}>Welcome back, {student.name}!</h2>
            <p className="muted" style={{ margin: 0, fontSize: '14px' }}>Last session: Kept good size and rhythm</p>
          </div>
        </div>

        <div className="main-btn-grid">
          <button onClick={() => navigate(`/scan?student=${selectedStudent}`)} className="big-action-btn primary">
            <span className="tag" style={{ background: 'rgba(255,255,255,0.25)', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, display: 'inline-block' }}>Main Path</span>
            <h3>📷 Scan Worksheet</h3>
            <p>Take a photo of a paper worksheet to get instant scores and feedback.</p>
          </button>

          <button onClick={() => navigate(`/practice?student=${selectedStudent}`)} className="big-action-btn secondary">
            <span className="tag" style={{ background: 'rgba(4,56,42,0.15)', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, display: 'inline-block' }}>Exercise</span>
            <h3>✍️ Practice Worksheet</h3>
            <p>Open a practice PDF and print it to build skills.</p>
          </button>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-ink-soft mb-2">Select Student</label>
          <select
            value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-line bg-surface text-ink font-semibold focus:border-indigo focus:outline-none"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
