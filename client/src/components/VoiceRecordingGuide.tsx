/**
 * VoiceRecordingGuide — Step-by-step guide for Marc to record his voice in ElevenLabs
 *
 * Shown in Settings → App Preferences → Coach Voice section
 * Guides Marc through:
 * 1. Recording the voice sample (what to say, how to say it)
 * 2. Uploading to ElevenLabs Voice Lab
 * 3. Copying the Voice ID
 * 4. Adding it to the app via Settings
 */
import { useState } from "react";
import { ChevronDown, ChevronUp, Mic, ExternalLink, CheckCircle, Copy } from "lucide-react";

const RECORDING_SCRIPT = `[CALM — COACHING VOICE]
"Lock in. Every rep counts. Control the movement — don't let the weight control you. Three sets. Let's go."

[MOTIVATIONAL — BUILDING ENERGY]
"You showed up. That's already more than most. Now let's make it count. Push through. I'm right here with you."

[DRILL SERGEANT — INTENSE]
"No excuses. No shortcuts. Drive through the floor. Explode up. Again. AGAIN. You don't stop until I say stop."

[RECOVERY — CALM AND SLOW]
"Breathe. Let your body recover. You did the work. Now let it absorb. Slow your heart rate down. You earned this."

[TECHNICAL — PRECISE]
"Hinge at the hip. Spine neutral. Hamstrings loaded. Control the descent — three count down, one count hold, drive up."

[WORKOUT CUE — SHORT AND SHARP]
"Next up — barbell squat. Four sets of eight. Drive through the floor. Let's go."
"Control it. Slow down. Feel every inch of that movement."
"Explode! Power through! Drive!"
"Hold strong. Don't break. Breathe."
"Recovery. Breathe it in. Let it go."`;

interface Props {
  onVoiceIdSaved?: (id: string) => void;
}

export default function VoiceRecordingGuide({ onVoiceIdSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [voiceId, setVoiceId] = useState("");
  const [saved, setSaved] = useState(false);

  const copyScript = () => {
    navigator.clipboard.writeText(RECORDING_SCRIPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const saveVoiceId = () => {
    if (!voiceId.trim()) return;
    localStorage.setItem("tuf_elevenlabs_voice_id", voiceId.trim());
    setSaved(true);
    onVoiceIdSaved?.(voiceId.trim());
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-orange-300">Record Your Panther Voice</span>
          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">SETUP REQUIRED</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-orange-400" /> : <ChevronDown className="w-4 h-4 text-orange-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-orange-500/20">
          <p className="text-xs text-muted-foreground pt-3">
            The Panther Voice is currently using a placeholder voice. Record your actual voice in ElevenLabs Voice Lab to make it authentically yours. This is what users will hear during every workout.
          </p>

          {/* Steps */}
          <div className="space-y-3">
            {[
              {
                step: "1",
                title: "Copy the recording script",
                desc: "These lines cover all 5 personality modes. Record each section in the correct tone.",
                action: (
                  <button
                    onClick={copyScript}
                    className="flex items-center gap-1.5 text-xs bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-lg hover:bg-orange-500/30 transition-colors"
                  >
                    {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy Script"}
                  </button>
                ),
              },
              {
                step: "2",
                title: "Record in ElevenLabs Voice Lab",
                desc: "Go to elevenlabs.io → Voice Lab → Add Voice → Professional Voice Clone. Upload a clean recording (no background noise, no music). Aim for 2–5 minutes of audio.",
                action: (
                  <a
                    href="https://elevenlabs.io/voice-lab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs bg-white/10 text-white px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open ElevenLabs
                  </a>
                ),
              },
              {
                step: "3",
                title: "Copy your Voice ID",
                desc: "After creating the voice, click on it in Voice Lab → copy the Voice ID from the URL or settings panel.",
              },
              {
                step: "4",
                title: "Paste your Voice ID below",
                desc: "This will be saved and used for all Panther Voice cues across the entire app.",
                action: (
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={voiceId}
                      onChange={e => setVoiceId(e.target.value)}
                      placeholder="e.g. pNInz6obpgDQGcFmaJgB"
                      className="flex-1 text-xs bg-background border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={saveVoiceId}
                      disabled={!voiceId.trim()}
                      className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-40 transition-colors"
                    >
                      {saved ? "✓ Saved" : "Save"}
                    </button>
                  </div>
                ),
              },
            ].map(({ step, title, desc, action }) => (
              <div key={step} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step}
                </span>
                <div className="flex-1 space-y-1.5">
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                  {action}
                </div>
              </div>
            ))}
          </div>

          {/* Recording tips */}
          <div className="bg-black/20 rounded-lg p-3 space-y-1">
            <p className="text-xs font-semibold text-orange-400">Recording Tips</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>• Record in a quiet room with no echo (closet with clothes works great)</li>
              <li>• Use your phone's voice memo app or a USB mic</li>
              <li>• Speak naturally — don't over-perform, Panther is confident and controlled</li>
              <li>• Record each section separately for cleaner audio</li>
              <li>• ElevenLabs Professional Voice Clone gives the best results (paid plan)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
