import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../App'

export default function StudentHome() {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_BASE}/api/students`)
      .then(r => r.json())
      .then(data => {
        setStudents(data)
        if (data.length > 0) setSelectedStudent(data[0].id)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleScan = () => {
    if (!selectedStudent) return
    navigate(`/scan?student=${selectedStudent}`)
  }

  const handleProgress = () => {
    if (!selectedStudent) return
    navigate(`/progress?student=${selectedStudent}`)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Student Home</h1>
        <p className="text-ink-soft">Choose a student and start practicing</p>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="w-12 h-12 border-4 border-lavender border-t-indigo rounded-full animate-spin-slow mx-auto mb-4"></div>
          <p className="text-ink-soft">Loading students...</p>
        </div>
      ) : (
        <>
          <div className="card mb-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <button onClick={handleScan} className="big-action-btn primary rounded-3xl p-8 text-left">
              <span className="tag bg-white/25 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">Main Path</span>
              <h3 className="text-2xl font-bold mb-2">📷 Scan Worksheet</h3>
              <p className="text-white/90 text-sm">Take a photo of a paper worksheet to get instant scores and feedback.</p>
            </button>

            <button onClick={handleProgress} className="big-action-btn secondary rounded-3xl p-8 text-left">
              <span className="tag bg-ink/10 text-ink text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">Progress</span>
              <h3 className="text-2xl font-bold mb-2">📊 View Progress</h3>
              <p className="text-ink/80 text-sm">See your improvement over time with charts and history.</p>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
