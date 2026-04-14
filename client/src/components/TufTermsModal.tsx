/**
 * TufTermsModal — First-time Terms of Use acceptance
 *
 * © 2025 Turned Up Fitness LLC. All rights reserved.
 * Turned Up Fitness™, Panther Brain™, The Panther System™, BOA Scan™,
 * Panther Mindset™, Panther Scheduler™, and Become Dangerous™ are
 * trademarks of Turned Up Fitness LLC.
 *
 * Shown once per device (stored in localStorage). Blocks app access until accepted.
 */

import { useState, useEffect } from "react";

const TERMS_KEY = "tuf_terms_accepted_v1";

export function TufTermsModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(TERMS_KEY);
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(TERMS_KEY, new Date().toISOString());
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes termsSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tuf-terms-modal {
          animation: termsSlideUp 0.35s ease forwards;
        }
      `}</style>

      {/* Backdrop */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 0 env(safe-area-inset-bottom, 0px)",
      }}>
        <div className="tuf-terms-modal" style={{
          width: "100%",
          maxWidth: 480,
          background: "#0d0d0d",
          borderTop: "2px solid rgba(255,102,0,0.5)",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px 32px",
          boxShadow: "0 -12px 48px rgba(0,0,0,0.8)",
        }}>
          {/* Header */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}>
              <span style={{ fontSize: 18 }}>🐆</span>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.2em",
                color: "rgba(255,102,0,0.8)",
              }}>
                TURNED UP FITNESS LLC
              </span>
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 26,
              color: "#fff",
              margin: 0,
              lineHeight: 1.1,
            }}>
              TERMS OF USE &<br />
              <span style={{ color: "#FF6600" }}>PROPRIETARY NOTICE</span>
            </h2>
          </div>

          {/* Scrollable body */}
          <div style={{
            maxHeight: 240,
            overflowY: "auto",
            marginBottom: 20,
            paddingRight: 4,
          }}>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 12,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.6)",
              margin: "0 0 12px",
            }}>
              By using the Turned Up Fitness app, you agree to the following:
            </p>

            {[
              {
                title: "Intellectual Property",
                body: "Turned Up Fitness™, Panther Brain™, The Panther System™, BOA Scan™, Panther Mindset™, Panther Scheduler™, Maximum Overdrive™, Ass-Assassination™, and Become Dangerous™ are proprietary trademarks of Turned Up Fitness LLC. All AI coaching methodologies, system prompts, 7-Region Clinical Brain architecture, and NASM corrective protocols are trade secrets of Turned Up Fitness LLC.",
              },
              {
                title: "AI Coaching Disclaimer",
                body: "The Panther Brain AI coaching system provides general fitness and movement guidance only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before beginning any exercise program.",
              },
              {
                title: "No Reproduction",
                body: "You may not copy, reproduce, distribute, modify, or create derivative works of any content, methodology, or technology within this application without express written permission from Turned Up Fitness LLC.",
              },
              {
                title: "Data & Privacy",
                body: "Movement assessment data, training logs, and AI conversation history are stored securely and used solely to improve your coaching experience. We do not sell your personal data to third parties.",
              },
              {
                title: "Limitation of Liability",
                body: "Turned Up Fitness LLC is not liable for any injury, loss, or damage arising from use of this application. Use at your own risk.",
              },
            ].map((item) => (
              <div key={item.title} style={{ marginBottom: 12 }}>
                <p style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: "rgba(255,102,0,0.9)",
                  margin: "0 0 3px",
                }}>
                  {item.title.toUpperCase()}
                </p>
                <p style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 11,
                  lineHeight: 1.55,
                  color: "rgba(255,255,255,0.45)",
                  margin: 0,
                }}>
                  {item.body}
                </p>
              </div>
            ))}

            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              margin: "12px 0 0",
              textAlign: "center",
            }}>
              © {new Date().getFullYear()} Turned Up Fitness LLC · All rights reserved
            </p>
          </div>

          {/* Accept button */}
          <button
            onClick={accept}
            style={{
              width: "100%",
              padding: "14px 0",
              background: "linear-gradient(135deg, #FF6600, #cc2200)",
              border: "none",
              borderRadius: 10,
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 18,
              letterSpacing: "0.12em",
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(255,102,0,0.4)",
            }}
          >
            I ACCEPT — ENTER THE PROGRAM
          </button>

          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 9,
            color: "rgba(255,255,255,0.2)",
            textAlign: "center",
            margin: "8px 0 0",
            letterSpacing: "0.08em",
          }}>
            By tapping above you acknowledge you have read and agree to these terms.
          </p>
        </div>
      </div>
    </>
  );
}
