/**
 * TUF Assess Screen — The Brain
 * "Assess → Correct → Perform → Evolve"
 * Option A: Guided Assessment (Overhead Squat, Push Test, Posture Scan)
 * Option B: Quick Select (Knees cave in, Lower back pain, Tight hips, etc.)
 */
import { useState } from 'react';
import { useLocation } from 'wouter';
import { PantherAvatar } from '@/components/PantherAvatar';

type AssessMode = 'select' | 'guided' | 'quick' | 'result';

interface Issue {
  id: string;
  label: string;
  icon: string;
  pattern: string;
  correctives: string[];
}

const QUICK_ISSUES: Issue[] = [
  {
    id: 'knee-valgus',
    label: 'Knees cave in',
    icon: '🦵',
    pattern: 'Lower Crossed Syndrome — weak glutes, tight adductors',
    correctives: ['glute-bridge', 'clamshell', 'lateral-band-walk', 'squat-with-pause'],
  },
  {
    id: 'low-back-pain',
    label: 'Lower back pain',
    icon: '🔴',
    pattern: 'LCS — tight hip flexors, weak core/glutes',
    correctives: ['hip-flexor-stretch', 'dead-bug', 'glute-bridge', 'bird-dog'],
  },
  {
    id: 'tight-hips',
    label: 'Tight hips',
    icon: '🔒',
    pattern: 'Hip flexor dominance — sedentary pattern',
    correctives: ['hip-flexor-stretch', 'pigeon-pose', 'hip-hinge', 'lateral-lunge'],
  },
  {
    id: 'forward-head',
    label: 'Head forward posture',
    icon: '😤',
    pattern: 'Upper Crossed Syndrome — tight chest/anterior shoulders, weak deep neck flexors',
    correctives: ['chin-tuck', 'wall-angel', 'face-pull', 'thoracic-extension'],
  },
  {
    id: 'shoulder-pain',
    label: 'Shoulder pain',
    icon: '💪',
    pattern: 'UCS — tight pec minor, weak lower traps/serratus',
    correctives: ['pec-stretch', 'wall-angel', 'band-pull-apart', 'y-t-w'],
  },
  {
    id: 'heel-rise',
    label: 'Heels rise in squat',
    icon: '👟',
    pattern: 'Tight calves/soleus, limited ankle dorsiflexion',
    correctives: ['calf-stretch', 'ankle-mobility', 'box-squat', 'goblet-squat'],
  },
  {
    id: 'forward-lean',
    label: 'Excessive forward lean',
    icon: '📐',
    pattern: 'LCS — tight hip flexors, weak thoracic extensors',
    correctives: ['thoracic-extension', 'hip-flexor-stretch', 'goblet-squat', 'rdl'],
  },
  {
    id: 'arms-fall-forward',
    label: 'Arms fall forward',
    icon: '🙌',
    pattern: 'UCS — tight lats/pec minor, weak lower traps',
    correctives: ['lat-stretch', 'wall-angel', 'y-t-w', 'overhead-squat'],
  },
];

const GUIDED_TESTS = [
  {
    id: 'overhead-squat',
    label: 'Overhead Squat',
    icon: '🏋️',
    description: 'Arms overhead, squat to depth. JARVIS watches for compensations.',
    cameraRequired: true,
  },
  {
    id: 'push-test',
    label: 'Push Test',
    icon: '🤜',
    description: 'Standard push-up. Checks UCS patterns — head, shoulders, scapulae.',
    cameraRequired: true,
  },
  {
    id: 'posture-scan',
    label: 'Posture Scan',
    icon: '📸',
    description: 'Stand naturally. JARVIS analyzes your resting posture.',
    cameraRequired: true,
  },
];

export default function Assess() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<AssessMode>('select');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [pantherMessage, setPantherMessage] = useState<string | undefined>(undefined);

  const handleQuickSelect = (issue: Issue) => {
    setSelectedIssue(issue);
    setPantherMessage("I see the weakness. Let's fix it.");
    setMode('result');
  };

  const handleStartCorrectives = () => {
    if (selectedIssue) {
      // Store selected correctives in localStorage for Correct screen
      localStorage.setItem('tuf_correctives', JSON.stringify({
        issue: selectedIssue,
        timestamp: Date.now(),
      }));
      navigate('/correct');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-[480px] mx-auto px-4 pt-6">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-xs font-black tracking-widest text-muted-foreground mb-1">STEP 1 OF 4</p>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            ASSESS <span className="text-primary">YOUR MOVEMENT</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Find the weakness. Fix it at the root.</p>
        </div>

        {/* ── Mode: Select ──────────────────────────────────────────── */}
        {mode === 'select' && (
          <>
            <div className="flex flex-col items-center mb-8">
              <PantherAvatar state="idle" size="md" />
              <p className="text-sm text-muted-foreground mt-3 text-center">
                How do you want to assess today?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setMode('guided')}
                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-foreground text-background shadow-lg hover:shadow-xl active:scale-[0.98] transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                  📷
                </div>
                <div className="flex-1">
                  <p className="font-black text-base tracking-wide">GUIDED ASSESSMENT</p>
                  <p className="text-background/70 text-sm">Camera-based movement screen</p>
                </div>
                <span className="text-background/40 text-xl">›</span>
              </button>

              <button
                onClick={() => setMode('quick')}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-primary bg-primary/5 hover:bg-primary/10 active:scale-[0.98] transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl flex-shrink-0">
                  ⚡
                </div>
                <div className="flex-1">
                  <p className="font-black text-base tracking-wide text-foreground">QUICK SELECT</p>
                  <p className="text-muted-foreground text-sm">Tell me what's bothering you</p>
                </div>
                <span className="text-muted-foreground text-xl">›</span>
              </button>
            </div>
          </>
        )}

        {/* ── Mode: Guided ──────────────────────────────────────────── */}
        {mode === 'guided' && (
          <>
            <button
              onClick={() => setMode('select')}
              className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
            >
              ← Back
            </button>

            <div className="flex flex-col items-center mb-6">
              <PantherAvatar state="coaching" size="md" message="Show me how you move." />
            </div>

            <div className="space-y-3">
              {GUIDED_TESTS.map((test) => (
                <button
                  key={test.id}
                  onClick={() => navigate('/live')}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/40 active:scale-[0.98] transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl flex-shrink-0">
                    {test.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-sm tracking-wide text-foreground">{test.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{test.description}</p>
                    {test.cameraRequired && (
                      <span className="inline-block mt-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        CAMERA REQUIRED
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground text-xl">›</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── Mode: Quick Select ────────────────────────────────────── */}
        {mode === 'quick' && (
          <>
            <button
              onClick={() => setMode('select')}
              className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
            >
              ← Back
            </button>

            <p className="text-sm font-bold text-muted-foreground mb-4 tracking-wide">
              WHAT'S BOTHERING YOU?
            </p>

            <div className="grid grid-cols-2 gap-3">
              {QUICK_ISSUES.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => handleQuickSelect(issue)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 active:scale-[0.97] transition-all text-center"
                >
                  <span className="text-3xl">{issue.icon}</span>
                  <p className="text-xs font-black tracking-wide text-foreground leading-tight">
                    {issue.label}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── Mode: Result ──────────────────────────────────────────── */}
        {mode === 'result' && selectedIssue && (
          <>
            <div className="flex flex-col items-center mb-6">
              <PantherAvatar
                state="coaching"
                size="lg"
                message={pantherMessage}
              />
            </div>

            <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{selectedIssue.icon}</span>
                <div>
                  <p className="font-black text-sm tracking-wide text-foreground">{selectedIssue.label}</p>
                  <p className="text-xs text-primary font-bold mt-0.5">{selectedIssue.pattern}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedIssue.correctives.length} corrective exercises prescribed
              </p>
            </div>

            <div className="space-y-2 mb-6">
              <p className="text-xs font-black tracking-widest text-muted-foreground">YOUR CORRECTIVE PLAN</p>
              {selectedIssue.correctives.map((ex, i) => (
                <div key={ex} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm font-bold text-foreground capitalize">
                    {ex.replace(/-/g, ' ')}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartCorrectives}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base tracking-wide shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
            >
              START CORRECTIVES →
            </button>

            <button
              onClick={() => setMode('quick')}
              className="w-full mt-3 py-3 rounded-2xl border-2 border-border text-muted-foreground font-bold text-sm hover:border-foreground transition-colors"
            >
              Select Different Issue
            </button>
          </>
        )}

      </main>
    </div>
  );
}
