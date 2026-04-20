/**
 * BOA — BIOMECHANICAL OVERLAY ARCHITECTURE
 * Visual Window System v1.0
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 *
 * Exports:
 *   <BOAWindow />        — reusable camera + pose overlay viewport
 *   <BOAEvalScreen />    — full UCS/LCS assessment flow (INTRO→SCAN→ANALYSIS→RESULTS)
 *   <BOAWorkoutScreen /> — active workout with live BOA window + exercise checklist
 *   <BOASystem />        — root demo / router
 */
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const B = {
  bg: "#080808", red: "#8B0000", redLight: "#A50000",
  gold: "#C8973A", white: "#F2F2F2", dim: "rgba(242,242,242,0.45)",
  gray: "#1A1A1A", grayMid: "#242424",
};

const MODE_COLOR: Record<string, { primary: string; glow: string; label: string; icon: string }> = {
  STEALTH:   { primary: "#00aaff", glow: "rgba(0,150,255,0.5)",  label: "STEALTH",   icon: "◈" },
  PRECISION: { primary: B.gold,    glow: "rgba(200,151,58,0.5)", label: "PRECISION", icon: "◎" },
  ATTACK:    { primary: "#ff2222", glow: "rgba(255,30,30,0.6)",  label: "ATTACK",    icon: "◆" },
};

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
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef(0);
  const afRef     = useRef<number|null>(null);
  const [cameraOn, setCameraOn]   = useState(false);
  const [detection, setDetection] = useState<any>(null);
  const [mode, setMode]           = useState("STEALTH");
  const [cues, setCues]           = useState<any[]>([]);
  const [scanLine, setScanLine]   = useState(0);

  const dims = { full:{h:320,skeleton:true}, compact:{h:220,skeleton:true}, mini:{h:140,skeleton:false} }[size];

  const startCamera = useCallback(async()=>{
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"}});
      if(videoRef.current){videoRef.current.srcObject=stream;setCameraOn(true);}
    } catch { setCameraOn(false); }
  },[]);

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
      ctx.strokeStyle="rgba(0,0,0,0.6)"; ctx.lineWidth=0.5;
      for(let x=0;x<W;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      if(showSkeleton&&dims.skeleton&&size!=="mini") drawPoseSkeleton(ctx,W,H,d.landmarks,mc.primary,f);
      const sg=ctx.createLinearGradient(0,scanLine-8,0,scanLine+8);
      sg.addColorStop(0,"transparent"); sg.addColorStop(0.5,`${mc.primary}55`); sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg; ctx.fillRect(0,scanLine-8,W,16);
      const bSize=18,bThick=2;
      ctx.strokeStyle=mc.primary; ctx.lineWidth=bThick; ctx.shadowColor=mc.primary; ctx.shadowBlur=6;
      [[0,0],[W,0],[0,H],[W,H]].forEach(([cx,cy])=>{
        const sx=cx===0?1:-1; const sy=cy===0?1:-1;
        ctx.beginPath(); ctx.moveTo(cx+sx*bSize,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy+sy*bSize); ctx.stroke();
      });
      ctx.shadowBlur=0;
      ctx.fillStyle=`${mc.primary}22`; roundRect(ctx,8,8,90,22,4); ctx.fill();
      ctx.strokeStyle=`${mc.primary}88`; ctx.lineWidth=1; roundRect(ctx,8,8,90,22,4); ctx.stroke();
      ctx.fillStyle=mc.primary; ctx.font="bold 10px 'Barlow Condensed'";
      ctx.fillText(`${mc.icon} ${mc.label}`,14,23);
      ctx.fillStyle="rgba(0,0,0,0.6)"; roundRect(ctx,W-80,8,72,22,4); ctx.fill();
      ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.font="9px 'Barlow Condensed'";
      ctx.fillText(`${Math.round(d.confidence*100)}% · ${d.fps}fps`,W-76,23);
      ctx.fillStyle=`${mc.primary}15`; ctx.fillRect(0,H-28,W,28);
      ctx.fillStyle=mc.primary; ctx.font="bold 9px 'Barlow Condensed'"; ctx.fillText(label,10,H-10);
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
      boxShadow:`0 0 24px ${mc.glow}, inset 0 0 40px rgba(0,0,0,0.4)`,position:"relative",
      transition:"border-color 0.5s, box-shadow 0.5s"}}>
      <div style={{position:"relative",height:dims.h,background:"#060608"}}>
        {cameraOn&&<video ref={videoRef} autoPlay muted playsInline
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.4}}/>}
        <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",display:"block"}}/>
        {!cameraOn&&(
          <button onClick={startCamera} style={{position:"absolute",bottom:36,right:10,
            background:"rgba(0,0,0,0.6)",border:`1px solid ${mc.primary}44`,borderRadius:6,
            padding:"5px 10px",cursor:"pointer",fontSize:9,letterSpacing:2,color:mc.primary,
            fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>📷 ENABLE CAM</button>
        )}
      </div>
      {size!=="mini"&&cues.length>0&&(
        <div style={{background:"rgba(0,0,0,0.85)",borderTop:`1px solid ${mc.primary}33`}}>
          {cues.map((c,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,margin:"4px 8px"}}>
              <span style={{fontSize:8,letterSpacing:2,padding:"2px 6px",
                background:`${c.color}18`,border:`1px solid ${c.color}44`,borderRadius:3,
                color:c.color,fontWeight:700,flexShrink:0,fontFamily:"'Barlow Condensed',sans-serif"}}>{c.type}</span>
              <span style={{fontSize:11,letterSpacing:1,color:"rgba(255,255,255,0.75)",fontFamily:"'Barlow Condensed',sans-serif"}}>{c.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BOAEvalScreen ─────────────────────────────────────────────────────────────
interface BOAEvalScreenProps { onBack?:()=>void; onComplete?:(result:any)=>void; }

export function BOAEvalScreen({onBack,onComplete}:BOAEvalScreenProps){
  const [phase,setPhase]=useState<"INTRO"|"SCAN"|"ANALYSIS"|"RESULTS">("INTRO");
  const [detection,setDetection]=useState<any>(null);
  const [history,setHistory]=useState<any[]>([]);
  const [elapsed,setElapsed]=useState(0);
  const [scanPct,setScanPct]=useState(0);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const SCAN_DURATION=15;

  const startScan=()=>{
    setPhase("SCAN"); setElapsed(0); setScanPct(0);
    timerRef.current=setInterval(()=>{
      setElapsed(e=>{
        const next=e+0.1;
        setScanPct(Math.min(1,next/SCAN_DURATION));
        if(next>=SCAN_DURATION){
          clearInterval(timerRef.current!);
          setPhase("ANALYSIS");
          setTimeout(()=>setPhase("RESULTS"),2000);
        }
        return next;
      });
    },100);
  };

  useEffect(()=>()=>{if(timerRef.current)clearInterval(timerRef.current);},[]);
  useEffect(()=>{if(phase==="SCAN"&&detection)setHistory(h=>[...h.slice(-60),detection]);},[detection,phase]);

  const avg=history.length?{
    ucs:history.reduce((s,d)=>s+d.ucs,0)/history.length,
    lcs:history.reduce((s,d)=>s+d.lcs,0)/history.length,
  }:null;
  const avgMode=avg?derivePantherMode(avg.ucs,avg.lcs):"STEALTH";
  const mc=MODE_COLOR[avgMode];

  const prescriptions=avg?[
    avg.ucs>0.5&&{region:"UCS",fix:"Chin Tucks — 3×10 daily",priority:"HIGH"},
    avg.ucs>0.4&&{region:"UCS",fix:"Thoracic Extension Mobilization",priority:"MED"},
    avg.lcs>0.5&&{region:"LCS",fix:"Glute Activation — Bridges 3×15",priority:"HIGH"},
    avg.lcs>0.4&&{region:"LCS",fix:"Hip Flexor Stretch — 60s each side",priority:"MED"},
  ].filter(Boolean):[];

  return(
    <div style={{background:B.bg,minHeight:"100vh",color:B.white,fontFamily:"'Barlow Condensed',sans-serif"}}>
      <div style={{padding:"16px 16px 12px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"transparent",border:`1px solid ${B.grayMid}`,borderRadius:6,
          padding:"6px 12px",cursor:"pointer",color:B.dim,fontSize:11,letterSpacing:2,fontFamily:"inherit"}}>← BACK</button>
        <div>
          <div style={{fontSize:9,letterSpacing:3,color:"#00aaff",fontWeight:700}}>BOA SYSTEM</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:2}}>MOVEMENT ASSESSMENT</div>
        </div>
        <div style={{marginLeft:"auto",fontSize:9,letterSpacing:2,color:"#00cc66",display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#00cc66",display:"inline-block"}}/>BOA ACTIVE
        </div>
      </div>
      <div style={{padding:16}}>
        {phase==="INTRO"&&(
          <div>
            <div style={{background:"linear-gradient(145deg,#0e0e0e,#151515)",borderRadius:12,padding:20,marginBottom:16}}>
              <div style={{fontSize:48,marginBottom:12}}>🐆</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,marginBottom:8}}>BIOMECHANICAL ASSESSMENT</div>
              <div style={{fontSize:14,color:B.dim,lineHeight:1.6,marginBottom:16}}>
                Panther analyzes your posture and movement for UCS and LCS indicators.
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
                {[{icon:"📐",label:"UCS SCAN",desc:"Head, neck, shoulder alignment"},
                  {icon:"🦴",label:"LCS SCAN",desc:"Hip, pelvis, knee tracking"},
                  {icon:"⚡",label:"PANTHER MODE",desc:"STEALTH / PRECISION / ATTACK"},
                  {icon:"💊",label:"CORRECTIVES",desc:"Personalized prescriptions"}].map(item=>(
                  <div key={item.label} style={{background:"#111",borderRadius:8,padding:"12px 14px",border:"1px solid #222"}}>
                    <div style={{fontSize:20,marginBottom:4}}>{item.icon}</div>
                    <div style={{fontSize:11,letterSpacing:2,color:"#00aaff",fontWeight:700}}>{item.label}</div>
                    <div style={{fontSize:12,color:B.dim,marginTop:2}}>{item.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={startScan} style={{width:"100%",padding:"14px 0",
                background:`linear-gradient(135deg,${B.red},${B.redLight})`,border:"none",borderRadius:8,
                cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:3,color:B.white}}>
                BEGIN ASSESSMENT
              </button>
            </div>
          </div>
        )}
        {phase==="SCAN"&&(
          <div>
            <BOAWindow size="full" active onDetection={setDetection} label="SCANNING MOVEMENT"/>
            <div style={{marginTop:12,background:"#111",borderRadius:8,padding:"10px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:11,letterSpacing:2,color:"#00aaff"}}>SCAN PROGRESS</span>
                <span style={{fontSize:11,color:B.dim}}>{Math.round(elapsed)}s / {SCAN_DURATION}s</span>
              </div>
              <div style={{height:4,background:"#222",borderRadius:2}}>
                <div style={{height:"100%",width:`${scanPct*100}%`,background:"#00aaff",borderRadius:2,transition:"width 0.1s"}}/>
              </div>
              <div style={{marginTop:8,fontSize:12,color:B.dim}}>Stand naturally. Perform a slow squat if possible.</div>
            </div>
          </div>
        )}
        {phase==="ANALYSIS"&&(
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontSize:48,marginBottom:16}}>⚡</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:3,color:"#00aaff"}}>ANALYZING MOVEMENT</div>
            <div style={{fontSize:14,color:B.dim,marginTop:8}}>Panther Brain processing your data...</div>
          </div>
        )}
        {phase==="RESULTS"&&avg&&(
          <div>
            <div style={{marginBottom:16,background:"#111",borderRadius:12,padding:16,border:`1px solid ${mc.primary}33`}}>
              <div style={{fontSize:9,letterSpacing:3,color:mc.primary,marginBottom:4}}>PANTHER MODE DETECTED</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:3,color:mc.primary}}>{mc.icon} {mc.label}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12}}>
                {[{label:"UCS SCORE",val:avg.ucs,color:avg.ucs>0.5?"#ff3333":B.gold},
                  {label:"LCS SCORE",val:avg.lcs,color:avg.lcs>0.5?"#ff3333":B.gold}].map(item=>(
                  <div key={item.label} style={{background:"#0a0a0a",borderRadius:8,padding:"10px 12px"}}>
                    <div style={{fontSize:9,letterSpacing:2,color:B.dim}}>{item.label}</div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:item.color}}>{Math.round(item.val*100)}</div>
                    <div style={{height:3,background:"#222",borderRadius:2,marginTop:4}}>
                      <div style={{height:"100%",width:`${item.val*100}%`,background:item.color,borderRadius:2}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {prescriptions.length>0&&(
              <div style={{background:"#111",borderRadius:12,padding:16,marginBottom:16}}>
                <div style={{fontSize:9,letterSpacing:3,color:B.gold,marginBottom:12}}>CORRECTIVE PRESCRIPTIONS</div>
                {prescriptions.map((p:any,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",
                    borderBottom:i<prescriptions.length-1?"1px solid #1a1a1a":"none"}}>
                    <span style={{fontSize:8,letterSpacing:2,padding:"2px 6px",
                      background:p.priority==="HIGH"?"#ff333318":`${B.gold}18`,
                      border:`1px solid ${p.priority==="HIGH"?"#ff3333":B.gold}44`,borderRadius:3,
                      color:p.priority==="HIGH"?"#ff3333":B.gold,fontWeight:700,flexShrink:0}}>{p.region}</span>
                    <span style={{fontSize:13,color:B.white}}>{p.fix}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={()=>{if(onComplete)onComplete({avg,mode:avgMode,prescriptions});}}
              style={{width:"100%",padding:"14px 0",background:`linear-gradient(135deg,${B.red},${B.redLight})`,
                border:"none",borderRadius:8,cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",
                fontSize:20,letterSpacing:3,color:B.white}}>SAVE RESULTS & CONTINUE</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BOAWorkoutScreen ──────────────────────────────────────────────────────────
interface BOAWorkoutScreenProps {
  exercises?: Array<{id:string;name:string;sets:number;reps:string}>;
  onBack?: ()=>void;
}

export function BOAWorkoutScreen({exercises=[],onBack}:BOAWorkoutScreenProps){
  const [detection,setDetection]=useState<any>(null);
  const [completed,setCompleted]=useState<Set<string>>(new Set());

  const list=exercises.length?exercises:[
    {id:"squat",     name:"Squat",      sets:3,reps:"12-15"},
    {id:"hinge",     name:"Hip Hinge",  sets:3,reps:"10-12"},
    {id:"pushup",    name:"Push-Up",    sets:3,reps:"10-15"},
    {id:"plank",     name:"Plank Hold", sets:3,reps:"30s"},
    {id:"bear_crawl",name:"Bear Crawl", sets:2,reps:"20s"},
  ];

  const toggle=(id:string)=>setCompleted(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
  const mode=detection?derivePantherMode(detection.ucs??0,detection.lcs??0):"STEALTH";
  const mc=MODE_COLOR[mode];

  return(
    <div style={{background:B.bg,minHeight:"100vh",color:B.white,fontFamily:"'Barlow Condensed',sans-serif"}}>
      <div style={{padding:"16px 16px 8px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"transparent",border:`1px solid ${B.grayMid}`,borderRadius:6,
          padding:"6px 12px",cursor:"pointer",color:B.dim,fontSize:11,letterSpacing:2,fontFamily:"inherit"}}>← BACK</button>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2}}>ACTIVE WORKOUT</div>
        <div style={{marginLeft:"auto",fontSize:11,letterSpacing:2,color:mc.primary}}>{mc.icon} {mc.label}</div>
      </div>
      <div style={{padding:"0 16px 16px"}}>
        <div style={{marginBottom:14}}><BOAWindow size="compact" active onDetection={setDetection} label="FORM MONITOR"/></div>
        <div style={{background:"#111",borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",fontSize:9,letterSpacing:3,color:B.gold,borderBottom:"1px solid #1a1a1a"}}>
            TODAY'S EXERCISES — {completed.size}/{list.length} COMPLETE
          </div>
          {list.map((ex,i)=>{
            const done=completed.has(ex.id);
            return(
              <div key={ex.id} onClick={()=>toggle(ex.id)} style={{display:"flex",alignItems:"center",gap:12,
                padding:"12px 14px",cursor:"pointer",borderBottom:i<list.length-1?"1px solid #1a1a1a":"none",
                background:done?"rgba(0,204,102,0.05)":"transparent",transition:"background 0.2s"}}>
                <div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,
                  border:`2px solid ${done?"#00cc66":"#333"}`,background:done?"#00cc66":"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:done?"#000":"transparent"}}>✓</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:done?B.dim:B.white,textDecoration:done?"line-through":"none"}}>{ex.name}</div>
                  <div style={{fontSize:11,color:B.dim,marginTop:2}}>{ex.sets} sets × {ex.reps}</div>
                </div>
                <div style={{fontSize:20}}>{done?"✅":"▶"}</div>
              </div>
            );
          })}
        </div>
        {completed.size===list.length&&(
          <div style={{marginTop:14,padding:16,background:"rgba(0,204,102,0.1)",
            border:"1px solid rgba(0,204,102,0.3)",borderRadius:12,textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:3,color:"#00cc66"}}>WORKOUT COMPLETE</div>
            <div style={{fontSize:13,color:B.dim,marginTop:4}}>Strong finish. You earned that.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BOASystem (root demo) ─────────────────────────────────────────────────────
export function BOASystem(){
  const [screen,setScreen]=useState<"home"|"eval"|"workout">("home");
  if(screen==="eval")    return <BOAEvalScreen    onBack={()=>setScreen("home")} onComplete={()=>setScreen("home")}/>;
  if(screen==="workout") return <BOAWorkoutScreen onBack={()=>setScreen("home")}/>;
  return(
    <div style={{background:B.bg,minHeight:"100vh",color:B.white,fontFamily:"'Barlow Condensed',sans-serif",padding:20}}>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:3,marginBottom:4}}>BOA SYSTEM</div>
      <div style={{fontSize:12,color:B.dim,letterSpacing:2,marginBottom:20}}>BIOMECHANICAL OVERLAY ARCHITECTURE v1.0</div>
      <BOAWindow size="compact" active label="BOA DEMO"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:16}}>
        <button onClick={()=>setScreen("eval")} style={{padding:"14px 0",
          background:`linear-gradient(135deg,${B.red},${B.redLight})`,border:"none",borderRadius:8,
          cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:3,color:B.white}}>FULL ASSESSMENT</button>
        <button onClick={()=>setScreen("workout")} style={{padding:"14px 0",background:"#111",
          border:`1px solid ${B.gold}44`,borderRadius:8,cursor:"pointer",
          fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:3,color:B.gold}}>WORKOUT MODE</button>
      </div>
    </div>
  );
}

export default BOASystem;
