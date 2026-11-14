import React, { useMemo, useState } from 'react';
import { tryCompileExpr } from '../../math/index.ts';
import { KatexBlock } from '../common/KatexBlock.tsx';
import { FunctionPlot2D } from './FunctionPlot2D.tsx';

type SubTab = 'unitcircle' | 'parity';

interface StandardAngle {
  label: string;
  rad: number;
  cosLatex: string;
  sinLatex: string;
}

const STANDARD_ANGLES: StandardAngle[] = [
  { label: '0', rad: 0, cosLatex: '1', sinLatex: '0' },
  { label: 'π/6', rad: Math.PI / 6, cosLatex: '\\frac{\\sqrt{3}}{2}', sinLatex: '\\frac{1}{2}' },
  { label: 'π/4', rad: Math.PI / 4, cosLatex: '\\frac{\\sqrt{2}}{2}', sinLatex: '\\frac{\\sqrt{2}}{2}' },
  { label: 'π/3', rad: Math.PI / 3, cosLatex: '\\frac{1}{2}', sinLatex: '\\frac{\\sqrt{3}}{2}' },
  { label: 'π/2', rad: Math.PI / 2, cosLatex: '0', sinLatex: '1' },
  { label: '2π/3', rad: (2 * Math.PI) / 3, cosLatex: '-\\frac{1}{2}', sinLatex: '\\frac{\\sqrt{3}}{2}' },
  { label: '3π/4', rad: (3 * Math.PI) / 4, cosLatex: '-\\frac{\\sqrt{2}}{2}', sinLatex: '\\frac{\\sqrt{2}}{2}' },
  { label: 'π', rad: Math.PI, cosLatex: '-1', sinLatex: '0' },
  { label: '4π/3', rad: (4 * Math.PI) / 3, cosLatex: '-\\frac{1}{2}', sinLatex: '-\\frac{\\sqrt{3}}{2}' },
  { label: '3π/2', rad: (3 * Math.PI) / 2, cosLatex: '0', sinLatex: '-1' },
];

const PARITY_PRESETS = [
  { label: 'x² − 1 (jämn)', expr: 'x^2 - 1' },
  { label: 'x³ − 3x (udda)', expr: 'x^3 - 3*x' },
  { label: 'sin(x) / x (jämn & begränsad)', expr: 'sin(x)/x' },
  { label: 'eˣ + e⁻ˣ (jämn, 2 cosh x)', expr: 'exp(x) + exp(-x)' },
  { label: 'eˣ (varken eller)', expr: 'exp(x)' },
];

export const ElementaryFunctionsTool: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('unitcircle');

  // --- Subtab 1: Enhetscirkeln ---
  const [angleDeg, setAngleDeg] = useState(45);
  const angleRad = (angleDeg * Math.PI) / 180;
  const cosVal = Math.cos(angleRad);
  const sinVal = Math.sin(angleRad);
  const tanVal = Math.abs(cosVal) < 1e-4 ? null : sinVal / cosVal;

  const matchedStd = useMemo(
    () =>
      STANDARD_ANGLES.find(
        (s) => Math.abs(((angleRad - s.rad + Math.PI * 3) % (2 * Math.PI)) - Math.PI) < 0.015,
      ),
    [angleRad],
  );

  // --- Subtab 2: Paritet & begränsning ---
  const [exprInput, setExprInput] = useState('x^3 - 3*x');
  const compiled = useMemo(() => tryCompileExpr(exprInput), [exprInput]);

  const parityCheck = useMemo(() => {
    if (!compiled) return null;
    const pts = [0.4, 0.9, 1.4, 2.1, 2.8];
    let even = true;
    let odd = true;
    let minVal = Infinity;
    let maxVal = -Infinity;

    for (const x of pts) {
      const fx = compiled(x);
      const fneg = compiled(-x);
      if (!Number.isFinite(fx) || !Number.isFinite(fneg)) {
        even = false;
        odd = false;
        continue;
      }
      if (Math.abs(fx - fneg) > 1e-4) even = false;
      if (Math.abs(fx + fneg) > 1e-4) odd = false;
    }

    for (let x = -5; x <= 5; x += 0.25) {
      const y = compiled(x);
      if (Number.isFinite(y)) {
        minVal = Math.min(minVal, y);
        maxVal = Math.max(maxVal, y);
      }
    }

    return {
      status: even ? 'Jämn funktion: f(−x) = f(x)' : odd ? 'Udda funktion: f(−x) = −f(x)' : 'Varken jämn eller udda',
      even,
      odd,
      sampleSpan: Number.isFinite(minVal) ? `[${minVal.toFixed(2)}, ${maxVal.toFixed(2)}]` : 'Odefinierat intervall',
    };
  }, [compiled]);

  // Unit circle SVG coordinates
  const ucSize = 270;
  const ucCenter = ucSize / 2;
  const ucR = 96;
  const px = ucCenter + ucR * cosVal;
  const py = ucCenter - ucR * sinVal;

  return (
    <div className="section-stack">
      <div className="tool-subtabs">
        <button
          type="button"
          className={`seg-btn ${subTab === 'unitcircle' ? 'active' : ''}`}
          onClick={() => setSubTab('unitcircle')}
        >
          Enhetscirkeln & trigonometri
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'parity' ? 'active' : ''}`}
          onClick={() => setSubTab('parity')}
        >
          Paritet & begränsade funktioner
        </button>
      </div>

      {subTab === 'unitcircle' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Enhetscirkeln & standardvinklar</h3>
              <p className="muted-text">
                Dra vinkeln eller klicka på en standardvinkel för att se punkten <KatexBlock latex="(\cos\theta, \sin\theta)" />.
              </p>
            </div>

            <label>
              <div className="space-between" style={{ fontSize: '0.9rem' }}>
                <span>Vinkel θ</span>
                <strong>{angleDeg}° ({angleRad.toFixed(3)} rad)</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={-180}
                max={360}
                step={1}
                value={angleDeg}
                onChange={(e) => setAngleDeg(Number(e.target.value))}
              />
            </label>

            <div className="row-wrap" style={{ gap: '0.35rem' }}>
              {STANDARD_ANGLES.map((st) => (
                <button
                  key={st.label}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setAngleDeg(Math.round((st.rad * 180) / Math.PI))}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg
                width={ucSize}
                height={ucSize}
                viewBox={`0 0 ${ucSize} ${ucSize}`}
                style={{
                  background: 'var(--svg-bg)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                }}
                role="img"
                aria-label="Enhetscirkeln"
              >
                <line x1={12} y1={ucCenter} x2={ucSize - 12} y2={ucCenter} stroke="var(--svg-axis)" strokeWidth={1.4} />
                <line x1={ucCenter} y1={12} x2={ucCenter} y2={ucSize - 12} stroke="var(--svg-axis)" strokeWidth={1.4} />
                <circle cx={ucCenter} cy={ucCenter} r={ucR} fill="none" stroke="var(--svg-blue)" strokeWidth={2} />
                {/* Cosine horizontal leg */}
                <line x1={ucCenter} y1={ucCenter} x2={px} y2={ucCenter} stroke="var(--sage)" strokeWidth={2.5} />
                {/* Sine vertical leg */}
                <line x1={px} y1={ucCenter} x2={px} y2={py} stroke="var(--amber)" strokeWidth={2.5} />
                {/* Radius vector */}
                <line x1={ucCenter} y1={ucCenter} x2={px} y2={py} stroke="var(--accent)" strokeWidth={2.2} />
                <circle cx={px} cy={py} r={5} fill="var(--accent)" />
                <text x={ucCenter + ucR + 6} y={ucCenter - 5} fontSize={11} fill="var(--text-muted)">1</text>
                <text x={ucCenter + 6} y={ucCenter - ucR - 4} fontSize={11} fill="var(--text-muted)">1</text>
              </svg>
            </div>

            <div className="result-banner">
              {matchedStd ? (
                <KatexBlock
                  latex={`\\theta = ${matchedStd.label} \\implies \\cos\\theta = ${matchedStd.cosLatex},\\quad \\sin\\theta = ${matchedStd.sinLatex}`}
                  displayMode
                />
              ) : (
                <KatexBlock
                  latex={`\\cos\\theta \\approx ${cosVal.toFixed(4)},\\quad \\sin\\theta \\approx ${sinVal.toFixed(4)},\\quad \\tan\\theta ${tanVal === null ? '\\text{ odef.}' : `\\approx ${tanVal.toFixed(4)}`}`}
                  displayMode
                />
              )}
              <div className="muted-text" style={{ fontSize: '0.84rem', marginTop: '0.25rem' }}>
                Trigonometriska ettan: <KatexBlock latex={`\\cos^2\\theta + \\sin^2\\theta = ${(cosVal * cosVal + sinVal * sinVal).toFixed(4)} = 1`} />
              </div>
            </div>
          </div>

          <FunctionPlot2D
            title="Sinus och cosinus som funktioner av θ (radianer)"
            piTicks
            initialXRange={[-Math.PI, 2.2 * Math.PI]}
            initialYRange={[-1.6, 1.6]}
            curves={[
              { fn: Math.sin, color: 'var(--amber)', label: 'sin(θ)' },
              { fn: Math.cos, color: 'var(--sage)', label: 'cos(θ)', dashed: true },
            ]}
            points={[
              { x: angleRad, y: sinVal, color: 'var(--amber)', label: 'sin(θ)', labelPlacement: 'top-right' },
              { x: angleRad, y: cosVal, color: 'var(--sage)', label: 'cos(θ)', labelPlacement: 'bottom-right' },
            ]}
            verticalLines={[{ x: angleRad, color: 'var(--accent)', label: 'θ' }]}
          />
        </div>
      )}

      {subTab === 'parity' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Paritet & symmetri hos funktioner</h3>
              <p className="muted-text">
                Skriv ett valfritt uttryck i <KatexBlock latex="x" /> och jämför <KatexBlock latex="f(x)" /> med <KatexBlock latex="f(-x)" />.
              </p>
            </div>

            <label>
              <span className="muted-text" style={{ fontSize: '0.84rem', display: 'block', marginBottom: '0.25rem' }}>
                Funktion f(x)
              </span>
              <input
                type="text"
                className="text-input"
                value={exprInput}
                onChange={(e) => setExprInput(e.target.value)}
                placeholder="t.ex. x^3 - 3*x"
              />
            </label>

            <div className="row-wrap" style={{ gap: '0.35rem' }}>
              {PARITY_PRESETS.map((p) => (
                <button
                  key={p.expr}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setExprInput(p.expr)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {!compiled ? (
              <div className="warn-box">Ogiltigt funktionsuttryck. Kontrollera parenteser och operatorer (t.ex. x^3 - 3*x).</div>
            ) : parityCheck ? (
              <div className={parityCheck.even || parityCheck.odd ? 'feedback-correct' : 'result-banner'}>
                <div><strong>{parityCheck.status}</strong></div>
                <div className="muted-text" style={{ fontSize: '0.86rem', marginTop: '0.3rem' }}>
                  Observerat värdeområde på [-5, 5]: {parityCheck.sampleSpan}
                </div>
              </div>
            ) : null}

            <div className="tip-box">
              <strong>Kom ihåg för tentan:</strong> En funktion är jämn om <KatexBlock latex="f(-x)=f(x)" /> (symmetrisk kring y-axeln) och udda om <KatexBlock latex="f(-x)=-f(x)" /> (punktsymmetrisk kring origo). Båda kräver att definitionsmängden är symmetrisk kring 0!
            </div>
          </div>

          <FunctionPlot2D
            title="Jämförelse av f(x) och f(−x)"
            initialXRange={[-5, 5]}
            initialYRange={[-5, 5]}
            curves={
              compiled
                ? [
                    { fn: compiled, color: 'var(--svg-blue)', label: 'f(x)' },
                    { fn: (x) => compiled(-x), color: 'var(--amber)', label: 'f(−x)', dashed: true },
                  ]
                : []
            }
          />
        </div>
      )}
    </div>
  );
};
