import { useNavigate } from 'react-router-dom'

const SKILL_META = {
  alignment: { label: 'Baseline Alignment', child: 'How level the writing sits on the rule line' },
  spacing:   { label: 'Letter & Word Spacing', child: 'Consistent gaps between letters and words' },
  curves:    { label: 'Curve Smoothness', child: 'How smooth curved strokes are on rounded letters' },
}

const SHAPE_FAMILIES = {
  alignment: { title: 'Straight Lines Family', blurb: 'Focuses on level baseline control and steady stroke rhythm.' },
  spacing:   { title: 'Sharp Zig-Zags Family', blurb: 'Focuses on direction turns and angle accuracy.' },
  curves:    { title: 'Counter-Clockwise Curves Family', blurb: 'Focuses on smooth left-turning continuous curves.' },
}

export default function ParentView() {
  const navigate = useNavigate()
  const studentName = 'Aarav K.'
  const weakest = 'spacing'
  const strongest = 'curves'

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade">
      <button onClick={() => navigate('/home')} className="back-link mb-4">← Back to home</button>

      <div className="card">
        <div className="eyebrow mb-2">Simple Summary</div>
        <h2 className="text-2xl font-bold mb-1">How {studentName} did this week</h2>
        <p className="text-ink-soft text-sm mb-5">Written in plain language — no clinical scores, no labels, just what's working and what to try next.</p>

        <div className="stack">
          <div className="tip-card">
            <div className="tip-num">👍</div>
            <div>
              <strong>Going well:</strong> {SKILL_META[strongest].child}. Keep noticing and praising this out loud.
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-num">🎯</div>
            <div>
              <strong>Worth a little practice:</strong> {SKILL_META[weakest].child}. A few short, playful minutes a few times a week is plenty.
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-num">💡</div>
            <div>
              <strong>Try this:</strong> A few minutes of {SHAPE_FAMILIES[weakest].title.toLowerCase()} tracing.
            </div>
          </div>
        </div>

        <div className="safety-strip mt-5" style={{ background: 'var(--lavender)', padding: '14px 18px', borderRadius: '14px', fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          This is a practice-support summary, not a medical or educational diagnosis. If you have questions, your classroom teacher is always the best contact.
        </div>
      </div>
    </div>
  )
}
