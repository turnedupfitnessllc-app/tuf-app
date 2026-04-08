/**
 * TUF Program Screen — v4.0
 * 4-Week Progressive Program · Clinical Corrective Integration
 * 7-Region Knowledge Base · Panther Voice Throughout
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  buildClientProgram,
  saveProgram,
  loadActiveProgram,
  markSessionComplete,
  getWeekProgress,
  type ClientProgram,
  type ProgramSession,
  type UserInput,
} from '@/data/PROGRAM_ENGINE';

// ── PHASE COLORS ──────────────────────────────────────────────────────────────
const PHASE_COLORS: Record<string, string> = {
  INHIBIT:   '#C8973A',
  LENGTHEN:  '#4a9eff',
  ACTIVATE:  '#FF4500',
  INTEGRATE: '#22c55e',
};

// ── PAIN OPTIONS ──────────────────────────────────────────────────────────────
const PAIN_OPTIONS = [
  { id:'front_shoulder', label:'Front Shoulder Pain',   icon:'💪', color:'#2563eb' },
  { id:'anterior_knee',  label:'Anterior Knee Pain',    icon:'🦵', color:'#FF4500' },
  { id:'lower_back',     label:'Lower Back Pain',       icon:'🔴', color:'#C8973A' },
  { id:'anterior_hip',   label:'Front Hip / Groin',     icon:'🔒', color:'#7c3aed' },
  { id:'deep_glute',     label:'Deep Glute Pain',       icon:'🍑', color:'#dc2626' },
  { id:'lateral_hip',    label:'Lateral Hip / IT Band', icon:'↔️',  color:'#0d9488' },
  { id:'neck',           label:'Neck / Cervical',       icon:'😤', color:'#0d9488' },
  { id:'upper_back',     label:'Upper Back / Thoracic', icon:'🦴', color:'#16a34a' },
  { id:'ankle_foot',     label:'Ankle / Foot / Heel',   icon:'👟', color:'#dc2626' },
  { id:'none',           label:'No Pain — Optimize',    icon:'⚡', color:'#22c55e' },
];

const LEVEL_OPTIONS = [
  { id:'beginner',     label:'BEGINNER',     sub:'0–6 months', color:'#4a9eff' },
  { id:'intermediate', label:'INTERMEDIATE', sub:'6m–2 years', color:'#FF4500' },
  { id:'advanced',     label:'ADVANCED',     sub:'2+ years',   color:'#C8973A' },
];

const GOAL_OPTIONS = [
  { id:'move_better',  label:'Move Without Pain', icon:'🧘' },
  { id:'lose_fat',     label:'Lose Body Fat',     icon:'🔥' },
  { id:'build_muscle', label:'Build Muscle',      icon:'💪' },
  { id:'performance',  label:'Performance',       icon:'⚡' },
];

const EQUIP_OPTIONS = [
  { id:'bodyweight', label:'Bodyweight' },
  { id:'bands',      label:'Bands'      },
  { id:'dumbbells',  label:'Dumbbells'  },
  { id:'barbell',    label:'Barbell'    },
  { id:'cables',     label:'Cables'     },
  { id:'full_gym',   label:'Full Gym'   },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function Program() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<'check'|'build'|'program'|'session'>('check');
  const [program, setProgram] = useState<ClientProgram | null>(null);
  const [activeWeek, setActiveWeek] = useState(0);
  const [activeSession, setActiveSession] = useState<ProgramSession | null>(null);
  const [sessionProgress, setSessionProgress] = useState<Record<string, boolean>>({});
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Input state
  const [pain, setPain]   = useState('');
  const [level, setLevel] = useState('');
  const [goal, setGoal]   = useState('');
  const [equip, setEquip] = useState<string[]>([]);
  const [painLvl, setPainLvl] = useState(3);

  const toggleEquip = (id: string) =>
    setEquip(p => p.includes(id) ? p.filter(e => e !== id) : [...p, id]);

  useEffect(() => {
    const active = loadActiveProgram();
    if (active) {
      setProgram(active);
      setSessionProgress(getWeekProgress(active.id));
      setView('program');
    } else {
      setView('build');
    }
  }, []);

  function handleBuild() {
    if (!pain || !level || !goal || !equip.length) return;
    const profile = JSON.parse(localStorage.getItem('tuf_profile') || '{}');
    const input: UserInput = {
      painLocation: pain,
      fitnessLevel: level as any,
      goal:         goal as any,
      equipment:    equip as any[],
      painLevel:    painLvl,
      name:         profile.name,
    };
    const built = buildClientProgram(input);
    saveProgram(built);
    setProgram(built);
    setSessionProgress({});
    setView('program');
  }

  function handleStartSession(session: ProgramSession) {
    setActiveSession(session);
    setCompletedExercises(new Set());
    setShowFeedback(false);
    setFeedback('');
    setView('session');
  }

  function handleCompleteSession() {
    if (!program || !activeSession) return;
    markSessionComplete(program.id, activeWeek + 1, activeSession.day);
    const updated = getWeekProgress(program.id);
    setSessionProgress(updated);
    setShowFeedback(true);
  }

  function handleFeedbackSubmit() {
    // Store feedback
    const feedbackData = {
      programId: program?.id,
      week:      activeWeek + 1,
      session:   activeSession?.label,
      feedback,
      timestamp: Date.now(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem('tuf_session_feedback') || '[]');
      existing.push(feedbackData);
      localStorage.setItem('tuf_session_feedback', JSON.stringify(existing.slice(-20)));
    } catch {}
    setView('program');
    setActiveSession(null);
  }

  // ── VIEWS ──────────────────────────────────────────────────────────────────

  if (view === 'build') {
    return (
      <div className="min-h-screen bg-[#080808] pb-24">
        <main className="max-w-[480px] mx-auto px-4 pt-6">

          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-black tracking-widest text-muted-foreground mb-1">BUILD YOUR PROGRAM</p>
            <h1 className="font-black leading-none" style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'2rem', letterSpacing:'0.06em' }}>
              4-WEEK <span className="text-primary">PLAN</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Panther builds it from your body. Not a template.</p>
          </div>

          {/* Pain */}
          <Section label="WHERE IS YOUR PAIN?" num="01">
            <div className="grid grid-cols-2 gap-2">
              {PAIN_OPTIONS.map(p => (
                <button key={p.id} onClick={() => setPain(p.id)}
                  className="p-3 rounded-xl border transition-all text-left active:scale-[0.97]"
                  style={{ borderColor: pain === p.id ? p.color : 'rgba(255,255,255,0.08)', background: pain === p.id ? `${p.color}18` : 'rgba(255,255,255,0.02)' }}>
                  <span className="text-lg block mb-1">{p.icon}</span>
                  <span className="text-xs font-black tracking-wide text-white" style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.06em' }}>{p.label}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Pain level */}
          {pain && pain !== 'none' && (
            <Section label="PAIN LEVEL (1–10)" num="02">
              <div className="flex items-center gap-4">
                <input type="range" min={0} max={10} value={painLvl}
                  onChange={e => setPainLvl(+e.target.value)}
                  className="flex-1" style={{ accentColor:'#FF4500' }} />
                <span className="font-black text-2xl min-w-[32px]" style={{
                  color: painLvl >= 7 ? '#dc2626' : painLvl >= 4 ? '#C8973A' : '#22c55e'
                }}>{painLvl}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2" style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em' }}>
                {painLvl >= 7 ? '⚠ HIGH — corrective focus only this week' : painLvl >= 4 ? 'MODERATE — modified training' : 'LOW — full training with modifications'}
              </p>
            </Section>
          )}

          {/* Level */}
          <Section label="FITNESS LEVEL" num={pain && pain !== 'none' ? "03" : "02"}>
            <div className="flex gap-2">
              {LEVEL_OPTIONS.map(l => (
                <button key={l.id} onClick={() => setLevel(l.id)}
                  className="flex-1 p-3 rounded-xl border transition-all text-center active:scale-[0.97]"
                  style={{ borderColor: level === l.id ? l.color : 'rgba(255,255,255,0.08)', background: level === l.id ? `${l.color}18` : 'rgba(255,255,255,0.02)' }}>
                  <p className="font-black text-xs" style={{ color: level === l.id ? l.color : 'rgba(255,255,255,0.5)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em' }}>{l.label}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{l.sub}</p>
                </button>
              ))}
            </div>
          </Section>

          {/* Goal */}
          <Section label="PRIMARY GOAL" num="04">
            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map(g => (
                <button key={g.id} onClick={() => setGoal(g.id)}
                  className="p-3 rounded-xl border transition-all text-left active:scale-[0.97]"
                  style={{ borderColor: goal === g.id ? '#FF4500' : 'rgba(255,255,255,0.08)', background: goal === g.id ? 'rgba(255,69,0,0.08)' : 'rgba(255,255,255,0.02)' }}>
                  <span className="text-xl block mb-1">{g.icon}</span>
                  <span className="text-xs font-black text-white" style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em' }}>{g.label}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Equipment */}
          <Section label="EQUIPMENT" num="05">
            <div className="flex flex-wrap gap-2">
              {EQUIP_OPTIONS.map(e => (
                <button key={e.id} onClick={() => toggleEquip(e.id)}
                  className="px-3 py-2 rounded-xl border text-xs font-bold transition-all active:scale-[0.97]"
                  style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', borderColor: equip.includes(e.id) ? '#0d9488' : 'rgba(255,255,255,0.08)', background: equip.includes(e.id) ? 'rgba(13,148,136,0.12)' : 'rgba(255,255,255,0.02)', color: equip.includes(e.id) ? '#2dd4bf' : 'rgba(255,255,255,0.45)' }}>
                  {e.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Build CTA */}
          <button onClick={handleBuild}
            disabled={!pain || !level || !goal || !equip.length}
            className="w-full py-4 rounded-2xl text-white font-black text-base tracking-wide active:scale-[0.98] transition-all disabled:opacity-30"
            style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.12em', fontSize:'1.1rem', background: 'linear-gradient(135deg,#8B0000,#FF4500)', boxShadow: '0 4px 24px rgba(255,69,0,0.3)' }}>
            BUILD MY 4-WEEK PROGRAM →
          </button>

        </main>
      </div>
    );
  }

  if (view === 'program' && program) {
    const week = program.weeks[activeWeek];
    const stageColors: Record<string, string> = { CUB:'#666', STEALTH:'#4a9eff', CONTROLLED:'#FF4500', DOMINANT:'#C8973A', 'APEX PREDATOR':'#22c55e' };
    const profile = JSON.parse(localStorage.getItem('tuf_profile') || '{}');

    return (
      <div className="min-h-screen bg-[#080808] pb-24">
        <main className="max-w-[480px] mx-auto px-4 pt-6">

          {/* Program header */}
          <div className="mb-5">
            <p className="text-xs font-black tracking-widest text-muted-foreground mb-1">YOUR PROGRAM</p>
            <h1 className="font-black leading-none" style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'2rem', letterSpacing:'0.06em' }}>
              4-WEEK <span className="text-primary">PLAN</span>
            </h1>
          </div>

          {/* Diagnosis card */}
          <div className="p-4 rounded-2xl mb-4" style={{ background:'rgba(255,69,0,0.06)', border:'1px solid rgba(255,69,0,0.2)', borderLeft:'3px solid #FF4500' }}>
            <p className="text-xs font-black tracking-widest text-primary mb-1">🐆 PANTHER DIAGNOSIS</p>
            <p className="font-black text-base text-white mb-1" style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.06em' }}>{program.verdict}</p>
            <p className="text-xs text-muted-foreground">{program.diagnosis}</p>
            {program.warning && (
              <p className="text-xs font-bold mt-2" style={{ color:'#dc2626' }}>⚠ {program.warning}</p>
            )}
          </div>

          {/* Week selector */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {program.weeks.map((w, i) => {
              const allDone = w.sessions.every(s => sessionProgress[`w${i+1}_d${s.day}`]);
              return (
                <button key={i} onClick={() => setActiveWeek(i)}
                  className="flex-shrink-0 px-4 py-3 rounded-xl border transition-all text-center active:scale-[0.97]"
                  style={{ borderColor: activeWeek === i ? '#FF4500' : 'rgba(255,255,255,0.08)', background: activeWeek === i ? 'rgba(255,69,0,0.1)' : 'rgba(255,255,255,0.02)', minWidth:'80px' }}>
                  <p className="font-black text-sm" style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', color: activeWeek === i ? '#fff' : 'rgba(255,255,255,0.45)' }}>WK {w.week}</p>
                  <p className="text-xs mt-0.5" style={{ color: allDone ? '#22c55e' : activeWeek === i ? '#FF4500' : 'rgba(255,255,255,0.3)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em' }}>{allDone ? '✓ DONE' : w.label}</p>
                </button>
              );
            })}
          </div>

          {/* Week theme */}
          <div className="p-3 rounded-xl mb-4" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs font-black tracking-widest text-muted-foreground mb-1">WEEK {week.week} · {week.label}</p>
            <p className="text-sm text-white">{week.theme}</p>
          </div>

          {/* Sessions */}
          <div className="space-y-3">
            {week.sessions.map((session, si) => {
              const done = sessionProgress[`w${activeWeek+1}_d${session.day}`];
              return (
                <button key={si} onClick={() => handleStartSession(session)}
                  className="w-full p-4 rounded-2xl border text-left active:scale-[0.98] transition-all"
                  style={{ background: done ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)', borderColor: done ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.07)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-black text-sm text-white" style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em' }}>{session.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{session.focus}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{session.duration}</span>
                      <span className="text-sm font-bold" style={{ color: done ? '#22c55e' : '#FF4500' }}>{done ? '✓' : '›'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {session.blocks.slice(0,3).map((b, bi) => (
                      <span key={bi} className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', background:`${b.color}18`, color:b.color, border:`1px solid ${b.color}33` }}>
                        {b.phase}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Rebuild */}
          <button onClick={() => setView('build')}
            className="w-full mt-6 py-3 rounded-2xl border text-sm font-bold text-muted-foreground transition-all active:scale-[0.98]"
            style={{ border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.02)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em' }}>
            ← REBUILD PROGRAM
          </button>

        </main>
      </div>
    );
  }

  if (view === 'session' && activeSession) {
    const sessionKey = `w${activeWeek+1}_d${activeSession.day}`;
    const allExIds = activeSession.blocks.flatMap(b => b.exercises.map(e => e.id));
    const pct = allExIds.length ? Math.round((completedExercises.size / allExIds.length) * 100) : 0;

    return (
      <div className="min-h-screen bg-[#080808] pb-24">
        <main className="max-w-[480px] mx-auto px-4 pt-6">

          {/* Back */}
          <button onClick={() => setView('program')} className="flex items-center gap-2 text-sm text-muted-foreground mb-5 hover:text-foreground transition-colors">
            ← {activeSession.label}
          </button>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-black tracking-widest text-muted-foreground">SESSION PROGRESS</p>
              <p className="text-xs font-black text-primary">{pct}%</p>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width:`${pct}%`, background:'linear-gradient(90deg,#8B0000,#FF4500)' }}/>
            </div>
          </div>

          {/* Blocks */}
          {activeSession.blocks.map((block, bi) => (
            <div key={bi} className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ background:block.color }}/>
                <p className="text-xs font-black tracking-widest" style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.2em', color:block.color }}>{block.label}</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:`${PHASE_COLORS[block.phase]}18`, color:PHASE_COLORS[block.phase], border:`1px solid ${PHASE_COLORS[block.phase]}33`, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', fontSize:'9px' }}>{block.phase}</span>
              </div>

              <div className="space-y-2">
                {block.exercises.map((ex, ei) => {
                  const done = completedExercises.has(ex.id);
                  return (
                    <div key={ei} className="rounded-xl border p-4 transition-all"
                      style={{ background: done ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)', borderColor: done ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)', borderLeft:`3px solid ${PHASE_COLORS[ex.phase]}` }}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-black text-sm text-white" style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.06em' }}>{ex.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily:"'JetBrains Mono', monospace" }}>{ex.cues[0]}</p>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <p className="font-black text-base" style={{ color:'#FF4500', fontFamily:"'Bebas Neue',sans-serif" }}>{ex.weekSets}×{ex.weekReps}</p>
                          <p className="text-xs text-muted-foreground">{ex.weekRest}s rest</p>
                        </div>
                      </div>

                      {/* Cues */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {ex.cues.slice(0,2).map((c, ci) => (
                          <span key={ci} className="text-xs px-2 py-0.5 rounded-full" style={{ background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)' }}>{c}</span>
                        ))}
                      </div>

                      {ex.intensityNote && (
                        <p className="text-xs font-bold mb-3" style={{ color:'rgba(255,255,255,0.35)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em' }}>{ex.intensityNote}</p>
                      )}

                      <button onClick={() => {
                        const updated = new Set(completedExercises);
                        if (done) updated.delete(ex.id); else updated.add(ex.id);
                        setCompletedExercises(updated);
                      }}
                        className="w-full py-2 rounded-xl font-black text-xs tracking-wide transition-all active:scale-[0.98]"
                        style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.15em', background: done ? 'rgba(34,197,94,0.12)' : 'rgba(255,69,0,0.1)', border: `1px solid ${done ? 'rgba(34,197,94,0.3)' : 'rgba(255,69,0,0.25)'}`, color: done ? '#22c55e' : '#FF4500' }}>
                        {done ? '✓ COMPLETE' : 'MARK COMPLETE'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Complete session */}
          {!showFeedback ? (
            <button onClick={handleCompleteSession}
              className="w-full py-4 rounded-2xl text-white font-black text-base tracking-wide active:scale-[0.98] transition-all"
              style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.12em', background:'linear-gradient(135deg,#8B0000,#FF4500)', boxShadow:'0 4px 24px rgba(255,69,0,0.3)' }}>
              COMPLETE SESSION ✓
            </button>
          ) : (
            <div className="p-4 rounded-2xl" style={{ background:'rgba(200,151,58,0.06)', border:'1px solid rgba(200,151,58,0.2)' }}>
              <p className="text-xs font-black tracking-widest text-yellow-500 mb-3" style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.2em' }}>STEP 8 — SESSION FEEDBACK</p>
              <p className="text-sm text-muted-foreground mb-3">Panther adapts the next session based on your response.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Too Easy','On Point','Too Hard','Pain Felt','Form Broke'].map(f => (
                  <button key={f} onClick={() => setFeedback(f)}
                    className="px-3 py-2 rounded-xl border text-xs font-bold transition-all active:scale-[0.97]"
                    style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', borderColor: feedback === f ? '#C8973A' : 'rgba(255,255,255,0.08)', background: feedback === f ? 'rgba(200,151,58,0.12)' : 'rgba(255,255,255,0.02)', color: feedback === f ? '#C8973A' : 'rgba(255,255,255,0.45)' }}>
                    {f}
                  </button>
                ))}
              </div>
              <button onClick={handleFeedbackSubmit} disabled={!feedback}
                className="w-full py-3 rounded-xl font-black text-sm transition-all disabled:opacity-30 active:scale-[0.98]"
                style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.12em', background:'rgba(200,151,58,0.15)', border:'1px solid rgba(200,151,58,0.3)', color:'#C8973A' }}>
                STORE FEEDBACK → ADAPT NEXT SESSION
              </button>
            </div>
          )}

        </main>
      </div>
    );
  }

  return null;
}

// ── SECTION HELPER ────────────────────────────────────────────────────────────
function Section({ label, num, children }: { label: string; num: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-black" style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.2em', color:'#FF4500' }}>STEP {num}</span>
        <span className="text-sm font-black tracking-wide text-white" style={{ fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em' }}>{label}</span>
      </div>
      {children}
    </div>
  );
}
