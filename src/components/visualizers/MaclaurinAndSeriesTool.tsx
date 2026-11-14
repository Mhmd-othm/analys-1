import React, { useMemo, useState } from 'react';
import {
  Fraction,
  solveGeometricSeries,
  solveMaclaurin,
} from '../../math/index.ts';
import type { MaclaurinFnId } from '../../math/index.ts';
import { KatexBlock } from '../common/KatexBlock.tsx';
import { MathStepsDisplay } from '../common/MathStepsDisplay.tsx';
import { FunctionPlot2D } from './FunctionPlot2D.tsx';

type SubTab = 'maclaurin' | 'geometric';

interface MaclaurinMeta {
  id: MaclaurinFnId;
  label: string;
  fn: (x: number) => number;
  domainNote: string;
}

const SUB_DIGITS = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
const toSub = (n: number): string =>
  String(n)
    .split('')
    .map((ch) => SUB_DIGITS[Number(ch)] ?? ch)
    .join('');

const MACLAURIN_OPTIONS: MaclaurinMeta[] = [
  { id: 'exp', label: 'eˣ', fn: Math.exp, domainNote: 'Konvergerar för alla x ∈ ℝ' },
  { id: 'sin', label: 'sin(x)', fn: Math.sin, domainNote: 'Konvergerar för alla x ∈ ℝ' },
  { id: 'cos', label: 'cos(x)', fn: Math.cos, domainNote: 'Konvergerar för alla x ∈ ℝ' },
  {
    id: 'ln1px',
    label: 'ln(1 + x)',
    fn: (x) => (x <= -1 ? Number.NaN : Math.log(1 + x)),
    domainNote: 'Konvergerar på ]−1, 1]',
  },
  { id: 'arctan', label: 'arctan(x)', fn: Math.atan, domainNote: 'Konvergerar på [−1, 1]' },
  {
    id: 'geom',
    label: '1 / (1 − x)',
    fn: (x) => (Math.abs(1 - x) < 1e-4 ? Number.NaN : 1 / (1 - x)),
    domainNote: 'Konvergerar på ]−1, 1[',
  },
];

export const MaclaurinAndSeriesTool: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('maclaurin');

  // --- Subtab 1: Maclaurinapproximator ---
  const [macId, setMacId] = useState<MaclaurinFnId>('sin');
  const [order, setOrder] = useState(5);
  const [testX, setTestX] = useState(1.0);

  const macMeta = useMemo(
    () => MACLAURIN_OPTIONS.find((m) => m.id === macId) ?? MACLAURIN_OPTIONS[0],
    [macId],
  );
  const macVal = useMemo(() => solveMaclaurin(macId, order), [macId, order]);

  const exactAtTest = macMeta.fn(testX);
  const approxAtTest = macVal.evaluate(testX);
  const absError = Number.isFinite(exactAtTest) ? Math.abs(exactAtTest - approxAtTest) : Number.NaN;

  // --- Subtab 2: Geometrisk serie ---
  const [a0Input, setA0Input] = useState('3');
  const [rInput, setRInput] = useState('1/2');

  const seriesCalc = useMemo(() => {
    const fa0 = Fraction.tryFromInput(a0Input);
    const fr = Fraction.tryFromInput(rInput);
    if (!fa0 || !fr) {
      return { ok: false as const, error: 'Ange giltiga bråk eller heltal för a₀ och kvoten r (t.ex. 3 och -1/2).' };
    }
    return { ok: true as const, res: solveGeometricSeries(fa0, fr, 8) };
  }, [a0Input, rInput]);

  return (
    <div className="section-stack">
      <div className="tool-subtabs">
        <button
          type="button"
          className={`seg-btn ${subTab === 'maclaurin' ? 'active' : ''}`}
          onClick={() => setSubTab('maclaurin')}
        >
          Maclaurinpolynom &amp; feluppskattning
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'geometric' ? 'active' : ''}`}
          onClick={() => setSubTab('geometric')}
        >
          Geometrisk serie &amp; delsummor
        </button>
      </div>

      {subTab === 'maclaurin' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Maclaurinutveckling av grad <KatexBlock latex="n" /></h3>
              <p className="muted-text">
                Se hur Taylor-/Maclaurinpolynomet av grad <KatexBlock latex="n" /> smiter åt funktionen nära <KatexBlock latex="x = 0" />.
              </p>
            </div>

            <div className="row-wrap" style={{ gap: '0.35rem' }}>
              {MACLAURIN_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`seg-btn ${macId === opt.id ? 'active' : ''}`}
                  onClick={() => setMacId(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <label>
              <div className="space-between" style={{ fontSize: '0.88rem' }}>
                <span>Polynomgrad n</span>
                <strong>{order}</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={0}
                max={9}
                step={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </label>

            <label>
              <div className="space-between" style={{ fontSize: '0.88rem' }}>
                <span>Testpunkt x</span>
                <strong>{testX.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={-1.8}
                max={1.8}
                step={0.1}
                value={testX}
                onChange={(e) => setTestX(Number(e.target.value))}
              />
            </label>

            <div className="formula-box">
              <KatexBlock
                latex={`f(x) = ${macVal.polynomialLatex} + \\mathcal{O}(x^{${macVal.remainderOrder}})`}
                displayMode
              />
              <div className="muted-text" style={{ fontSize: '0.84rem' }}>
                {macMeta.domainNote}
              </div>
            </div>

            <div className="result-banner section-stack" style={{ gap: '0.25rem' }}>
              <div>
                <strong>Exakt f({testX.toFixed(2)}):</strong>{' '}
                {Number.isFinite(exactAtTest) ? exactAtTest.toFixed(6) : 'odefinierad'}
              </div>
              <div>
                <strong>Polynom <KatexBlock latex={`P_{${order}}(${testX.toFixed(2)})`} />:</strong>{' '}
                {approxAtTest.toFixed(6)}
              </div>
              <div>
                <strong>Absolutfel <KatexBlock latex={`|R_{${order}}(x)|`} />:</strong>{' '}
                {Number.isFinite(absError) ? absError.toExponential(3) : '—'}
              </div>
            </div>
          </div>

          <FunctionPlot2D
            title="Funktion f(x) vs Maclaurinpolynom Pₙ(x)"
            initialXRange={[-3, 3]}
            initialYRange={[-3, 4]}
            curves={[
              { fn: macMeta.fn, color: 'var(--svg-blue)', label: `Exakt: ${macMeta.label}` },
              {
                fn: macVal.evaluate,
                color: 'var(--amber)',
                label: `Maclaurin P${toSub(order)}(x)`,
                dashed: true,
              },
            ]}
            points={[
              ...(Number.isFinite(exactAtTest)
                ? [{ x: testX, y: exactAtTest, color: 'var(--svg-blue)', label: 'f(x)' }]
                : []),
              { x: testX, y: approxAtTest, color: 'var(--amber)', label: `P${toSub(order)}(x)` },
            ]}
          />
        </div>
      )}

      {subTab === 'geometric' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Geometrisk serie <KatexBlock latex="\sum_{k=0}^{\infty} a_0 r^k" /></h3>
              <p className="muted-text">
                Konvergerar om och endast om <KatexBlock latex="|r| < 1" /> (då <KatexBlock latex="a_0 \neq 0" />).
              </p>
            </div>

            <div className="row-wrap" style={{ gap: '0.75rem' }}>
              <label>
                <span className="muted-text" style={{ fontSize: '0.82rem', display: 'block' }}>Första term a₀</span>
                <input
                  className="num-input"
                  style={{ width: '5.5rem' }}
                  value={a0Input}
                  onChange={(e) => setA0Input(e.target.value)}
                />
              </label>
              <label>
                <span className="muted-text" style={{ fontSize: '0.82rem', display: 'block' }}>Kvot r</span>
                <input
                  className="num-input"
                  style={{ width: '5.5rem' }}
                  value={rInput}
                  onChange={(e) => setRInput(e.target.value)}
                />
              </label>
            </div>

            <div className="row-wrap" style={{ gap: '0.35rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setA0Input('3'); setRInput('1/2'); }}
              >
                Konvergent (r = 1/2)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setA0Input('4'); setRInput('-1/3'); }}
              >
                Alternerande (r = −1/3)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setA0Input('2'); setRInput('1.1'); }}
              >
                Divergent (r = 1,1)
              </button>
            </div>

            {!seriesCalc.ok ? (
              <div className="warn-box">{seriesCalc.error}</div>
            ) : (
              <>
                <div className={seriesCalc.res.value.converges ? 'feedback-correct' : 'warn-box'}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>{seriesCalc.res.summary}</strong>
                  </div>
                  <KatexBlock latex={seriesCalc.res.latexResult} displayMode />
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>n</th>
                      <th>Term a₀rⁿ</th>
                      <th>Delsumma Sₙ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seriesCalc.res.value.partialSums.map((row) => (
                      <tr key={row.n}>
                        <td>{row.n}</td>
                        <td>{row.term.toFixed(4)}</td>
                        <td><strong>{row.sum.toFixed(4)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <MathStepsDisplay steps={seriesCalc.res.steps} defaultOpen />
              </>
            )}
          </div>

          <div className="svg-card section-stack">
            <h3 style={{ fontSize: '0.96rem' }}>Delsummor Sₙ jämfört med gränsvärdet S</h3>
            {seriesCalc.ok ? (
              (() => {
                const res = seriesCalc.res;
                const rows = res.value.partialSums;
                const limitVal = res.value.sum ? res.value.sum.toNumber() : null;
                const allVals = rows.map((r) => r.sum).concat(limitVal !== null ? [limitVal] : []);
                const minV = Math.min(0, ...allVals);
                const maxV = Math.max(1, ...allVals);
                const span = Math.max(0.5, maxV - minV);
                const w = 520;
                const h = 300;
                const pad = 34;
                const toY = (v: number) => h - pad - ((v - minV) / span) * (h - 2 * pad);
                const zeroY = toY(0);
                const barW = (w - 2 * pad) / rows.length - 8;

                return (
                  <svg
                    viewBox={`0 0 ${w} ${h}`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      background: 'var(--svg-bg)',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                    }}
                    role="img"
                    aria-label="Delsummor för geometrisk serie"
                  >
                    <line x1={pad} y1={zeroY} x2={w - pad} y2={zeroY} stroke="var(--svg-axis)" strokeWidth={1.4} />
                    {limitVal !== null && (
                      <g>
                        <line
                          x1={pad}
                          y1={toY(limitVal)}
                          x2={w - pad}
                          y2={toY(limitVal)}
                          stroke="var(--sage)"
                          strokeWidth={2}
                          strokeDasharray="6 4"
                        />
                        <text x={w - pad} y={toY(limitVal) - 6} fontSize={11} fontWeight={600} textAnchor="end" fill="var(--sage)">
                          S = {limitVal.toFixed(3)}
                        </text>
                      </g>
                    )}
                    {rows.map((row, idx) => {
                      const bx = pad + idx * ((w - 2 * pad) / rows.length) + 4;
                      const by = toY(row.sum);
                      const rectY = Math.min(by, zeroY);
                      const rectH = Math.max(2, Math.abs(zeroY - by));
                      return (
                        <g key={row.n}>
                          <rect
                            x={bx}
                            y={rectY}
                            width={barW}
                            height={rectH}
                            rx={4}
                            fill="var(--svg-blue)"
                            opacity={0.82}
                          />
                          <text
                            x={bx + barW / 2}
                            y={h - 10}
                            fontSize={11}
                            textAnchor="middle"
                            fill="var(--text-muted)"
                          >
                            S<tspan dy="2.5" fontSize="8.5">{row.n}</tspan>
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()
            ) : (
              <p className="muted-text">Korrigera inmatningen för att visa delsummorna.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
