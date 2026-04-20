/**
 * BOA — BIOMECHANICAL OVERLAY ARCHITECTURE v2.0
 * Visual Window System
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * Exports:
 *   <BOAWindow />        — reusable camera + pose overlay viewport
 *   <BOAEvalScreen />    — full UCS/LCS assessment flow (INTRO→SCAN→ANALYSIS→RESULTS)
 *   <BOAWorkoutScreen /> — active workout with live form monitoring, risk detection, corrective injection
 *   <BOASystem />        — root demo / router
 *
 * v2 additions:
 *   - detectFormDrop (rolling 5-rep avg < 65 threshold)
 *   - detectKneeCollapse (knee.x < ankle.x)
 *   - isHighRisk (fatigue > 75 && form_score < 70)
 *   - injectCorrective (queues correctives when form < 70)
 *   - regressExercise (maps exercise to easier variant on form drop)
 *   - Recovery Mode UI with substitution display
 *   - Panther AI voice cues (calm_intense, minimal, directive)
 *   - Movement quality rolling score
 */
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const B = {
  bg: "#080808", red: "#8B0000", redLight: "#A50000",
  gold: "#C8973A", white: "#F2F2F2", dim: "rgba(242,242,242,0.45)",
  gray: "#1A1A1A", grayMid: "#242424", green: "#00CC66",
};

const MODE_COLOR: Record<string, { primary: string; glow: string; label: string; icon: string }> = {
  STEALTH:   { primary: "#00aaff", glow: "rgba(0,150,255,0.5)",  label: "STEALTH",   icon: "◈" },
  PRECISION: { primary: B.gold,    glow: "rgba(200,151,58,0.5)", label: "PRECISION", icon: "◎" },
  ATTACK:    { primary: "#ff2222", glow: "rgba(255,30,30,0.6)",  label: "ATTACK",    icon: "◆" },
};

// ─── Panther AI Voice Lines ────────────────────────────────────────────────────
const PANTHER_VOICE = {
  start:    ["Lock in.", "Focus. Hunt begins now.", "Ready. Move."],
  during:   ["Control it.", "Stay low. Stay ready.", "Breathe. Push."],
  formDrop: ["Form dropping. Slow it down.", "Reset. Go again.", "No hesitation."],
  kneeIn:   ["Drive knees outward.", "Knees out. Now.", "Fix your base."],
  backRound:["Keep chest up.", "Spine neutral. Now.", "Fix your posture."],
  highRisk: ["Recovery mode activated.", "Dial it back.", "Protect the body."],
  finish:   ["Strong finish.", "You earned that.", "Good. Again."],
};
function getPantherCue(type: keyof typeof PANTHER_VOICE): string {
  const lines = PANTHER_VOICE[type];
  return lines[Math.floor(Math.random() * lines.length)];
}

// ─── Risk Detection Engine ─────────────────────────────────────────────────────
function detectFormDrop(repScores: number[]): boolean {
  if (repScores.length < 5) return false;
  const last5 = repScores.slice(-5);
  const avg = last5.reduce((a, b) => a + b, 0) / last5.length;
  return avg < 65;
}

function detectKneeCollapse(knee: { x: number }, ankle: { x: number }): boolean {
  return knee.x < ankle.x;
}

interface RiskProfile { fatigue_level: number; form_score: number; }
function isHighRisk(p: RiskProfile): boolean {
  return p.fatigue_level > 75 && p.form_score < 70;
}

function injectCorrective(formScore: number): string[] {
  if (formScore >= 70) return [];
  return ["Glute Bridge", "Plank Hold", "Mobility Flow"];
}

const REGRESSIONS: Record<string, string> = {
  jump_squat: "Slow Squat", squat_001: "Wall Sit", squat_002: "Box Squat",
  push_up: "Knee Push-Up", push_001: "Incline Push-Up",
  deadlift: "Romanian Deadlift", hinge_001: "Glute Bridge",
  lunge_001: "Reverse Lunge (Slow)", lunge_002: "Split Squat Hold",
  locomotion_005: "Slow March", locomotion_006: "Step Touch",
  pull_up: "Band-Assisted Pull-Up", pull_001: "Band Row",
  squat: "Box Squat", hinge: "Glute Bridge", pushup: "Knee Push-Up",
  bear_crawl: "Dead Bug",
};
function regressExercise(id: string): string | null {
  return REGRESSIONS[id] ?? null;
}

function calculateMovementQuality(scores: number[]): number {
  if (scores.length === 0) return 0;
  const last7 = scores.slice(-7);
  return Math.round(last7.reduce((a, b) => a + b, 0) / last7.length);
}

// ─── Simulation ────────────────────────────────────────────────────────────────
function simulateDetection(frameCount: number) {
  const t = frameCount * 0.04;
  return {
    landmarks: {
      headForward:   0.3  + 0.25 * Math.sin(t * 0.7),
      shoulderRound: 0.4  + 0.2  * Math.sin(t * 0.5),
      hipFlexion:    0.35 + 0.3  * Math.sin(t * 0.6),
      kneeValgus:    0.15 + 0.15 * Math.sin(t * 0.9),
      pelvicTilt:    0.4  + 0.2  * Math.sin(t * 0.4),
      trunkLateral:  0.1  + 0.1  * Math.sin(t * 1.1),
    },
    confidence: 0.82 + 0.12 * Math.sin(t),
    fps: Math.round(28 + 4 * Math.sin(t * 2)),
  };
}

type Landmarks = ReturnType<typeof simulateDetection>["landmarks"];

function calcUCS(lm: Landmarks) {
  return Math.min(1, lm.headForward * 0.4 + lm.shoulderRound * 0.35 + (1 - lm.hipFlexion) * 0.25);
}
function calcLCS(lm: Landmarks) {
  return Math.min(1, lm.hipFlexion * 0.4 + lm.pelvicTilt * 0.35 + lm.kneeValgus * 0.25);
}
function derivePantherMode(ucs: number, lcs: number): string {
  const max = Math.max(ucs, lcs);
  if (max > 0.65) return "ATTACK";
  if (max > 0.4)  return "PRECISION";
  return "STEALTH";
}

// ─── Canvas Helpers ────────────────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawPoseSkeleton(ctx: CanvasRenderingContext2D, W: number, H: number, lm: Landmarks, color: string, frame: number) {
  const t = frame * 0.03;
  const pts: Record<string, [number, number]> = {
    head:   [W*0.5,  H*0.12 + lm.headForward*18],
    neck:   [W*0.5,  H*0.22],
    lSho:   [W*0.34 - lm.shoulderRound*10, H*0.3],
    rSho:   [W*0.66 + lm.shoulderRound*10, H*0.3],
    lElbow: [W*0.26, H*0.46 + Math.sin(t)*4],
    rElbow: [W*0.74, H*0.46 + Math.sin(t+1)*4],
    lWrist: [W*0.22, H*0.6  + Math.sin(t)*5],
    rWrist: [W*0.78, H*0.6  + Math.sin(t+1)*5],
    hip:    [W*0.5,  H*0.52 + lm.pelvicTilt*10],
    lHip:   [W*0.42, H*0.52 + lm.pelvicTilt*10],
    rHip:   [W*0.58, H*0.52 + lm.pelvicTilt*10],
    lKnee:  [W*0.40 + lm.kneeValgus*8, H*0.7],
    rKnee:  [W*0.60 - lm.kneeValgus*8, H*0.7],
    lAnkle: [W*0.39, H*0.88],
    rAnkle: [W*0.61, H*0.88],
  };
  const bones: [string,string][] = [
    ["head","neck"],["neck","lSho"],["neck","rSho"],
    ["lSho","lElbow"],["lElbow","lWrist"],["rSho","rElbow"],["rElbow","rWrist"],
    ["neck","hip"],["hip","lHip"],["hip","rHip"],
    ["lHip","lKnee"],["lKnee","lAnkle"],["rHip","rKnee"],["rKnee","rAnkle"],
  ];
  ctx.shadowColor = color; ctx.shadowBlur = 10;
  bones.forEach(([a,b]) => {
    if (!pts[a]||!pts[b]) return;
    ctx.beginPath(); ctx.moveTo(...pts[a]); ctx.lineTo(...pts[b]);
    ctx.strokeStyle = `${color}cc`; ctx.lineWidth = 2.5; ctx.stroke();
  });
  Object.entries(pts).forEach(([k,p]) => {
    const isHead = k==="head";
    ctx.beginPath(); ctx.arc(p[0],p[1],isHead?12:5,0,Math.PI*2);
    ctx.fillStyle = isHead?`${color}44`:`${color}99`; ctx.fill();
    if (isHead){ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.stroke();}
  });
  // Knee collapse indicator
  const kneeCollapse = detectKneeCollapse(
    { x: pts.lKnee[0] }, { x: pts.lAnkle[0] }
  );
  if (kneeCollapse) {
    const [kx,ky] = pts.lKnee;
    ctx.beginPath(); ctx.arc(kx,ky,14,0,Math.PI*2);
    ctx.strokeStyle="#ff4444"; ctx.lineWidth=2; ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle="#ff4444"; ctx.font="9px 'Barlow Condensed'"; ctx.fillText("KNEE IN",kx-18,ky-18);
  }
  if (lm.headForward>0.45){
    const [hx,hy]=pts.head;
    ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx,hy-16);
    ctx.strokeStyle="#ff6633";ctx.lineWidth=1.5;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle="#ff6633";ctx.font="9px 'Barlow Condensed'";ctx.fillText("FWD HEAD",hx+8,hy-8);
  }
  if (lm.pelvicTilt>0.45){
    const [hpx,hpy]=pts.hip;
    ctx.beginPath();ctx.arc(hpx,hpy,16,Math.PI*1.1,Math.PI*1.9);
    ctx.strokeStyle=B.gold;ctx.lineWidth=2;ctx.setLineDash([2,2]);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=B.gold;ctx.font="9px 'Barlow Condensed'";ctx.fillText("APT",hpx+18,hpy+4);
  }
  ctx.shadowBlur=0;
}

// ─── BOAWindow ─────────────────────────────────────────────────────────────────
interface BOAWindowProps {
  size?: "full"|"compact"|"mini";
  showSkeleton?: boolean;
  onDetection?: (result: any) => void;
  modeOverride?: string;
  label?: string;
  active?: boolean;
}

export function BOAWindow({
  size="compact", showSkeleton=true, onDetection, modeOverride, label="BOA LIVE", active=true,
}: BOAWindowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef(0);
  const afRef     = useRef<number|null>(null);
  const [detection, setDetection] = useState<any>(null);
  const [mode, setMode]           = useState("STEALTH");
  const [cues, setCues]           = useState<any[]>([]);
  const [scanLine, setScanLine]   = useState(0);

  const dims = { full:{h:320,skeleton:true}, compact:{h:220,skeleton:true}, mini:{h:140,skeleton:false} }[size];

  useEffect(()=>{
    if(!active) return;
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext("2d"); if(!ctx) return;
    const tick=()=>{
      frameRef.current++;
      const f=frameRef.current;
      const d=simulateDetection(f);
      const ucs=calcUCS(d.landmarks); const lcs=calcLCS(d.landmarks);
      const m=modeOverride||derivePantherMode(ucs,lcs);
      setDetection({...d,ucs,lcs}); setMode(m);
      if(onDetection) onDetection({...d,ucs,lcs,mode:m});
      setScanLine(prev=>(prev+1.8)%(canvas.height+10));
      const W=canvas.width=canvas.offsetWidth; const H=canvas.height=canvas.offsetHeight;
      ctx.clearRect(0,0,W,H);
      const mc=MODE_COLOR[m];
      ctx.fillStyle="#060608"; ctx.fillRect(0,0,W,H);
      // Grid
      ctx.strokeStyle="rgba(0,0,0,0.6)"; ctx.lineWidth=0.5;
      for(let x=0;x<W;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      // Skeleton
      if(showSkeleton&&dims.skeleton&&size!=="mini") drawPoseSkeleton(ctx,W,H,d.landmarks,mc.primary,f);
      // Scan line
      const sg=ctx.createLinearGradient(0,scanLine-8,0,scanLine+8);
      sg.addColorStop(0,"transparent"); sg.addColorStop(0.5,`${mc.primary}55`); sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg; ctx.fillRect(0,scanLine-8,W,16);
      // Corner brackets
      const bSize=18,bThick=2;
      ctx.strokeStyle=mc.primary; ctx.lineWidth=bThick; ctx.shadowColor=mc.primary; ctx.shadowBlur=6;
      [[0,0],[W,0],[0,H],[W,H]].forEach(([cx,cy])=>{
        const sx=cx===0?1:-1; const sy=cy===0?1:-1;
        ctx.beginPath(); ctx.moveTo(cx+sx*bSize,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy+sy*bSize); ctx.stroke();
      });
      ctx.shadowBlur=0;
      // Mode badge
      ctx.fillStyle=`${mc.primary}22`; roundRect(ctx,8,8,90,22,4); ctx.fill();
      ctx.strokeStyle=`${mc.primary}88`; ctx.lineWidth=1; roundRect(ctx,8,8,90,22,4); ctx.stroke();
      ctx.fillStyle=mc.primary; ctx.font="bold 10px 'Barlow Condensed'";
      ctx.fillText(`${mc.icon} ${mc.label}`,14,23);
      // Confidence
      ctx.fillStyle="rgba(0,0,0,0.6)"; roundRect(ctx,W-80,8,72,22,4); ctx.fill();
      ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.font="9px 'Barlow Condensed'";
      ctx.fillText(`${Math.round(d.confidence*100)}% · ${d.fps}fps`,W-76,23);
      // Bottom bar
      ctx.fillStyle=`${mc.primary}15`; ctx.fillRect(0,H-28,W,28);
      ctx.fillStyle=mc.primary; ctx.font="bold 9px 'Barlow Condensed'"; ctx.fillText(label,10,H-10);
      // UCS/LCS bars
      const barW=80,barH=5,bx=W-barW-10;
      ["UCS","LCS"].forEach((tag,i)=>{
        const val=i===0?ucs:lcs;
        const col=val>0.65?"#ff3333":val>0.4?B.gold:"#00cc66";
        const by=H-24+i*13;
        ctx.fillStyle="rgba(0,0,0,0.5)"; ctx.fillRect(bx-22,by-1,barW+24,barH+2);
        ctx.fillStyle="rgba(255,255,255,0.15)"; ctx.fillRect(bx,by,barW,barH);
        ctx.fillStyle=col; ctx.fillRect(bx,by,barW*val,barH);
        ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.font="8px 'Barlow Condensed'"; ctx.fillText(tag,bx-20,by+4);
      });
      afRef.current=requestAnimationFrame(tick);
    };
    tick();
    return()=>{if(afRef.current)cancelAnimationFrame(afRef.current);};
  },[active,showSkeleton,size,modeOverride,label,onDetection,dims.skeleton,scanLine]);

  useEffect(()=>{
    if(!detection) return;
    const lm=detection.landmarks;
    const next:any[]=[];
    if(lm.headForward>0.45)   next.push({type:"UCS",color:"#00aaff",text:"CHIN TUCK — Head Forward Detected"});
    if(lm.shoulderRound>0.45) next.push({type:"UCS",color:"#00aaff",text:"RETRACT SCAPULA — Shoulder Rounding"});
    if(lm.hipFlexion>0.55)    next.push({type:"LCS",color:B.gold,   text:"ACTIVATE GLUTES — Hip Flexion Dominance"});
    if(lm.kneeValgus>0.25)    next.push({type:"LCS",color:B.gold,   text:"DRIVE KNEES OUT — Valgus Collapse"});
    if(lm.pelvicTilt>0.5)     next.push({type:"LCS",color:B.gold,   text:"BRACE CORE — Anterior Pelvic Tilt"});
    if(next.length===0)        next.push({type:"OK", color:"#00cc66",text:"FORM CLEAN — Panther Mode Active"});
    setCues(next.slice(0,3));
  },[detection]);

  const mc=MODE_COLOR[mode];
  return (
    <div style={{borderRadius:14,overflow:"hidden",border:`1.5px solid ${mc.primary}55`,
      boxShadow:`0 0 24px ${mc.glow}`,position:"relative"}}>
      <canvas ref={canvasRef} style={{display:"block",width:"100%",height:dims.h,background:"#060608"}}/>
      {cues.length>0&&(
        <div style={{position:"absolute",bottom:32,left:8,right:8,display:"flex",flexDirection:"column",gap:3}}>
          {cues.map((c,i)=>(
            <div key={i} style={{background:"rgba(0,0,0,0.75)",borderLeft:`2px solid ${c.color}`,
              padding:"3px 8px",borderRadius:"0 4px 4px 0",fontSize:9,
              fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1.5,color:c.color}}>
              {c.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BOAEvalScreen ─────────────────────────────────────────────────────────────
interface BOAEvalScreenProps { onBack?: ()=>void; onComplete?: (result:any)=>void; }

export function BOAEvalScreen({ onBack, onComplete }: BOAEvalScreenProps) {
  type Phase = "INTRO"|"SCAN"|"ANALYSIS"|"RESULTS";
  const [phase, setPhase] = useState<Phase>("INTRO");
  const [scanProgress, setScanProgress] = useState(0);
  const [detection, setDetection] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const startScan = useCallback(()=>{
    setPhase("SCAN"); setScanProgress(0);
    timerRef.current = setInterval(()=>{
      setScanProgress(p=>{
        if(p>=100){
          clearInterval(timerRef.current!);
          setPhase("ANALYSIS");
          setTimeout(()=>{
            const ucs = detection?.ucs ?? 0.35;
            const lcs = detection?.lcs ?? 0.42;
            const mode = derivePantherMode(ucs,lcs);
            const r = {
              ucs: Math.round(ucs*100), lcs: Math.round(lcs*100),
              mode, score: Math.round((1-Math.max(ucs,lcs))*100),
              correctives: ucs>0.4?["Chin Tuck","Band Pull-Apart","Thoracic Extension"]:
                           lcs>0.4?["Hip Flexor Stretch","Glute Bridge","Dead Bug"]:[],
            };
            setResults(r); setPhase("RESULTS");
            if(onComplete) onComplete(r);
          }, 2000);
          return 100;
        }
        return p + 1.5;
      });
    }, 220);
  },[detection, onComplete]);

  useEffect(()=>()=>{if(timerRef.current)clearInterval(timerRef.current);},[]);

  const mc = results ? MODE_COLOR[results.mode] : MODE_COLOR["STEALTH"];

  return (
    <div style={{background:B.bg,minHeight:"100vh",color:B.white,fontFamily:"'Barlow Condensed',sans-serif"}}>
      <div style={{padding:"16px 16px 8px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"transparent",border:`1px solid ${B.grayMid}`,borderRadius:6,
          padding:"6px 12px",cursor:"pointer",color:B.dim,fontSize:11,letterSpacing:2,fontFamily:"inherit"}}>← BACK</button>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2}}>BOA ASSESSMENT</div>
        <div style={{marginLeft:"auto",fontSize:10,letterSpacing:2,color:B.dim}}>v2.0</div>
      </div>

      {phase==="INTRO"&&(
        <div style={{padding:"24px 20px",textAlign:"center"}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,letterSpacing:3,marginBottom:8}}>BIOMECHANICAL SCAN</div>
          <div style={{fontSize:14,color:B.dim,marginBottom:32,lineHeight:1.6}}>
            Stand 2–3 feet from camera.<br/>Full body visible. Neutral stance.
          </div>
          <BOAWindow size="full" active onDetection={setDetection} label="POSITIONING"/>
          <button onClick={startScan} style={{marginTop:24,width:"100%",padding:"18px 24px",
            borderRadius:8,background:B.red,border:"none",fontFamily:"'Bebas Neue',sans-serif",
            fontSize:20,letterSpacing:3,color:B.gold,cursor:"pointer"}}>
            BEGIN SCAN →
          </button>
        </div>
      )}

      {phase==="SCAN"&&(
        <div style={{padding:"24px 20px"}}>
          <BOAWindow size="full" active onDetection={setDetection} label="SCANNING..."/>
          <div style={{marginTop:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:11,letterSpacing:2,color:B.dim}}>SCAN PROGRESS</span>
              <span style={{fontSize:11,letterSpacing:2,color:B.gold}}>{Math.round(scanProgress)}%</span>
            </div>
            <div style={{height:4,background:B.gray,borderRadius:2}}>
              <div style={{height:"100%",width:`${scanProgress}%`,background:`linear-gradient(90deg,${B.red},${B.gold})`,
                borderRadius:2,transition:"width 0.2s"}}/>
            </div>
            <div style={{marginTop:12,fontSize:12,color:B.dim,textAlign:"center",letterSpacing:2}}>
              ANALYZING MOVEMENT PATTERNS...
            </div>
          </div>
        </div>
      )}

      {phase==="ANALYSIS"&&(
        <div style={{padding:"24px 20px",textAlign:"center"}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:3,color:B.gold,marginBottom:16}}>
            PANTHER BRAIN PROCESSING
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:24}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{width:10,height:10,borderRadius:"50%",background:B.gold,
                animation:`pulse 1.2s ease-in-out ${i*0.4}s infinite`}}/>
            ))}
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2}}}`}</style>
        </div>
      )}

      {phase==="RESULTS"&&results&&(
        <div style={{padding:"20px"}}>
          <div style={{background:B.gray,borderRadius:16,padding:20,marginBottom:16,
            border:`1px solid ${mc.primary}44`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontSize:10,letterSpacing:3,color:B.dim}}>PANTHER MODE</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,color:mc.primary}}>
                  {mc.icon} {results.mode}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:10,letterSpacing:3,color:B.dim}}>MOVEMENT SCORE</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:40,color:
                  results.score>=70?"#00cc66":results.score>=50?B.gold:"#ff4444"}}>{results.score}</div>
              </div>
            </div>
            {[{label:"UCS SCORE",val:results.ucs,hi:65},{label:"LCS SCORE",val:results.lcs,hi:65}].map(s=>(
              <div key={s.label} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:10,letterSpacing:2,color:B.dim}}>{s.label}</span>
                  <span style={{fontSize:10,letterSpacing:2,color:s.val>s.hi?"#ff4444":B.green}}>{s.val}</span>
                </div>
                <div style={{height:5,background:"rgba(255,255,255,0.1)",borderRadius:3}}>
                  <div style={{height:"100%",width:`${s.val}%`,borderRadius:3,
                    background:s.val>s.hi?"#ff4444":B.green,transition:"width 0.6s ease"}}/>
                </div>
              </div>
            ))}
          </div>
          {results.correctives.length>0&&(
            <div style={{background:"rgba(200,151,58,0.08)",border:"1px solid rgba(200,151,58,0.25)",
              borderRadius:12,padding:16,marginBottom:16}}>
              <div style={{fontSize:9,letterSpacing:3,color:B.gold,marginBottom:10}}>CORRECTIVE PRESCRIPTION</div>
              {results.correctives.map((c:string,i:number)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:B.gold,flexShrink:0}}/>
                  <div style={{fontSize:14,color:B.white}}>{c}</div>
                </div>
              ))}
            </div>
          )}
          <button onClick={onBack} style={{width:"100%",padding:"16px 24px",borderRadius:8,
            background:B.red,border:"none",fontFamily:"'Bebas Neue',sans-serif",
            fontSize:18,letterSpacing:3,color:B.gold,cursor:"pointer"}}>
            START CORRECTIVE WORKOUT →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── BOAWorkoutScreen v2 ───────────────────────────────────────────────────────
interface BOAWorkoutScreenProps {
  exercises?: Array<{id:string;name:string;sets:number;reps:string}>;
  onBack?: ()=>void;
}

export function BOAWorkoutScreen({exercises=[],onBack}:BOAWorkoutScreenProps){
  const [detection,setDetection]=useState<any>(null);
  const [completed,setCompleted]=useState<Set<string>>(new Set());

  // ── Risk Detection State ────────────────────────────────────────────────────
  const [repScores,setRepScores]=useState<number[]>([]);
  const [fatigue,setFatigue]=useState(0);
  const [voiceCue,setVoiceCue]=useState<string>("Lock in.");
  const [riskWarning,setRiskWarning]=useState<string|null>(null);
  const [correctiveQueue,setCorrectiveQueue]=useState<string[]>([]);
  const [recoveryActive,setRecoveryActive]=useState(false);
  const [regressedTo,setRegressedTo]=useState<string|null>(null);
  const [movementQuality,setMovementQuality]=useState<number|null>(null);
  const warnTimer=useRef<ReturnType<typeof setTimeout>|null>(null);

  const list=exercises.length?exercises:[
    {id:"squat",     name:"Squat",      sets:3,reps:"12-15"},
    {id:"hinge",     name:"Hip Hinge",  sets:3,reps:"10-12"},
    {id:"pushup",    name:"Push-Up",    sets:3,reps:"10-15"},
    {id:"plank",     name:"Plank Hold", sets:3,reps:"30s"},
    {id:"bear_crawl",name:"Bear Crawl", sets:2,reps:"20s"},
  ];

  const currentExId = list[Math.max(0, completed.size - (completed.size >= list.length ? 1 : 0))]?.id ?? "";

  // Simulate rep score every 6s — drives all risk detection
  useEffect(()=>{
    const iv=setInterval(()=>{
      const score=Math.round(50+Math.random()*50);
      setRepScores(prev=>{
        const next=[...prev,score];
        const newFatigue=Math.min(100,Math.round((next.length/25)*100));
        setFatigue(newFatigue);
        setMovementQuality(calculateMovementQuality(next));

        // Form drop
        if(detectFormDrop(next)){
          const cue=getPantherCue("formDrop");
          setVoiceCue(cue); setRiskWarning(cue);
          if(warnTimer.current)clearTimeout(warnTimer.current);
          warnTimer.current=setTimeout(()=>setRiskWarning(null),4000);
          const reg=regressExercise(currentExId);
          if(reg)setRegressedTo(reg);
        }

        // Corrective injection
        if(score<70){
          setCorrectiveQueue(injectCorrective(score));
        }

        // High risk → recovery mode
        const profile:RiskProfile={fatigue_level:newFatigue,form_score:score};
        if(isHighRisk(profile)){
          setRecoveryActive(true);
          const cue=getPantherCue("highRisk");
          setVoiceCue(cue); setRiskWarning(cue);
          if(warnTimer.current)clearTimeout(warnTimer.current);
          warnTimer.current=setTimeout(()=>setRiskWarning(null),5000);
        }

        // Knee collapse check (simulated)
        if(detection?.landmarks){
          const lm=detection.landmarks;
          const kneeX=0.40+lm.kneeValgus*8/100;
          const ankleX=0.39;
          if(detectKneeCollapse({x:kneeX},{x:ankleX})){
            const cue=getPantherCue("kneeIn");
            setVoiceCue(cue);
          }
        }

        return next;
      });
    },6000);
    return()=>{
      clearInterval(iv);
      if(warnTimer.current)clearTimeout(warnTimer.current);
    };
  },[currentExId,detection]);

  const toggle=(id:string)=>setCompleted(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
  const mode=detection?derivePantherMode(detection.ucs??0,detection.lcs??0):"STEALTH";
  const mc=MODE_COLOR[mode];

  return(
    <div style={{background:B.bg,minHeight:"100vh",color:B.white,fontFamily:"'Barlow Condensed',sans-serif"}}>
      {/* Header */}
      <div style={{padding:"16px 16px 8px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"transparent",border:`1px solid ${B.grayMid}`,borderRadius:6,
          padding:"6px 12px",cursor:"pointer",color:B.dim,fontSize:11,letterSpacing:2,fontFamily:"inherit"}}>← BACK</button>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2}}>ACTIVE WORKOUT</div>
        <div style={{marginLeft:"auto",fontSize:11,letterSpacing:2,color:mc.primary}}>{mc.icon} {mc.label}</div>
      </div>

      {/* Risk Warning Banner */}
      {riskWarning&&(
        <div style={{background:"linear-gradient(90deg,rgba(139,0,0,0.95),rgba(180,0,0,0.95))",
          borderBottom:"2px solid #FF4444",padding:"10px 16px",
          display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:16}}>⚠️</span>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,letterSpacing:2,color:"#FF9999"}}>PANTHER ALERT</div>
            <div style={{fontSize:13,color:"#fff",letterSpacing:1}}>{riskWarning}</div>
          </div>
          {movementQuality!==null&&(
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,letterSpacing:2,color:"rgba(255,255,255,0.4)"}}>MQ</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,
                color:movementQuality>=70?"#00CC66":"#FF4444"}}>{movementQuality}</div>
            </div>
          )}
        </div>
      )}

      {/* Recovery Mode Banner */}
      {recoveryActive&&(
        <div style={{background:"rgba(0,100,0,0.9)",borderBottom:"2px solid #00CC66",
          padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:16}}>🛡️</span>
            <div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,letterSpacing:2,color:"#00FF88"}}>RECOVERY MODE</div>
              {regressedTo&&<div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>Regressed to: {regressedTo}</div>}
            </div>
          </div>
          <button onClick={()=>{setRecoveryActive(false);setRegressedTo(null);}}
            style={{background:"none",border:"1px solid #00CC66",borderRadius:6,color:"#00CC66",
              fontSize:10,letterSpacing:2,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit"}}>
            DISMISS
          </button>
        </div>
      )}

      {/* Corrective Queue Banner */}
      {correctiveQueue.length>0&&detectFormDrop(repScores)&&(
        <div style={{background:"rgba(200,151,58,0.1)",borderBottom:"1px solid rgba(200,151,58,0.25)",
          padding:"8px 16px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:13}}>🦴</span>
          <div style={{fontSize:11,color:B.gold,letterSpacing:1}}>
            Correctives queued: {correctiveQueue.join(" · ")}
          </div>
        </div>
      )}

      <div style={{padding:"12px 16px 16px"}}>
        {/* Panther Voice */}
        <div style={{background:"#111",borderRadius:10,padding:"10px 14px",marginBottom:12,
          display:"flex",alignItems:"center",gap:10,border:"1px solid #1a1a1a"}}>
          <span style={{fontSize:16}}>🐆</span>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,color:B.gold,
            letterSpacing:1,fontStyle:"italic"}}>"{voiceCue}"</div>
          {fatigue>0&&(
            <div style={{marginLeft:"auto",textAlign:"right"}}>
              <div style={{fontSize:9,letterSpacing:2,color:B.dim}}>FATIGUE</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,
                color:fatigue>75?"#FF4444":fatigue>50?B.gold:"#00CC66"}}>{fatigue}%</div>
            </div>
          )}
        </div>

        {/* BOA Window */}
        <div style={{marginBottom:14}}>
          <BOAWindow size="compact" active onDetection={setDetection} label="FORM MONITOR"/>
        </div>

        {/* Exercise Checklist */}
        <div style={{background:"#111",borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",fontSize:9,letterSpacing:3,color:B.gold,borderBottom:"1px solid #1a1a1a",
            display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>TODAY'S EXERCISES — {completed.size}/{list.length} COMPLETE</span>
            {movementQuality!==null&&(
              <span style={{color:movementQuality>=70?"#00CC66":movementQuality>=50?B.gold:"#FF4444"}}>
                MQ: {movementQuality}
              </span>
            )}
          </div>
          {list.map((ex,i)=>{
            const done=completed.has(ex.id);
            const isRegressed=!done&&recoveryActive&&regressedTo&&ex.id===currentExId;
            return(
              <div key={ex.id} onClick={()=>toggle(ex.id)} style={{display:"flex",alignItems:"center",gap:12,
                padding:"12px 14px",cursor:"pointer",borderBottom:i<list.length-1?"1px solid #1a1a1a":"none",
                background:done?"rgba(0,204,102,0.05)":isRegressed?"rgba(0,100,0,0.08)":"transparent",
                transition:"background 0.2s"}}>
                <div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,
                  border:`2px solid ${done?"#00cc66":isRegressed?"#00CC66":"#333"}`,
                  background:done?"#00cc66":"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,
                  color:done?"#000":"transparent"}}>✓</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:done?B.dim:B.white,
                    textDecoration:done?"line-through":"none"}}>{ex.name}</div>
                  <div style={{fontSize:11,color:B.dim,marginTop:2}}>
                    {ex.sets} sets × {ex.reps}
                    {isRegressed&&<span style={{color:"#00CC66",marginLeft:8}}>→ {regressedTo}</span>}
                  </div>
                </div>
                <div style={{fontSize:20}}>{done?"✅":isRegressed?"🛡️":"▶"}</div>
              </div>
            );
          })}
        </div>

        {/* Workout Complete */}
        {completed.size===list.length&&(
          <div style={{marginTop:14,padding:16,background:"rgba(0,204,102,0.1)",
            border:"1px solid rgba(0,204,102,0.3)",borderRadius:12,textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:3,color:"#00cc66"}}>
              WORKOUT COMPLETE
            </div>
            <div style={{fontSize:13,color:B.dim,marginTop:4}}>Strong finish. You earned that.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BOASystem (root demo / router) ───────────────────────────────────────────
export function BOASystem(){
  const [screen,setScreen]=useState<"home"|"eval"|"workout">("home");
  if(screen==="eval")    return <BOAEvalScreen    onBack={()=>setScreen("home")} onComplete={()=>setScreen("home")}/>;
  if(screen==="workout") return <BOAWorkoutScreen onBack={()=>setScreen("home")}/>;
  return(
    <div style={{background:B.bg,minHeight:"100vh",color:B.white,fontFamily:"'Barlow Condensed',sans-serif",padding:20}}>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:3,marginBottom:4}}>
        BOA SYSTEM v2.0
      </div>
      <div style={{fontSize:12,color:B.dim,letterSpacing:2,marginBottom:24}}>
        BIOMECHANICAL OVERLAY ARCHITECTURE
      </div>
      <BOAWindow size="compact" active label="LIVE MONITOR"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:20}}>
        {[
          {label:"FULL ASSESSMENT",sub:"UCS/LCS Scan",icon:"◈",action:()=>setScreen("eval")},
          {label:"ACTIVE WORKOUT",sub:"Form Monitor",icon:"◆",action:()=>setScreen("workout")},
        ].map(btn=>(
          <button key={btn.label} onClick={btn.action} style={{background:B.gray,border:`1px solid ${B.grayMid}`,
            borderRadius:12,padding:"20px 16px",cursor:"pointer",textAlign:"left",color:B.white,fontFamily:"inherit"}}>
            <div style={{fontSize:22,marginBottom:6}}>{btn.icon}</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2}}>{btn.label}</div>
            <div style={{fontSize:11,color:B.dim,marginTop:2}}>{btn.sub}</div>
          </button>
        ))}
      </div>
      <div style={{marginTop:16,padding:12,background:"rgba(200,151,58,0.08)",
        border:"1px solid rgba(200,151,58,0.2)",borderRadius:10}}>
        <div style={{fontSize:9,letterSpacing:3,color:B.gold,marginBottom:6}}>v2 CAPABILITIES</div>
        {[
          "detectFormDrop — rolling 5-rep avg < 65",
          "detectKneeCollapse — knee.x < ankle.x",
          "isHighRisk — fatigue > 75 && form < 70",
          "injectCorrective — queues correctives on form drop",
          "regressExercise — auto-substitutes on risk",
          "Recovery Mode — active workout protection",
          "Panther Voice — calm_intense, directive cues",
        ].map((f,i)=>(
          <div key={i} style={{fontSize:11,color:B.dim,marginBottom:3,display:"flex",gap:8}}>
            <span style={{color:B.green}}>✓</span>{f}
          </div>
        ))}
      </div>
    </div>
  );
}
