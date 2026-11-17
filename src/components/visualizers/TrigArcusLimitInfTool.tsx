import React, { useMemo, useState } from 'react';
import {
  analyzeLimitPreset,
  solveTrigEquation,
} from '../../math/index.ts';
import type { LimitPresetId, TrigFnKind } from '../../math/index.ts';
import { KatexBlock } from '../common/KatexBlock.tsx';
import { MathStepsDisplay } from '../common/MathStepsDisplay.tsx';
import { FunctionPlot2D } from './FunctionPlot2D.tsx';
import { UnitCircleExplorer } from './UnitCircleExplorer.tsx';

type SubTab = 'unitcircle' | 'trigeq' | 'arcus' | 'limitinf';

export const TrigArcusLimitInfTool: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('unitcircle');

  // --- Subtab 1: Trig ekvationslösare ---
  const [trigFn, setTrigFn] = useState<TrigFnKind>('sin');
  const [amp, setAmp] = useState(2);
  const [omega, setOmega] = useState(2);
  const [rhs, setRhs] = useState(1);

  const trigResult = useMemo(
    () => solveTrigEquation(trigFn, amp, omega, rhs, 0, 2 * Math.PI),
    [amp, omega, rhs, trigFn],
  );

  // --- Subtab 2: Arcusfunktioner ---
  const [arcThetaDeg, setArcThetaDeg] = useState(150);
  const arcThetaRad = (arcThetaDeg * Math.PI) / 180;
  const sinArc = Math.sin(arcThetaRad);
  const cosArc = Math.cos(arcThetaRad);
  const arcsinSin = Math.asin(sinArc);
  const arccosCos = Math.acos(cosArc);

  // --- Subtab 3: Gränsvärde då x -> ±∞ ---
  const [infPreset, setInfPreset] = useState<LimitPresetId>('sqrt_conjugate_inf');
  const [infK, setInfK] = useState(4);

  const infAnalysis = useMemo(() => analyzeLimitPreset(infPreset, infK), [infK, infPreset]);

  const sampleX = [10, 50, 200, 1000, 10000];

  return (
    <div className="section-stack">
      <div className="tool-subtabs">
        <button
          type="button"
          className={`seg-btn ${subTab === 'unitcircle' ? 'active' : ''}`}
          onClick={() => setSubTab('unitcircle')}
        >
          Enhetscirkeln & Arcus-utforskare
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'trigeq' ? 'active' : ''}`}
          onClick={() => setSubTab('trigeq')}
        >
          Trigonometrisk ekvationslösare
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'arcus' ? 'active' : ''}`}
          onClick={() => setSubTab('arcus')}
        >
          Arcusfunktionernas grafer
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'limitinf' ? 'active' : ''}`}
          onClick={() => setSubTab('limitinf')}
        >
          Gränsvärden då x → ±∞
        </button>
      </div>

      {subTab === 'unitcircle' && <UnitCircleExplorer />}

      {subTab === 'trigeq' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Lös <KatexBlock latex="A \cdot \text{trig}(\omega x) = C" /></h3>
              <p className="muted-text">
                Visar samtliga lösningar på <KatexBlock latex="[0, 2\pi]" /> samt den allmänna lösningsmängden.
              </p>
            </div>

            <div className="row-wrap" style={{ gap: '0.5rem' }}>
              {(['sin', 'cos', 'tan'] as TrigFnKind[]).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  className={`seg-btn ${trigFn === kind ? 'active' : ''}`}
                  onClick={() => setTrigFn(kind)}
                >
                  {kind}(ωx)
                </button>
              ))}
            </div>

            <div className="section-stack" style={{ gap: '0.55rem' }}>
              <label>
                <div className="space-between" style={{ fontSize: '0.88rem' }}>
                  <span>Amplitud A</span>
                  <strong>{amp}</strong>
                </div>
                <input
                  type="range"
                  className="range-slider"
                  min={1}
                  max={4}
                  step={0.5}
                  value={amp}
                  onChange={(e) => setAmp(Number(e.target.value))}
                />
              </label>

              <label>
                <div className="space-between" style={{ fontSize: '0.88rem' }}>
                  <span>Vinkelfrekvens ω</span>
                  <strong>{omega}</strong>
                </div>
                <input
                  type="range"
                  className="range-slider"
                  min={1}
                  max={4}
                  step={1}
                  value={omega}
                  onChange={(e) => setOmega(Number(e.target.value))}
                />
              </label>

              <label>
                <div className="space-between" style={{ fontSize: '0.88rem' }}>
                  <span>Högerled C</span>
                  <strong>{rhs}</strong>
                </div>
                <input
                  type="range"
                  className="range-slider"
                  min={-3}
                  max={3}
                  step={0.5}
                  value={rhs}
                  onChange={(e) => setRhs(Number(e.target.value))}
                />
              </label>
            </div>

            <div className={trigResult.value.hasSolution ? 'result-banner' : 'warn-box'}>
              <div style={{ marginBottom: '0.3rem' }}>
                <strong>{trigResult.summary}</strong>
              </div>
              <KatexBlock latex={trigResult.latexResult} displayMode />
              {trigResult.value.hasSolution && (
                <div className="muted-text" style={{ fontSize: '0.84rem' }}>
                  I [0, 2π]: {trigResult.value.solutions.map((s) => s.toFixed(3)).join(', ')}
                </div>
              )}
            </div>

            <MathStepsDisplay steps={trigResult.steps} defaultOpen />
          </div>

          <FunctionPlot2D
            title="Skärningar mellan y = A·trig(ωx) och y = C på [0, 2π]"
            piTicks
            initialXRange={[-0.3, 2 * Math.PI + 0.3]}
            initialYRange={[-4.5, 4.5]}
            curves={[
              {
                fn: (x) => {
                  if (trigFn === 'sin') return amp * Math.sin(omega * x);
                  if (trigFn === 'cos') return amp * Math.cos(omega * x);
                  return amp * Math.tan(omega * x);
                },
                color: 'var(--svg-blue)',
                label: `${amp}·${trigFn}(${omega}x)`,
              },
            ]}
            horizontalLines={[{ y: rhs, color: 'var(--amber)', label: `y = ${rhs}` }]}
            points={trigResult.value.solutions.map((xSol) => ({
              x: xSol,
              y: rhs,
              color: 'var(--sage)',
            }))}
          />
        </div>
      )}

      {subTab === 'arcus' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Arcusfunktionernas värdemängder & vanliga fällor</h3>
              <p className="muted-text">
                Testa varför <KatexBlock latex="\arcsin(\sin x)" /> inte alltid är lika med <KatexBlock latex="x" />!
              </p>
            </div>

            <label>
              <div className="space-between" style={{ fontSize: '0.88rem' }}>
                <span>Vinkel x</span>
                <strong>{arcThetaDeg}° ({arcThetaRad.toFixed(3)} rad)</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={-180}
                max={360}
                step={5}
                value={arcThetaDeg}
                onChange={(e) => setArcThetaDeg(Number(e.target.value))}
              />
            </label>

            <div className="row-wrap" style={{ gap: '0.35rem' }}>
              {[30, 120, 150, 210, 300].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setArcThetaDeg(deg)}
                >
                  {deg}°
                </button>
              ))}
            </div>

            <div className="result-banner section-stack" style={{ gap: '0.45rem' }}>
              <div>
                <strong>arcsin(sin(x)):</strong>{' '}
                <KatexBlock latex={`\\arcsin(\\sin(${arcThetaRad.toFixed(2)})) = ${arcsinSin.toFixed(3)}`} />{' '}
                <span className="muted-text">(ligger alltid i [-π/2, π/2])</span>
              </div>
              <div>
                <strong>arccos(cos(x)):</strong>{' '}
                <KatexBlock latex={`\\arccos(\\cos(${arcThetaRad.toFixed(2)})) = ${arccosCos.toFixed(3)}`} />{' '}
                <span className="muted-text">(ligger alltid i [0, π])</span>
              </div>
            </div>

            <div className="warn-box">
              <strong>Tentavarning:</strong> På Dugga och Tenta 4 är det en klassisk fälla att förenkla <KatexBlock latex="\arcsin(\sin(5\pi/6))" /> till <KatexBlock latex="5\pi/6" />. Eftersom <KatexBlock latex="5\pi/6 > \pi/2" /> blir svaret istället <KatexBlock latex="\pi - 5\pi/6 = \pi/6" />!
            </div>
          </div>

          <FunctionPlot2D
            title="Arcusfunktionerna arcsin(x), arccos(x) och arctan(x)"
            initialXRange={[-3.2, 3.2]}
            initialYRange={[-2, 3.5]}
            curves={[
              {
                fn: (x) => (x < -1 || x > 1 ? Number.NaN : Math.asin(x)),
                color: 'var(--svg-blue)',
                label: 'arcsin(x) ∈ [−π/2, π/2]',
              },
              {
                fn: (x) => (x < -1 || x > 1 ? Number.NaN : Math.acos(x)),
                color: 'var(--sage)',
                label: 'arccos(x) ∈ [0, π]',
              },
              {
                fn: Math.atan,
                color: 'var(--amber)',
                label: 'arctan(x) ∈ ]−π/2, π/2[',
              },
            ]}
            horizontalLines={[
              { y: Math.PI / 2, color: 'var(--svg-purple)', label: 'y = π/2' },
              { y: -Math.PI / 2, color: 'var(--svg-purple)', label: 'y = −π/2' },
            ]}
          />
        </div>
      )}

      {subTab === 'limitinf' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Gränsvärden då <KatexBlock latex="x \to \infty" /></h3>
              <p className="muted-text">
                Bryt ut högsta potens eller förläng med konjugatet — utan L’Hôpital.
              </p>
            </div>

            <div className="row-wrap" style={{ gap: '0.4rem' }}>
              <button
                type="button"
                className={`seg-btn ${infPreset === 'sqrt_conjugate_inf' ? 'active' : ''}`}
                onClick={() => setInfPreset('sqrt_conjugate_inf')}
              >
                √(x² + kx) − x (Konjugat)
              </button>
              <button
                type="button"
                className={`seg-btn ${infPreset === 'rational_inf' ? 'active' : ''}`}
                onClick={() => setInfPreset('rational_inf')}
              >
                Rationell funktion (Högsta potens)
              </button>
            </div>

            <label>
              <div className="space-between" style={{ fontSize: '0.88rem' }}>
                <span>Parameter k</span>
                <strong>{infK}</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={-6}
                max={8}
                step={1}
                value={infK}
                onChange={(e) => setInfK(Number(e.target.value) || 1)}
              />
            </label>

            <div className="result-banner">
              <KatexBlock
                latex={`\\lim_{${infAnalysis.targetLatex}} ${infAnalysis.exprLatex} = ${infAnalysis.limitValueLatex}`}
                displayMode
              />
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>x</th>
                  <th>f(x)</th>
                  <th>Avvikelse från L</th>
                </tr>
              </thead>
              <tbody>
                {sampleX.map((x) => {
                  const val = infAnalysis.fn(x);
                  return (
                    <tr key={x}>
                      <td>{x}</td>
                      <td>{Number.isFinite(val) ? val.toFixed(6) : '—'}</td>
                      <td>{Number.isFinite(val) ? Math.abs(val - infAnalysis.limitNumeric).toExponential(2) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <MathStepsDisplay steps={infAnalysis.steps} defaultOpen />
          </div>

          <FunctionPlot2D
            title="Horisontell asymptot då x växer"
            initialXRange={[-2, 40]}
            initialYRange={[-2, 8]}
            curves={[
              { fn: infAnalysis.fn, color: 'var(--svg-blue)', label: 'f(x)' },
            ]}
            horizontalLines={[
              {
                y: infAnalysis.limitNumeric,
                color: 'var(--sage)',
                label: `y = ${infAnalysis.limitNumeric}`,
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};
