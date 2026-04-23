/* Architecture diagram with hoverable nodes */
const { useState: useStateArch } = React;

function ArchitectureDiagram() {
  const [hover, setHover] = useState(null);

  const nodes = {
    browser: { x: 30, y: 140, w: 140, h: 60, label: "Browser", sub: "Next.js · React 19", info: "Chat UI, Skills sidebar, Files panel, Monaco review modal. SSE client for streaming." },
    gateway: { x: 210, y: 140, w: 140, h: 60, label: "FastAPI gateway", sub: "chat.py · skills.py", info: "Routes chat + skill CRUD. Threads user_id, maintains per-session state in-process." },
    buffer: { x: 400, y: 30, w: 150, h: 54, label: "Buffer", sub: "deque[40], 2min TTL", info: "Per-session in-memory conversation log. Wiped on new chat or heartbeat timeout." },
    trigger: { x: 600, y: 30, w: 150, h: 54, label: "Trigger", sub: "Flash Lite, non-blocking", info: "After each assistant turn, evaluates whether the buffer contains a repeatable workflow." },
    architect: { x: 400, y: 146, w: 150, h: 54, label: "Architect", sub: "extract → expand", info: "Two-step generation: parameter extraction first, then skill body. Both schema-constrained." },
    validator: { x: 600, y: 146, w: 150, h: 54, label: "Validator", sub: "AST + Docker", info: "Syntax check, then dry-run each script in a fresh sandbox with example parameters." },
    library: { x: 400, y: 262, w: 150, h: 54, label: "Skills library", sub: "users/<id>/skills/", info: "On-disk folders: SKILL.md + scripts/ + versions/. Read-only mount into agent." },
    sandbox: { x: 600, y: 262, w: 150, h: 54, label: "Session sandbox", sub: "autoskill-session-<id>", info: "Long-lived Docker container per session. Runs Gemini CLI, writes to /app." },
  };

  const links = [
    ["browser", "gateway"],
    ["gateway", "buffer"],
    ["buffer", "trigger"],
    ["trigger", "architect"],
    ["architect", "validator"],
    ["validator", "library"],
    ["library", "sandbox"],
    ["gateway", "sandbox"],
  ];

  const linkPath = (a, b) => {
    const ax = a.x + a.w / 2, ay = a.y + a.h / 2;
    const bx = b.x + b.w / 2, by = b.y + b.h / 2;
    return `M${a.x + a.w},${ay} C${(a.x + a.w + bx) / 2},${ay} ${(a.x + a.w + bx) / 2},${by} ${b.x},${by}`;
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox="0 0 800 360" width="100%" style={{ display: 'block' }}>
        <defs>
          <marker id="arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--muted-2)"/>
          </marker>
        </defs>

        {/* Links */}
        {links.map(([a, b], i) => {
          const na = nodes[a], nb = nodes[b];
          const ax = na.x + na.w, ay = na.y + na.h / 2;
          const bx = nb.x, by = nb.y + nb.h / 2;
          const mx = (ax + bx) / 2;
          return (
            <path
              key={i}
              d={`M${ax},${ay} C${mx},${ay} ${mx},${by} ${bx},${by}`}
              fill="none"
              stroke={hover === a || hover === b ? "var(--accent)" : "var(--rule-2)"}
              strokeWidth={hover === a || hover === b ? "1.4" : "1"}
              markerEnd="url(#arr2)"
            />
          );
        })}

        {/* Dashed group boxes */}
        <rect x="390" y="10" width="370" height="84" fill="none" stroke="var(--rule)" strokeDasharray="2 3" strokeWidth="1"/>
        <text x="400" y="22" fontFamily="var(--mono)" fontSize="9" fill="var(--muted-2)" letterSpacing="2">OBSERVER</text>

        <rect x="390" y="126" width="370" height="84" fill="none" stroke="var(--rule)" strokeDasharray="2 3" strokeWidth="1"/>
        <text x="400" y="138" fontFamily="var(--mono)" fontSize="9" fill="var(--muted-2)" letterSpacing="2">ARCHITECT</text>

        <rect x="390" y="242" width="370" height="84" fill="none" stroke="var(--rule)" strokeDasharray="2 3" strokeWidth="1"/>
        <text x="400" y="254" fontFamily="var(--mono)" fontSize="9" fill="var(--muted-2)" letterSpacing="2">INTEGRATOR</text>

        {/* Nodes */}
        {Object.entries(nodes).map(([key, n]) => (
          <g
            key={key}
            className="arch-node"
            onMouseEnter={() => setHover(key)}
            onMouseLeave={() => setHover(null)}
          >
            <rect
              x={n.x} y={n.y}
              width={n.w} height={n.h}
              fill={hover === key ? "var(--accent-soft)" : "var(--paper)"}
              stroke={hover === key ? "var(--accent)" : "var(--ink)"}
              strokeWidth="1"
            />
            <text x={n.x + 12} y={n.y + 22} fontFamily="var(--serif)" fontSize="14" fill="var(--ink)" fontStyle="italic">
              {n.label}
            </text>
            <text x={n.x + 12} y={n.y + 40} fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">
              {n.sub}
            </text>
          </g>
        ))}

        {/* Hover info box */}
        {hover && (() => {
          const n = nodes[hover];
          const boxX = n.x + n.w + 14 > 620 ? n.x - 224 : n.x + n.w + 14;
          const boxY = Math.max(4, Math.min(n.y, 280));
          // wrap info into lines
          const words = n.info.split(' ');
          const lines = [];
          let current = '';
          words.forEach(w => {
            if ((current + ' ' + w).trim().length > 36) {
              lines.push(current.trim());
              current = w;
            } else {
              current += ' ' + w;
            }
          });
          if (current.trim()) lines.push(current.trim());
          return (
            <g>
              <rect x={boxX} y={boxY} width="220" height={16 + lines.length * 14} fill="var(--ink)" rx="2"/>
              {lines.map((l, i) => (
                <text key={i} x={boxX + 10} y={boxY + 18 + i * 14} fontFamily="var(--sans)" fontSize="11" fill="var(--paper)">
                  {l}
                </text>
              ))}
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

window.ArchitectureDiagram = ArchitectureDiagram;
