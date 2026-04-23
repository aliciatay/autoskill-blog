/* Pipeline diagram (Observer → Architect → Integrator), animated */
const { useEffect, useState, useRef } = React;

function PipelineDiagram({ variant = "schematic" }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => (v + 1) % 360), 40);
    return () => clearInterval(t);
  }, []);

  // packet position along the whole flow (0..3)
  const pos = (tick / 90) % 3; // 0..3 = 3 stages

  const stages = [
    { x: 90, y: 120, w: 170, h: 80, label: "Observer", sub: "Trigger evaluator", detail: "chat buffer → Flash Lite" },
    { x: 330, y: 120, w: 170, h: 80, label: "Architect", sub: "Two-step + validate", detail: "extract → expand → sandbox" },
    { x: 570, y: 120, w: 170, h: 80, label: "Integrator", sub: "Persist + mount", detail: "skills/ → agent workspace" },
  ];

  // interpolate packet position
  const packetStage = Math.floor(pos);
  const packetFrac = pos - packetStage;
  let px, py;
  if (packetStage < 3) {
    const s = stages[packetStage];
    if (packetFrac < 0.3) {
      // entering stage
      px = s.x - 40 + (packetFrac / 0.3) * 40;
      py = s.y + s.h / 2;
    } else if (packetFrac < 0.7) {
      // inside stage (small pulse)
      px = s.x + s.w / 2;
      py = s.y + s.h / 2;
    } else {
      // exiting stage
      px = s.x + s.w + ((packetFrac - 0.7) / 0.3) * 40;
      py = s.y + s.h / 2;
    }
  }

  const isHand = variant === "hand";
  const rough = isHand ? "filter: url(#rough)" : "";

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox="0 0 830 320" width="100%" style={{ display: 'block', maxHeight: 420 }}>
        <defs>
          <filter id="rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/>
            <feDisplacementMap in="SourceGraphic" scale="1.2"/>
          </filter>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--ink)"/>
          </marker>
          <pattern id="grain" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.3" fill="var(--rule-2)" opacity="0.4"/>
          </pattern>
        </defs>

        {/* Top label */}
        <text x="415" y="40" textAnchor="middle" fontFamily="var(--sans)" fontSize="11" fill="var(--muted)" letterSpacing="3">
          CHAT BUFFER → CODIFIED SKILL
        </text>
        <line x1="90" y1="52" x2="740" y2="52" stroke="var(--rule)" strokeWidth="1"/>

        {/* Input */}
        <g style={{ filter: rough }}>
          <rect x="10" y="140" width="60" height="40" fill="none" stroke="var(--ink)" strokeWidth="1"/>
          <text x="40" y="165" textAnchor="middle" fontFamily="var(--mono)" fontSize="10" fill="var(--ink)">chat</text>
        </g>

        {/* Output */}
        <g style={{ filter: rough }}>
          <rect x="760" y="140" width="60" height="40" fill="var(--accent)" opacity="0.1" stroke="var(--ink)" strokeWidth="1"/>
          <text x="790" y="158" textAnchor="middle" fontFamily="var(--mono)" fontSize="10" fill="var(--ink)">SKILL</text>
          <text x="790" y="172" textAnchor="middle" fontFamily="var(--mono)" fontSize="10" fill="var(--ink)">.md</text>
        </g>

        {/* Flow line */}
        <line x1="70" y1="160" x2="760" y2="160" stroke="var(--rule-2)" strokeWidth="1" strokeDasharray="3 4"/>

        {/* Stages */}
        {stages.map((s, i) => {
          const isActive = packetStage === i;
          return (
            <g key={s.label} style={{ filter: rough }}>
              <rect
                x={s.x} y={s.y}
                width={s.w} height={s.h}
                fill={isActive ? "var(--accent-soft)" : "var(--paper)"}
                stroke="var(--ink)"
                strokeWidth="1.2"
              />
              {/* small ticker on top to show "working" */}
              {isActive && (
                <rect x={s.x + 10} y={s.y + 8} width="6" height="6" fill="var(--accent)"/>
              )}
              <text x={s.x + s.w / 2} y={s.y + 34} textAnchor="middle" fontFamily="var(--serif)" fontSize="18" fill="var(--ink)" fontStyle="italic">
                {s.label}
              </text>
              <text x={s.x + s.w / 2} y={s.y + 52} textAnchor="middle" fontFamily="var(--sans)" fontSize="11" fill="var(--muted)">
                {s.sub}
              </text>
              <text x={s.x + s.w / 2} y={s.y + 68} textAnchor="middle" fontFamily="var(--mono)" fontSize="10" fill="var(--muted-2)">
                {s.detail}
              </text>
              {/* index */}
              <text x={s.x + s.w - 8} y={s.y + 14} textAnchor="end" fontFamily="var(--mono)" fontSize="9" fill="var(--muted-2)" letterSpacing="2">
                0{i+1}
              </text>
            </g>
          );
        })}

        {/* Arrows between stages */}
        <line x1="260" y1="160" x2="328" y2="160" stroke="var(--ink)" strokeWidth="1" markerEnd="url(#arrow)" style={{ filter: rough }}/>
        <line x1="500" y1="160" x2="568" y2="160" stroke="var(--ink)" strokeWidth="1" markerEnd="url(#arrow)" style={{ filter: rough }}/>

        {/* Moving packet */}
        {packetStage < 3 && (
          <circle cx={px} cy={py} r="5" fill="var(--accent)">
            <animate attributeName="r" values="4;6;4" dur="1s" repeatCount="indefinite"/>
          </circle>
        )}

        {/* Bottom annotations */}
        <g fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">
          <line x1="90" y1="230" x2="740" y2="230" stroke="var(--rule)" strokeWidth="1" strokeDasharray="2 3"/>
          <text x="175" y="250" textAnchor="middle">40-msg deque</text>
          <text x="175" y="264" textAnchor="middle">buffer.py</text>
          <text x="415" y="250" textAnchor="middle">gemini-2.5-flash</text>
          <text x="415" y="264" textAnchor="middle">architect.py</text>
          <text x="655" y="250" textAnchor="middle">users/&lt;id&gt;/skills/</text>
          <text x="655" y="264" textAnchor="middle">mount :ro</text>
        </g>

        {/* Footer tag */}
        <text x="415" y="300" textAnchor="middle" fontFamily="var(--sans)" fontSize="10" fill="var(--muted-2)" letterSpacing="2">
          FIG. 01  — THREE-PHASE PIPELINE
        </text>
      </svg>
    </div>
  );
}

window.PipelineDiagram = PipelineDiagram;
