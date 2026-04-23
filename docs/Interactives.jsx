/* Chat mock: trigger firing live-feel */
function ChatMock() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const seq = [1, 2, 3, 4, 5];
    const timers = seq.map((s, i) => setTimeout(() => setStep(s), 900 + i * 1100));
    return () => timers.forEach(clearTimeout);
  }, []);

  const restart = () => {
    setStep(0);
    setTimeout(() => setStep(1), 400);
    setTimeout(() => setStep(2), 1500);
    setTimeout(() => setStep(3), 2600);
    setTimeout(() => setStep(4), 3700);
    setTimeout(() => setStep(5), 4800);
  };

  return (
    <div className="chat-mock">
      <div className="chat-mock-head">
        <span>SESSION · d1513368</span>
        <span style={{ cursor: 'pointer' }} onClick={restart}>↻ replay</span>
      </div>
      <div className="chat-mock-body">
        <div className={`chat-msg chat-msg-user ${step >= 1 ? 'visible' : ''}`}>
          Can you parse sales-q3.csv, group by <code>region</code>, and give me totals + YoY?
        </div>
        <div className={`chat-msg chat-msg-ai ${step >= 2 ? 'visible' : ''}`}>
          Reading the file now. 4 regions detected. Computing aggregates…
        </div>
        <div className={`chat-msg chat-msg-ai ${step >= 3 ? 'visible' : ''}`}>
          <span className="skill-chip">tool: run_python</span>
          Done. APAC +12.4%, EMEA +3.1%, AMER −1.8%, LATAM +22.0%. Written to <code>output/q3_summary.csv</code>.
        </div>
        <div className={`chat-msg chat-msg-user ${step >= 4 ? 'visible' : ''}`}>
          perfect, thanks
        </div>
        <div className={`chat-candidate ${step >= 5 ? 'visible' : ''}`}>
          <div className="chat-candidate-label">
            ● Skill candidate detected
          </div>
          <div className="chat-candidate-name">csv_regional_rollup</div>
          <div className="chat-candidate-desc">
            Group a CSV by a column, compute totals and YoY deltas, write a summary CSV.
            <div style={{ marginTop: 6, color: 'var(--muted-2)', fontSize: 11 }}>
              3 parameters extracted · validated in 2.1s
            </div>
          </div>
          <div className="chat-candidate-actions">
            <button className="chat-candidate-btn primary">Review skill</button>
            <button className="chat-candidate-btn">Dismiss</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Validation stepper */
function ValidationStepper() {
  const steps = [
    { idx: "01", label: "SKILL.md frontmatter — name, description present", ok: "pass" },
    { idx: "02", label: "ast.parse(scripts/summarise.py) — syntax", ok: "pass" },
    { idx: "03", label: "script paths referenced in SKILL.md exist on disk", ok: "pass" },
    { idx: "04", label: "docker run --rm autoskill-sandbox → python summarise.py --file q3.csv --col region", ok: "pass" },
    { idx: "05", label: "exit code 0, stderr empty, stdout matches schema", ok: "pass" },
  ];
  const [cur, setCur] = useState(-1);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (cur >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setCur(c => c + 1), 900);
    return () => clearTimeout(t);
  }, [cur, playing]);

  const play = () => { setCur(0); setPlaying(true); };
  const reset = () => { setCur(-1); setPlaying(false); };

  return (
    <div className="stepper">
      <div className="stepper-head">
        <div className="stepper-title">Validation ladder — AST → sandbox</div>
        <div className="stepper-playhead">
          {cur < 0 ? "idle" : playing ? `running ${cur + 1}/${steps.length}` : `complete ${cur + 1}/${steps.length}`}
        </div>
      </div>
      {steps.map((s, i) => (
        <div key={i} className={`stepper-row ${cur === i ? 'active' : ''}`}>
          <div className="stepper-idx">{s.idx}</div>
          <div className="stepper-label">{s.label}</div>
          <div className={`stepper-status ${cur >= i ? 'ok' : ''}`}>
            {cur >= i ? '✓ pass' : cur === i - 0.5 ? '…' : 'pending'}
          </div>
        </div>
      ))}
      <div className="stepper-controls">
        <button className="stepper-btn" onClick={play} disabled={playing}>▶ Play</button>
        <button className="stepper-btn" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

/* Before/after skill evolution */
function BeforeAfter() {
  const before = `---
name: csv_regional_rollup
description: Group a CSV by a column, compute totals and YoY.
arguments:
  - name: input_file
  - name: group_column
  - name: value_column
---

Run scripts/summarise.py with the arguments.
Handles both CSV and JSON input.`;

  const after = `---
name: csv_regional_rollup
description: Group a CSV by a column, compute totals and YoY.
arguments:
  - name: input_file
  - name: group_column
  - name: value_column
---

Run scripts/summarise.py with the arguments.
Only accepts CSV input. Rejects JSON with a clear error.`;

  return (
    <div className="ba">
      <div className="ba-col">
        <div className="ba-head">
          <span className="ba-tag before">v1 · before</span>
          <span>SKILL.md</span>
        </div>
        <div className="ba-body">{before.split('\n').map((l, i) => {
          if (l.includes('Handles both')) return <span key={i}><span className="diff-rm">{l}</span>{'\n'}</span>;
          return l + '\n';
        })}</div>
      </div>
      <div className="ba-col">
        <div className="ba-head">
          <span className="ba-tag after">v2 · after evolution</span>
          <span>SKILL.md</span>
        </div>
        <div className="ba-body">{after.split('\n').map((l, i) => {
          if (l.includes('Only accepts')) return <span key={i}><span className="diff-add">{l}</span>{'\n'}</span>;
          return l + '\n';
        })}</div>
      </div>
    </div>
  );
}

/* Expandable code block */
function CodeBlock({ filename, lang, collapsedByDefault, children }) {
  const [open, setOpen] = useState(!collapsedByDefault);
  return (
    <div className={`codeblock ${!open ? 'collapsed' : ''}`}>
      <div className="codeblock-header">
        <span className="codeblock-filename">{filename}</span>
        <button className="codeblock-toggle" onClick={() => setOpen(o => !o)}>
          {open ? '− collapse' : '+ expand'}
        </button>
      </div>
      <pre><code dangerouslySetInnerHTML={{ __html: children }}/></pre>
    </div>
  );
}

Object.assign(window, { ChatMock, ValidationStepper, BeforeAfter, CodeBlock });
