import React, { useMemo, useState } from 'react';
import { tryCompileExpr } from '../../math/index.ts';
import { KatexBlock } from '../common/KatexBlock.tsx';
import { FunctionPlot2D } from './FunctionPlot2D.tsx';

type SubTab = 'secant' | 'mvt';

const DERIV_PRESETS = [
  { label: 'x³ − 3x', expr: 'x^3 - 3*x' },
  { label: 'eˣ − x', expr: 'exp(x) - x' },
  { label: 'sin(2x)', expr: 'sin(2*x)' },
  { label: 'x² + 1/(x²+1)', expr: 'x^2 + 1/(x^2 + 1)' },
];

interface MvtPreset {
  id: string;
  label: string;
  latex: string;
  fn: (x: number) => number;
  df: (x: number) => number;
  solveC: (a: number, b: number) => number | null;
}

const MVT_PRESETS: MvtPreset[] = [
  {
    id: 'cubic',
    label: 'f(x) = x³ − 3x',
    latex: 'f(x) = x^3 - 3x',
    fn: (x) => x * x * x - 3 * x,
    df: (x) => 3 * x * x - 3,
    solveC: (a, b) => {
      const slope = (b * b * b - 3 * b - (a * a * a - 3 * a)) / (b - a);
      const val = (slope + 3) / 3;
      if (val < 0) return null;
      const r = Math.sqrt(val);
      if (r > a && r < b) return r;
      if (-r > a && -r < b) return -r;
      return null;
    },
  },
  {
    id: 'quad',
    label: 'f(x) = x² − 2x + 1',
    latex: 'f(x) = x^2 - 2x + 1',
    fn: (x) => (x - 1) * (x - 1),
    df: (x) => 2 * (x - 1),
    solveC: (a, b) => (a + b) / 2,
  },
  {
    id: 'sin',
    label: 'f(x) = sin(x)',
    latex: 'f(x) = \\sin(x)',
    fn: Math.sin,
    df: Math.cos,
    solveC: (a, b) => {
      const slope = (Math.sin(b) - Math.sin(a)) / (b - a);
      // Enkel numerisk sökning på (a, b) för att hitta c där cos(c) = slope
      let bestC: number | null = null;
      let bestErr = Infinity;
      const steps = 400;
      for (let i = 1; i < steps; i++) {
        const x = a + (i / steps) * (b - a);
        const err = Math.abs(Math.cos(x) - slope);
        if (err < bestErr) {
          bestErr = err;
          bestC = x;
        }
      }
      return bestErr < 0.03 ? bestC : null;
    },
  },
];

function numDeriv(fn: (x: number) => number, x: number): number {
  const eps = 1e-4;
  return (fn(x + eps) - fn(x - eps)) / (2 * eps);
}

export const DerivativeTool: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('secant');

  // --- Subtab 1: Sekant -> tangent ---
  const [exprInput, setExprInput] = useState('x^3 - 3*x');
  const [x0, setX0] = useState(1.2);
  const [hVal, setHVal] = useState(1.0);
  const [showDerivCurve, setShowDerivCurve] = useState(true);

  const compiled = useMemo(() => tryCompileExpr(exprInput), [exprInput]);

  const secantMetrics = useMemo(() => {
    if (!compiled) return null;
    const f0 = compiled(x0);
    const fh = compiled(x0 + hVal);
    const tangentSlope = numDeriv(compiled, x0);
    const secantSlope = Math.abs(hVal) < 1e-6 ? tangentSlope : (fh - f0) / hVal;
    return { f0, fh, tangentSlope, secantSlope };
  }, [compiled, hVal, x0]);

  // --- Subtab 2: Medelvärdessatsen ---
  const [mvtId, setMvtId] = useState('cubic');
  const [aVal, setAVal] = useState(-1);
  const [bVal, setBVal] = useState(2);

  const mvtPreset = useMemo(
    () => MVT_PRESETS.find((m) => m.id === mvtId) ?? MVT_PRESETS[0],
    [mvtId],
  );
  const safeA = Math.min(aVal, bVal - 0.4);
  const safeB = Math.max(bVal, safeA + 0.4);
  const mvtData = useMemo(() => {
    const fa = mvtPreset.fn(safeA);
    const fb = mvtPreset.fn(safeB);
    const chordSlope = (fb - fa) / (safeB - safeA);
    const cPoint = mvtPreset.solveC(safeA, safeB);
    const fc = cPoint !== null ? mvtPreset.fn(cPoint) : null;
    return { fa, fb, chordSlope, cPoint, fc };
  }, [mvtPreset, safeA, safeB]);

  return (
    <div className="section-stack">
      <div className="tool-subtabs">
        <button
          type="button"
          className={`seg-btn ${subTab === 'secant' ? 'active' : ''}`}
          onClick={() => setSubTab('secant')}
        >
          Sekant → tangent &amp; derivatafunktion
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'mvt' ? 'active' : ''}`}
          onClick={() => setSubTab('mvt')}
        >
          Medelvärdessatsen (MVT)
        </button>
      </div>

      {subTab === 'secant' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Differenskvot: <KatexBlock latex="\frac{f(x_0+h) - f(x_0)}{h}" /></h3>
              <p className="muted-text">
                Låt <KatexBlock latex="h \to 0" /> och se hur sekanten närmar sig tangenten i <KatexBlock latex="x_0" />.
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
              />
            </label>

            <div className="row-wrap" style={{ gap: '0.35rem' }}>
              {DERIV_PRESETS.map((p) => (
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

            <label>
              <div className="space-between" style={{ fontSize: '0.88rem' }}>
                <span>Punkt x₀</span>
                <strong>{x0.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={-3}
                max={3}
                step={0.1}
                value={x0}
                onChange={(e) => setX0(Number(e.target.value))}
              />
            </label>

            <label>
              <div className="space-between" style={{ fontSize: '0.88rem' }}>
                <span>Steglängd h</span>
                <strong>{hVal.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={0.02}
                max={2.0}
                step={0.02}
                value={hVal}
                onChange={(e) => setHVal(Number(e.target.value))}
              />
            </label>

            <label className="row-wrap" style={{ gap: '0.45rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showDerivCurve}
                onChange={(e) => setShowDerivCurve(e.target.checked)}
              />
              <span>Visa derivatafunktionen f&apos;(x) i samma graf</span>
            </label>

            {!compiled ? (
              <div className="warn-box">Ogiltigt funktionsuttryck. Kontrollera syntaxen (t.ex. x^3 - 3*x).</div>
            ) : secantMetrics ? (
              <div className="result-banner section-stack" style={{ gap: '0.35rem' }}>
                <div>
                  <strong>Sekantens lutning (genomsnittlig):</strong>{' '}
                  {Number.isFinite(secantMetrics.secantSlope) ? secantMetrics.secantSlope.toFixed(4) : '—'}
                </div>
                <div>
                  <strong>Tangentens lutning f&apos;({x0.toFixed(2)}):</strong>{' '}
                  {Number.isFinite(secantMetrics.tangentSlope) ? secantMetrics.tangentSlope.toFixed(4) : '—'}
                </div>
              </div>
            ) : null}
          </div>

          <FunctionPlot2D
            title="Funktion, sekant, tangent och f'(x)"
            initialXRange={[-4, 4]}
            initialYRange={[-6, 6]}
            curves={
              compiled && secantMetrics
                ? [
                    { fn: compiled, color: 'var(--svg-blue)', label: 'f(x)' },
                    {
                      fn: (x) => secantMetrics.f0 + secantMetrics.secantSlope * (x - x0),
                      color: 'var(--amber)',
                      label: `Sekant (h = ${hVal.toFixed(2)})`,
                      dashed: true,
                    },
                    {
                      fn: (x) => secantMetrics.f0 + secantMetrics.tangentSlope * (x - x0),
                      color: 'var(--sage)',
                      label: 'Tangent',
                    },
                    ...(showDerivCurve
                      ? [
                          {
                            fn: (x: number) => numDeriv(compiled, x),
                            color: 'var(--svg-purple)',
                            label: "f'(x)",
                            dashed: true,
                          },
                        ]
                      : []),
                  ]
                : []
            }
            points={
              compiled && secantMetrics
                ? [
                    { x: x0, y: secantMetrics.f0, color: 'var(--sage)', label: 'x₀' },
                    { x: x0 + hVal, y: secantMetrics.fh, color: 'var(--amber)', label: 'x₀+h' },
                  ]
                : []
            }
          />
        </div>
      )}

      {subTab === 'mvt' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Lagranges medelvärdessats</h3>
              <p className="muted-text">
                Om <KatexBlock latex="f" /> är kontinuerlig på <KatexBlock latex="[a,b]" /> och deriverbar på <KatexBlock latex="]a,b[" />, finns minst ett <KatexBlock latex="c \in ]a,b[" /> där tangenten är parallell med kordan.
              </p>
            </div>

            <div className="row-wrap" style={{ gap: '0.35rem' }}>
              {MVT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`seg-btn ${mvtId === p.id ? 'active' : ''}`}
                  onClick={() => setMvtId(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <label>
              <div className="space-between" style={{ fontSize: '0.88rem' }}>
                <span>Vänster ändpunkt a</span>
                <strong>{safeA.toFixed(1)}</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={-3}
                max={2}
                step={0.2}
                value={aVal}
                onChange={(e) => setAVal(Number(e.target.value))}
              />
            </label>

            <label>
              <div className="space-between" style={{ fontSize: '0.88rem' }}>
                <span>Höger ändpunkt b</span>
                <strong>{safeB.toFixed(1)}</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={-1}
                max={3.5}
                step={0.2}
                value={bVal}
                onChange={(e) => setBVal(Number(e.target.value))}
              />
            </label>

            <div className="result-banner section-stack" style={{ gap: '0.35rem' }}>
              <KatexBlock
                latex={`\\frac{f(b) - f(a)}{b - a} = ${mvtData.chordSlope.toFixed(3)}`}
                displayMode
              />
              {mvtData.cPoint !== null && (
                <div>
                  <strong>Matchande inre punkt:</strong>{' '}
                  <KatexBlock latex={`c \\approx ${mvtData.cPoint.toFixed(3)} \\implies f'(c) = ${mvtPreset.df(mvtData.cPoint).toFixed(3)}`} />
                </div>
              )}
            </div>
          </div>

          <FunctionPlot2D
            title="Parallell korda och tangent enligt medelvärdessatsen"
            initialXRange={[-3.5, 4]}
            initialYRange={[-5, 6]}
            curves={[
              { fn: mvtPreset.fn, color: 'var(--svg-blue)', label: mvtPreset.label },
              {
                fn: (x) => mvtData.fa + mvtData.chordSlope * (x - safeA),
                color: 'var(--amber)',
                label: 'Korda mellan a och b',
                dashed: true,
              },
              ...(mvtData.cPoint !== null && mvtData.fc !== null
                ? [
                    {
                      fn: (x: number) =>
                        (mvtData.fc ?? 0) + mvtPreset.df(mvtData.cPoint ?? 0) * (x - (mvtData.cPoint ?? 0)),
                      color: 'var(--sage)',
                      label: 'Tangent i c',
                    },
                  ]
                : []),
            ]}
            points={[
              { x: safeA, y: mvtData.fa, color: 'var(--amber)', label: 'a' },
              { x: safeB, y: mvtData.fb, color: 'var(--amber)', label: 'b' },
              ...(mvtData.cPoint !== null && mvtData.fc !== null
                ? [{ x: mvtData.cPoint, y: mvtData.fc, color: 'var(--sage)', label: 'c' }]
                : []),
            ]}
          />
        </div>
      )}
    </div>
  );
};
